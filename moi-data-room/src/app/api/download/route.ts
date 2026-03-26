import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.json();
  const { documentId, preferFile } = body;
  const useFile = preferFile === true;

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

  const filePath = doc.file_url?.trim();
  const external = doc.external_url?.trim();

  async function logView() {
    await admin.from("analytics").insert({
      document_id: documentId,
      user_id: null,
      action: "view",
    });
  }

  /** In-app PDF viewer: signed storage file when present. */
  if (useFile && filePath) {
    const { data: signed, error: signError } = await admin.storage
      .from("investor-docs")
      .createSignedUrl(filePath, 60);

    if (signError || !signed?.signedUrl) {
      return NextResponse.json(
        { error: "Failed to create download URL" },
        { status: 500 }
      );
    }

    await logView();

    return NextResponse.json({
      url: signed.signedUrl,
      allowDownload: doc.allow_download ?? true,
      fileType: doc.file_type ?? "PDF",
      isExternal: false,
      canonicalUrl: external || undefined,
    });
  }

  /** Default open from lists / home: Zenodo or public page when set, else file. */
  if (external) {
    await logView();

    return NextResponse.json({
      url: external,
      allowDownload: doc.allow_download ?? true,
      fileType: doc.file_type ?? "Link",
      isExternal: true,
    });
  }

  if (!filePath) {
    return NextResponse.json(
      { error: "Document has no file or link" },
      { status: 404 }
    );
  }

  const { data: signed, error: signError } = await admin.storage
    .from("investor-docs")
    .createSignedUrl(filePath, 60);

  if (signError || !signed?.signedUrl) {
    return NextResponse.json(
      { error: "Failed to create download URL" },
      { status: 500 }
    );
  }

  await logView();

  return NextResponse.json({
    url: signed.signedUrl,
    allowDownload: doc.allow_download ?? true,
    fileType: doc.file_type ?? "PDF",
    isExternal: false,
  });
}
