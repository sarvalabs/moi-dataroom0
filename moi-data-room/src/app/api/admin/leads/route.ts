import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/auth-admin";

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("document_leads")
    .select("id, email, document_id, ip_address, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const docIds = [...new Set((data ?? []).map((l) => l.document_id).filter(Boolean))];
  let docTitles: Record<string, string> = {};
  if (docIds.length > 0) {
    const { data: docs } = await admin
      .from("documents")
      .select("id, title")
      .in("id", docIds);
    if (docs) {
      for (const d of docs) docTitles[d.id] = d.title;
    }
  }

  const enriched = (data ?? []).map((lead) => ({
    ...lead,
    document_title: docTitles[lead.document_id] ?? "Unknown",
  }));

  return NextResponse.json(enriched);
}
