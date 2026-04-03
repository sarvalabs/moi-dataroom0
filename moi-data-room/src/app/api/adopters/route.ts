import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/auth-admin";

export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("adopters")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { name, description, link, type } = body;

  if (!name?.trim() || !type) {
    return NextResponse.json({ error: "name and type are required" }, { status: 400 });
  }
  if (type !== "business" && type !== "dapp") {
    return NextResponse.json({ error: "type must be 'business' or 'dapp'" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("adopters")
    .insert({
      name: name.trim(),
      description: description?.trim() || null,
      link: link?.trim() || null,
      type,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
