import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/auth-admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.description !== undefined) updates.description = body.description?.trim() || null;
  if (body.link !== undefined) updates.link = body.link?.trim() || null;
  if (body.type !== undefined) {
    if (body.type !== "business" && body.type !== "dapp") {
      return NextResponse.json({ error: "type must be 'business' or 'dapp'" }, { status: 400 });
    }
    updates.type = body.type;
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("adopters")
    .update(updates)
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
  const { error } = await admin.from("adopters").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
