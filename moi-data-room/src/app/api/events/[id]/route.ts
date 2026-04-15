import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/auth-admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.title !== undefined) {
    const t = typeof body.title === "string" ? body.title.trim() : "";
    if (!t) return NextResponse.json({ error: "title cannot be empty" }, { status: 400 });
    updates.title = t;
  }
  if (body.start_date !== undefined) {
    const s = typeof body.start_date === "string" ? body.start_date.trim() : "";
    if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      return NextResponse.json({ error: "start_date must be YYYY-MM-DD" }, { status: 400 });
    }
    updates.start_date = s;
  }
  if (body.end_date !== undefined) {
    if (body.end_date === null || body.end_date === "") {
      updates.end_date = null;
    } else if (typeof body.end_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.end_date.trim())) {
      updates.end_date = body.end_date.trim();
    } else {
      return NextResponse.json({ error: "end_date must be YYYY-MM-DD or empty" }, { status: 400 });
    }
  }
  if (body.description !== undefined) {
    updates.description =
      typeof body.description === "string" && body.description.trim()
        ? body.description.trim()
        : null;
  }
  if (body.href !== undefined) {
    updates.href =
      typeof body.href === "string" && body.href.trim() ? body.href.trim() : null;
  }
  if (body.location !== undefined) {
    updates.location =
      typeof body.location === "string" && body.location.trim()
        ? body.location.trim()
        : null;
  }

  updates.updated_at = new Date().toISOString();

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("calendar_events")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const admin = createAdminClient();
  const { error } = await admin.from("calendar_events").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
