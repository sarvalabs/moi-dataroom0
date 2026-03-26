import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/auth-admin";
import { extractText, embedAndStore } from "@/lib/embeddings";
import { normalizeExternalUrl } from "@/lib/external-url";
import { isHeroCardId } from "@/lib/constants";
import { clearOtherDocumentsHeroSlot } from "@/lib/documents-hero-slot";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const admin = createAdminClient();
  const isAdmin = await isAdminRequest(request);

  let query = admin.from("documents").select("*").order("created_at", { ascending: false });
  if (!isAdmin) query = query.eq("status", "published");
  if (category) query = query.eq("category", category);

  const { data: documents, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Compute view counts from analytics table
  const docIds = (documents ?? []).map((d: { id: string }) => d.id);
  let viewCounts: Record<string, number> = {};
  if (docIds.length > 0) {
    const { data: analytics } = await admin
      .from("analytics")
      .select("document_id")
      .in("document_id", docIds);
    if (analytics) {
      for (const row of analytics) {
        viewCounts[row.document_id] = (viewCounts[row.document_id] ?? 0) + 1;
      }
    }
  }

  const enriched = (documents ?? []).map((doc: { id: string }) => ({
    ...doc,
    view_count: viewCounts[doc.id] ?? 0,
  }));

  return NextResponse.json(enriched);
}

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json();
  const {
    title,
    description,
    category,
    file_url,
    external_url: rawExternal,
    file_type,
    status,
    allow_download,
    home_hero_slot: rawHomeSlot,
  } = body;
  if (!title || !category) {
    return NextResponse.json({ error: "title and category required" }, { status: 400 });
  }

  const filePath =
    typeof file_url === "string" && file_url.trim() ? file_url.trim() : null;
  const externalUrl =
    typeof rawExternal === "string" ? normalizeExternalUrl(rawExternal) : null;

  if (!filePath && !externalUrl) {
    return NextResponse.json(
      { error: "Provide file_url (after upload) or a valid external_url (https://…)" },
      { status: 400 }
    );
  }

  const resolvedFileType = filePath
    ? (file_type ?? "PDF")
    : typeof file_type === "string" && file_type.trim()
      ? file_type.trim()
      : "Link";

  let homeHeroSlot: string | null = null;
  if (rawHomeSlot !== undefined && rawHomeSlot !== null && String(rawHomeSlot).trim() !== "") {
    const slot = String(rawHomeSlot).trim();
    if (!isHeroCardId(slot)) {
      return NextResponse.json({ error: "Invalid home_hero_slot" }, { status: 400 });
    }
    homeHeroSlot = slot;
  }

  const admin = createAdminClient();
  if (homeHeroSlot) {
    await clearOtherDocumentsHeroSlot(admin, homeHeroSlot);
  }

  const { data, error } = await admin
    .from("documents")
    .insert({
      title,
      description: description ?? null,
      category,
      file_url: filePath,
      external_url: externalUrl,
      file_type: resolvedFileType,
      status: status ?? "published",
      allow_download: allow_download ?? true,
      show_on_overview: !!homeHeroSlot,
      home_hero_slot: homeHeroSlot,
      uploaded_by: null,
      embedding_status: filePath ? "pending" : "completed",
      embedding_error: null,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Trigger embedding in the background — storage file only
  if (data && filePath) {
    embedDocument(data.id, filePath, resolvedFileType).catch((err) =>
      console.error("Embedding failed for document", data.id, err)
    );
  }

  return NextResponse.json(data);
}

async function embedDocument(
  documentId: string,
  fileUrl: string,
  fileType: string
) {
  const admin = createAdminClient();

  // Mark as processing
  await admin
    .from("documents")
    .update({ embedding_status: "processing", embedding_error: null })
    .eq("id", documentId);

  try {
    const { data: fileData, error: downloadError } = await admin.storage
      .from("investor-docs")
      .download(fileUrl);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download file: ${downloadError?.message ?? "No data returned"}`);
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());
    const text = await extractText(buffer, fileType);

    if (!text.trim()) {
      throw new Error("No text could be extracted from the document");
    }

    const count = await embedAndStore(documentId, text);
    if (count === 0) {
      throw new Error("Embedding generated 0 chunks — possible extraction or API issue");
    }

    // Mark as completed
    await admin
      .from("documents")
      .update({ embedding_status: "completed", embedding_error: null })
      .eq("id", documentId);

    console.log(`Embedded ${count} chunks for document ${documentId}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown embedding error";
    console.error("Embedding failed for document", documentId, message);

    // Mark as failed with error details
    await admin
      .from("documents")
      .update({ embedding_status: "failed", embedding_error: message })
      .eq("id", documentId);
  }
}
