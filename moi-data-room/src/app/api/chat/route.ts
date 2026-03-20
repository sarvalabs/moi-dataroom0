import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

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

Tone:
- Warm, clear, and confident.
- Sound like a knowledgeable team member, not a marketing brochure.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages } = body as { messages: { role: string; content: string }[] };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }

    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const lastContent = lastUser?.content?.trim();
    if (!lastContent) {
      return NextResponse.json(
        { error: "No user message found" },
        { status: 400 }
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
    if (embedding.length > 0) {
      try {
        const admin = createAdminClient();
        const { data: rows } = await admin.rpc("match_document_embeddings", {
          query_embedding: JSON.stringify(embedding),
          match_count: 8,
        });
        if (Array.isArray(rows)) {
          chunks = rows
            .filter((r: { similarity?: number }) => (r.similarity ?? 0) >= 0.3)
            .map((r: { content?: string; document_title?: string }) => {
              const content = r.content ?? "";
              if (!content) return "";
              const label = r.document_title ?? "Unknown Document";
              return `[Excerpt from: ${label}]\n${content}`;
            })
            .filter(Boolean);
        }
      } catch (e) {
        console.error("Supabase RPC error:", e);
      }
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey || anthropicKey.startsWith("your_")) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured" },
        { status: 503 }
      );
    }

    // Build context from chunks, like the working MOI website
    const context = chunks.length > 0
      ? chunks.join("\n\n---\n\n")
      : "(No relevant excerpts found in the data room documents.)";

    // Inject context into the last user message with <context> tags
    const recentHistory = messages.slice(-10).map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: m.content,
    }));

    // Replace the last user message with context-wrapped version
    const lastIdx = recentHistory.length - 1;
    recentHistory[lastIdx] = {
      role: "user" as const,
      content: `<context>\n${context}\n</context>\n\nUser question: ${lastContent}`,
    };

    const anthropic = new Anthropic({ apiKey: anthropicKey });
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
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
