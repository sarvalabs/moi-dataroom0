import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/auth-admin";

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
  return NextResponse.json(documents ?? []);
}

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json();
  const { title, description, category, file_url, file_type, status } = body;
  if (!title || !category) {
    return NextResponse.json({ error: "title and category required" }, { status: 400 });
  }
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("documents")
    .insert({
      title,
      description: description ?? null,
      category,
      file_url: file_url ?? null,
      file_type: file_type ?? "PDF",
      status: status ?? "published",
      uploaded_by: null,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
