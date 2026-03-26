import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/auth-admin";

const MAX_SIZE = 50 * 1024 * 1024;
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_CATEGORIES = new Set([
  "contextual_compute",
  "engineering",
  "business",
  "tokenomics",
  "research",
  "usecases",
]);

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const rawCategory = formData.get("category");
  const category =
    typeof rawCategory === "string" && ALLOWED_CATEGORIES.has(rawCategory)
      ? rawCategory
      : "uploads";
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "File must be under 50MB" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only PDF, PPTX, DOCX allowed" }, { status: 400 });
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const uniqueSuffix = crypto.randomUUID().slice(0, 8);
  const path = `${category}/${Date.now()}-${uniqueSuffix}-${safeName}`;
  const admin = createAdminClient();
  const { error } = await admin.storage.from("investor-docs").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ path });
}
