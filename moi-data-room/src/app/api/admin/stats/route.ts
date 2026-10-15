import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasAdminCookie } from "@/lib/auth-admin";

export async function GET() {
  if (!(await hasAdminCookie())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();

  // Chat query count
  const { count: chatCount } = await admin
    .from("chat_queries")
    .select("*", { count: "exact", head: true });

  // Get all docs
  const { data: docs } = await admin
    .from("documents")
    .select("id, title");

  // Get view counts from analytics table
  const { data: analytics } = await admin
    .from("analytics")
    .select("document_id");

  // Count views per document
  const viewCounts: Record<string, number> = {};
  for (const a of analytics ?? []) {
    if (a.document_id) {
      viewCounts[a.document_id] = (viewCounts[a.document_id] ?? 0) + 1;
    }
  }

  // Build top docs sorted by views
  const topDocs = (docs ?? [])
    .map((d) => ({
      title: d.title,
      views: viewCounts[d.id] ?? 0,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  return NextResponse.json({
    chatQueries: chatCount ?? 0,
    topDocs,
  });
}
