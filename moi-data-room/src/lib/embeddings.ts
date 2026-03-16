import OpenAI from "openai";
import { createAdminClient } from "@/lib/supabase/admin";

const CHUNK_SIZE = 500; // ~500 tokens per chunk
const CHUNK_OVERLAP = 50;

/**
 * Split text into overlapping chunks by character count.
 * Tries to break on paragraph/sentence boundaries when possible.
 */
export function chunkText(text: string): string[] {
  const cleaned = text.replace(/\n{3,}/g, "\n\n").trim();
  if (!cleaned) return [];

  const chunks: string[] = [];
  let start = 0;

  while (start < cleaned.length) {
    let end = start + CHUNK_SIZE;

    if (end >= cleaned.length) {
      chunks.push(cleaned.slice(start).trim());
      break;
    }

    // Try to break at paragraph, then sentence, then word boundary
    const slice = cleaned.slice(start, end + 100);
    const paraBreak = slice.lastIndexOf("\n\n", CHUNK_SIZE);
    const sentenceBreak = slice.lastIndexOf(". ", CHUNK_SIZE);
    const wordBreak = slice.lastIndexOf(" ", CHUNK_SIZE);

    if (paraBreak > CHUNK_SIZE * 0.5) {
      end = start + paraBreak + 2;
    } else if (sentenceBreak > CHUNK_SIZE * 0.5) {
      end = start + sentenceBreak + 2;
    } else if (wordBreak > CHUNK_SIZE * 0.5) {
      end = start + wordBreak + 1;
    }

    chunks.push(cleaned.slice(start, end).trim());
    start = end - CHUNK_OVERLAP;
  }

  return chunks.filter((c) => c.length > 20);
}

/**
 * Generate embeddings for text chunks and store them in Supabase.
 */
export async function embedAndStore(
  documentId: string,
  text: string
): Promise<number> {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    console.warn("OPENAI_API_KEY not set — skipping embeddings");
    return 0;
  }

  const chunks = chunkText(text);
  if (chunks.length === 0) return 0;

  const openai = new OpenAI({ apiKey: openaiKey });
  const supabase = createAdminClient();

  // Embed in batches of 20
  const BATCH_SIZE = 20;
  let stored = 0;

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);

    const embeddingRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: batch,
    });

    const rows = embeddingRes.data.map((item, idx) => ({
      document_id: documentId,
      content: batch[idx],
      embedding: JSON.stringify(item.embedding),
      chunk_index: i + idx,
    }));

    const { error } = await supabase.from("document_embeddings").insert(rows);
    if (error) {
      console.error("Failed to insert embeddings batch:", error.message);
    } else {
      stored += rows.length;
    }
  }

  return stored;
}

/**
 * Extract text from a file buffer based on its type.
 */
export async function extractText(
  buffer: Buffer,
  fileType: string
): Promise<string> {
  const lower = fileType.toLowerCase();

  if (lower === "pdf" || lower === "application/pdf") {
    // pdf-parse v1 exports a function directly
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
    const result = await pdfParse(buffer);
    return result.text;
  }

  if (
    lower === "docx" ||
    lower === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (
    lower === "pptx" ||
    lower === "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ) {
    // Basic PPTX text extraction via mammoth fallback — limited but functional
    // For full PPTX support, a dedicated library would be needed
    try {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch {
      console.warn("PPTX extraction failed — mammoth does not support PPTX");
      return "";
    }
  }

  return "";
}
