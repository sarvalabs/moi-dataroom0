import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/auth-admin";
import { extractText, embedAndStore } from "@/lib/embeddings";

/**
 * POST /api/documents/reembed
 * Body: { documentId: string }   — re-embed a single document
 * Body: { all: true }            — re-embed ALL documents that don't have status "completed"
 */
export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const admin = createAdminClient();

  // Single document re-embed
  if (body.documentId) {
    const result = await reembedDocument(admin, body.documentId);
    return NextResponse.json(result, { status: result.error ? 500 : 200 });
  }

  // Bulk re-embed: all docs that aren't "completed"
  if (body.all) {
    const { data: docs, error } = await admin
      .from("documents")
      .select("id, title, file_url, file_type, embedding_status")
      .not("file_url", "is", null);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const toEmbed = (docs ?? []).filter(
      (d) => d.embedding_status !== "completed"
    );

    // Fire them all off in the background and return immediately
    const results: { id: string; title: string; status: string }[] = [];

    for (const doc of toEmbed) {
      const result = await reembedDocument(admin, doc.id);
      results.push({
        id: doc.id,
        title: doc.title,
        status: result.error ? "failed" : "completed",
      });
    }

    return NextResponse.json({ processed: results.length, results });
  }

  return NextResponse.json(
    { error: "Provide { documentId } or { all: true }" },
    { status: 400 }
  );
}

async function reembedDocument(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  documentId: string
): Promise<{ documentId: string; chunks?: number; error?: string }> {
  // Get the document
  const { data: doc, error: fetchErr } = await admin
    .from("documents")
    .select("id, title, file_url, file_type")
    .eq("id", documentId)
    .single();

  if (fetchErr || !doc) {
    return { documentId, error: fetchErr?.message ?? "Document not found" };
  }

  if (!doc.file_url) {
    return { documentId, error: "No file_url on document" };
  }

  // Mark as processing
  await admin
    .from("documents")
    .update({ embedding_status: "processing", embedding_error: null })
    .eq("id", documentId);

  try {
    // Delete old embeddings first
    await admin
      .from("document_embeddings")
      .delete()
      .eq("document_id", documentId);

    // Download from storage
    const { data: fileData, error: dlErr } = await admin.storage
      .from("investor-docs")
      .download(doc.file_url);

    if (dlErr || !fileData) {
      throw new Error(
        `Download failed: ${dlErr?.message ?? "No data returned"}`
      );
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());
    const text = await extractText(buffer, doc.file_type ?? "PDF");

    if (!text.trim()) {
      throw new Error("No text extracted from document");
    }

    const count = await embedAndStore(documentId, text);
    if (count === 0) {
      throw new Error("0 chunks embedded — possible API or extraction issue");
    }

    await admin
      .from("documents")
      .update({ embedding_status: "completed", embedding_error: null })
      .eq("id", documentId);

    return { documentId, chunks: count };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await admin
      .from("documents")
      .update({ embedding_status: "failed", embedding_error: message })
      .eq("id", documentId);
    return { documentId, error: message };
  }
}
