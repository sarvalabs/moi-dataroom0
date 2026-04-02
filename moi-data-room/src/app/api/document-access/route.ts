import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json();
  const { documentId, email } = body as { documentId?: string; email?: string };

  if (!documentId || !email?.trim()) {
    return NextResponse.json(
      { error: "documentId and email are required" },
      { status: 400 },
    );
  }

  const trimmedEmail = email.trim().toLowerCase();
  if (!EMAIL_RE.test(trimmedEmail)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: doc, error: docError } = await admin
    .from("documents")
    .select("file_url, external_url, allow_download, require_email, file_type")
    .eq("id", documentId)
    .eq("status", "published")
    .single();

  if (docError || !doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  if (!doc.require_email) {
    return NextResponse.json(
      { error: "This document does not require email access" },
      { status: 400 },
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null;

  await admin.from("document_leads").insert({
    document_id: documentId,
    email: trimmedEmail,
    ip_address: ip,
  });

  await admin.from("analytics").insert({
    document_id: documentId,
    user_id: null,
    action: "view",
  });

  const external = doc.external_url?.trim();
  if (external) {
    return NextResponse.json({
      url: external,
      allowDownload: doc.allow_download ?? true,
      fileType: doc.file_type ?? "Link",
      isExternal: true,
    });
  }

  if (!doc.file_url) {
    return NextResponse.json({ error: "Document has no file or link" }, { status: 404 });
  }

  const { data: signed, error: signError } = await admin.storage
    .from("investor-docs")
    .createSignedUrl(doc.file_url, 60);

  if (signError || !signed?.signedUrl) {
    return NextResponse.json({ error: "Failed to create download URL" }, { status: 500 });
  }

  return NextResponse.json({
    url: signed.signedUrl,
    allowDownload: doc.allow_download ?? true,
    fileType: doc.file_type ?? "PDF",
    isExternal: false,
  });
}
