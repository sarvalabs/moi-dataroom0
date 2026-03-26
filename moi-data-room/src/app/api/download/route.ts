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
    .select("file_url, external_url, allow_download, file_type")
    .eq("id", documentId)
    .eq("status", "published")
    .single();

  if (docError || !doc) {
    return NextResponse.json(
      { error: "Document not found" },
      { status: 404 }
    );
  }

  const external = doc.external_url?.trim();
  if (external) {
    await admin.from("analytics").insert({
      document_id: documentId,
      user_id: null,
      action: "view",
    });

    return NextResponse.json({
      url: external,
      allowDownload: doc.allow_download ?? true,
      fileType: doc.file_type ?? "Link",
      isExternal: true,
    });
  }

  if (!doc.file_url) {
    return NextResponse.json(
      { error: "Document has no file or link" },
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

  return NextResponse.json({
    url: signed.signedUrl,
    allowDownload: doc.allow_download ?? true,
    fileType: doc.file_type ?? "PDF",
    isExternal: false,
  });
}
