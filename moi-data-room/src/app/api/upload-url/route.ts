import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/auth-admin";

const ALLOWED_CATEGORIES = new Set([
  "contextual_compute",
  "engineering",
  "business",
  "tokenomics",
  "research",
  "usecases",
]);

const ALLOWED_MIMES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

/**
 * Returns a Supabase Storage signed upload URL so the browser can PUT the file
 * directly — bypasses Vercel's 4.5 MB function body limit.
 */
export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { fileName, fileSize, mimeType, category } = body as {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    category?: string;
  };

  if (!fileName || !mimeType) {
    return NextResponse.json({ error: "fileName and mimeType required" }, { status: 400 });
  }
  if (!ALLOWED_MIMES.has(mimeType)) {
    return NextResponse.json({ error: "Only PDF, PPTX, DOCX allowed." }, { status: 400 });
  }
  if (typeof fileSize === "number" && fileSize > 50 * 1024 * 1024) {
    return NextResponse.json({ error: "File must be under 50 MB" }, { status: 400 });
  }

  const resolvedCategory =
    typeof category === "string" && ALLOWED_CATEGORIES.has(category)
      ? category
      : "uploads";

  const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const uniqueSuffix = crypto.randomUUID().slice(0, 8);
  const path = `${resolvedCategory}/${Date.now()}-${uniqueSuffix}-${safeName}`;

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from("investor-docs")
    .createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to create upload URL" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    path,
    signedUrl: data.signedUrl,
    token: data.token,
  });
}
