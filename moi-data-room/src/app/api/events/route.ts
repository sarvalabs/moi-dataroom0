import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/auth-admin";

export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("calendar_events")
    .select("*")
    .order("start_date", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const startDate = typeof body.start_date === "string" ? body.start_date.trim() : "";
  const endDate =
    typeof body.end_date === "string" && body.end_date.trim()
      ? body.end_date.trim()
      : null;
  const description =
    typeof body.description === "string" && body.description.trim()
      ? body.description.trim()
      : null;
  const href =
    typeof body.href === "string" && body.href.trim() ? body.href.trim() : null;
  const location =
    typeof body.location === "string" && body.location.trim()
      ? body.location.trim()
      : null;

  if (!title || !startDate) {
    return NextResponse.json(
      { error: "title and start_date are required (YYYY-MM-DD)" },
      { status: 400 },
    );
  }

  const ymd = /^\d{4}-\d{2}-\d{2}$/;
  if (!ymd.test(startDate) || (endDate && !ymd.test(endDate))) {
    return NextResponse.json({ error: "Dates must be YYYY-MM-DD" }, { status: 400 });
  }
  if (endDate && endDate < startDate) {
    return NextResponse.json({ error: "end_date must be on or after start_date" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("calendar_events")
    .insert({
      title,
      start_date: startDate,
      end_date: endDate,
      description,
      href,
      location,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
