import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/auth-admin";
import { normalizeExternalUrl } from "@/lib/external-url";

const PATCHABLE = new Set([
  "title",
  "description",
  "category",
  "file_url",
  "external_url",
  "file_type",
  "status",
  "allow_download",
  "show_on_overview",
]);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("documents")
    .select("id, title, description, file_type, category, created_at, allow_download")
    .eq("id", id)
    .eq("status", "published")
    .single();
  if (error || !data) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }
  return NextResponse.json(data);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const body = await request.json();
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of PATCHABLE) {
    if (key in body) patch[key] = body[key];
  }

  if ("external_url" in patch) {
    const raw = patch.external_url;
    if (raw === null || raw === "") {
      patch.external_url = null;
    } else if (typeof raw === "string") {
      const n = normalizeExternalUrl(raw);
      if (!n) {
        return NextResponse.json({ error: "external_url must be a valid http(s) URL" }, { status: 400 });
      }
      patch.external_url = n;
    }
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("documents")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const admin = createAdminClient();
  const { data: doc } = await admin.from("documents").select("file_url").eq("id", id).single();
  if (doc?.file_url) await admin.storage.from("investor-docs").remove([doc.file_url]);
  const { error } = await admin.from("documents").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
