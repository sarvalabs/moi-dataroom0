import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are an AI assistant for the MOI Protocol investor data room. MOI is a contextual compute network — a blockchain with a novel execution architecture built around interactions (not transactions), TESSERACTs (stateful containers), and the CoCo programming language.

Key metrics: 4.3K accounts, 14.4K interactions, 100 active consensus nodes, 50K+ community, $79M KMOI TVL.

Use the following document excerpts to answer the investor's question. If the answer isn't in the excerpts, say so honestly and suggest which section of the data room might help.

FORMATTING RULES — your response will be rendered as Markdown in a chat widget:
- Always use proper Markdown syntax: **bold**, *italic*, \`code\`, ## headings, etc.
- For bullet points, always use "- " (dash + space) on its own line — never use inline "•" characters.
- For numbered lists, use "1. " on its own line.
- Keep responses concise and well-structured. Use headings for sections.
- Use bold for key terms, metrics, and important values.
- When referring to data room sections, bold the section name (e.g. **Tokenomics**, **Engineering**).

---
{chunks}
---`;

export async function POST(request: Request) {
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
    } catch {
      // Continue without embeddings if OpenAI call fails
    }
  }

  let chunks: string[] = [];
  if (embedding.length > 0) {
    try {
      const admin = createAdminClient();
      const { data: rows } = await admin.rpc("match_document_embeddings", {
        query_embedding: embedding,
        match_count: 5,
      });
      if (Array.isArray(rows)) {
        chunks = rows.map((r: { content?: string }) => r.content ?? "").filter(Boolean);
      }
    } catch {
      // RPC may not exist yet; continue without RAG context
    }
  }

  const systemContent = SYSTEM_PROMPT.replace(
    "{chunks}",
    chunks.length > 0 ? chunks.join("\n\n") : "(No relevant excerpts found. Rely on your knowledge of MOI Protocol.)"
  );

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey || anthropicKey.startsWith("your_")) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured" },
      { status: 503 }
    );
  }

  const anthropic = new Anthropic({ apiKey: anthropicKey });
  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: systemContent,
    messages: messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    })),
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
}
