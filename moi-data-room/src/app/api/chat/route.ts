import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { getClientIP } from "@/lib/rate-limit";
import {
  checkClaudeBudget,
  recordTokenUsage,
  MAX_INPUT_TOKENS_PER_REQUEST,
  MAX_OUTPUT_TOKENS,
} from "@/lib/claude-budget";

const SYSTEM_PROMPT = `You are MOI Assistant, an expert on the MOI protocol and its investor data room.

You answer questions using ONLY the provided context from MOI's official documents. If the context does not contain enough information, say so clearly instead of guessing.

Style rules:
- Default to concise answers.
- For broad intro questions like "What is MOI?", answer in 2 short paragraphs maximum.
- Start with a plain-English definition in the first sentence.
- Do not use headings unless the user asks for a detailed breakdown.
- Do not use more than 3 bullets unless the user explicitly asks for a list.
- Avoid repeating the same idea in slightly different words.
- Use simple language first, then add technical detail only if the user asks for it.
- Lead with what MOI does for participants (people, businesses, AI agents), not internal implementation details like TESSERACTs or CoCo unless the user specifically asks.
- Prioritize the "why it matters" over the "how it works" unless asked for technical depth.
- If asked about something outside MOI, politely redirect.
- Use markdown only when it improves readability.

Document linking:
- When you reference information from a specific document, link to it inline using the provided document URLs.
- For example, write "as described in the [Litepaper](/doc/abc-123)" — naturally weave the link into your sentence.
- Do NOT list sources at the bottom. Embed the links naturally within the text.
- Only link a document once per response — the first time you mention it.

Tone:
- Warm, clear, and confident.
- Sound like a knowledgeable team member, not a marketing brochure.`;

export async function POST(request: Request) {
  try {
    // Layer 1 (IP rate limiting) is now handled globally in middleware.ts
    const clientIP = getClientIP(request);

    const body = await request.json();
    const { messages } = body as { messages: { role: string; content: string }[] };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }

    // --- Input validation: cap message count and individual message length ---
    if (messages.length > 50) {
      return NextResponse.json(
        { error: "Too many messages (max 50)" },
        { status: 400 }
      );
    }
    for (const msg of messages) {
      if (typeof msg.content !== "string" || msg.content.length > 5000) {
        return NextResponse.json(
          { error: "Each message must be at most 5000 characters" },
          { status: 400 }
        );
      }
    }

    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const lastContent = lastUser?.content?.trim();
    if (!lastContent) {
      return NextResponse.json(
        { error: "No user message found" },
        { status: 400 }
      );
    }

    // --- Layer 2: Claude-specific budget guard (per-IP hourly + global daily token cap) ---
    const budgetCheck = checkClaudeBudget(clientIP);
    if (!budgetCheck.allowed) {
      return NextResponse.json(
        { error: budgetCheck.reason },
        {
          status: 429,
          headers: budgetCheck.retryAfter
            ? { "Retry-After": String(budgetCheck.retryAfter) }
            : {},
        }
      );
    }

    let embedding: number[] = [];
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey && !openaiKey.startsWith("your_")) {
      try {
        const openai = new OpenAI({ apiKey: openaiKey });
        const res = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: lastContent,
        });
        embedding = res.data[0].embedding;
      } catch (e) {
        console.error("OpenAI embedding error:", e);
      }
    }

    let chunks: string[] = [];
    const docMap = new Map<string, string>(); // docId -> title

    if (embedding.length > 0) {
      try {
        const admin = createAdminClient();
        const { data: rows } = await admin.rpc("match_document_embeddings", {
          query_embedding: JSON.stringify(embedding),
          match_count: 8,
        });
        if (Array.isArray(rows)) {
          const filtered = rows.filter(
            (r: { similarity?: number }) => (r.similarity ?? 0) >= 0.3
          );
          for (const r of filtered) {
            const content = (r as { content?: string }).content ?? "";
            if (!content) continue;
            const docId = (r as { document_id?: string }).document_id ?? "";
            const docTitle =
              (r as { document_title?: string }).document_title ??
              "Unknown Document";

            chunks.push(`[Excerpt from: ${docTitle}]\n${content}`);

            if (docId && !docMap.has(docId)) {
              docMap.set(docId, docTitle);
            }
          }
        }
      } catch (e) {
        console.error("Supabase RPC error:", e);
      }
    }

    // Log the chat query for analytics (fire-and-forget)
    void createAdminClient()
      .from("chat_queries")
      .insert({ question: lastContent, chunks_found: chunks.length })
      .then(() => {});

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey || anthropicKey.startsWith("your_")) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured" },
        { status: 503 }
      );
    }

    // Build context from chunks
    const context =
      chunks.length > 0
        ? chunks.join("\n\n---\n\n")
        : "(No relevant excerpts found in the data room documents.)";

    // Build document link reference for Claude
    const docLinks = Array.from(docMap.entries())
      .map(([id, title]) => `- "${title}" → link: [${title}](/doc/${id})`)
      .join("\n");

    const docLinkInstruction = docLinks
      ? `\n\nAvailable document links (use these exact markdown links when referencing a document):\n${docLinks}`
      : "";

    // Inject context into the last user message
    const recentHistory = messages
      .slice(-10)
      .map((m: { role: string; content: string }) => ({
        role:
          m.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: m.content,
      }));

    const lastIdx = recentHistory.length - 1;
    recentHistory[lastIdx] = {
      role: "user" as const,
      content: `<context>\n${context}\n</context>${docLinkInstruction}\n\nUser question: ${lastContent}`,
    };

    const anthropic = new Anthropic({ apiKey: anthropicKey });
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: MAX_OUTPUT_TOKENS,
      system: SYSTEM_PROMPT,
      messages: recentHistory,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              "delta" in event &&
              event.delta &&
              typeof event.delta === "object" &&
              "type" in event.delta &&
              event.delta.type === "text_delta" &&
              "text" in event.delta
            ) {
              const text = (event.delta as { text?: string }).text ?? "";
              if (text) controller.enqueue(encoder.encode(text));
            }
          }

          // --- Layer 2 continued: Record token usage after stream completes ---
          const finalMessage = await stream.finalMessage();
          recordTokenUsage(
            finalMessage.usage?.input_tokens ?? 0,
            finalMessage.usage?.output_tokens ?? 0
          );

          controller.close();
        } catch (err) {
          console.error("Anthropic stream error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    console.error("Chat route error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
