import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.json();
  const { documentId } = body;

  if (!documentId) {
    return NextResponse.json(
      { error: "documentId is required" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { data: doc, error: docError } = await admin
    .from("documents")
    .select("file_url")
    .eq("id", documentId)
    .eq("status", "published")
    .single();

  if (docError || !doc?.file_url) {
    return NextResponse.json(
      { error: "Document not found or no file" },
      { status: 404 }
    );
  }

  const { data: signed, error: signError } = await admin.storage
    .from("investor-docs")
    .createSignedUrl(doc.file_url, 60);

  if (signError || !signed?.signedUrl) {
    return NextResponse.json(
      { error: "Failed to create download URL" },
      { status: 500 }
    );
  }

  await admin.from("analytics").insert({
    document_id: documentId,
    user_id: null,
    action: "view",
  });

  return NextResponse.json({ url: signed.signedUrl });
}
