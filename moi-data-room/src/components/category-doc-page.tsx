"use client";

import { useState, useEffect } from "react";
import { DocTable } from "@/components/doc-table";
import { DOCUMENTS } from "@/lib/constants";
import type { DocumentItem } from "@/lib/constants";
import type { DocumentCategory } from "@/lib/constants";

function mapApiDocToItem(d: {
  id: string;
  title: string;
  description?: string | null;
  file_type?: string;
  created_at?: string;
  view_count?: number;
}): DocumentItem & { id?: string } {
  return {
    id: d.id,
    title: d.title,
    desc: d.description ?? "",
    type: d.file_type ?? "PDF",
    date: d.created_at ? d.created_at.slice(0, 10) : "",
    views: d.view_count ?? 0,
  };
}

export function CategoryDocPage({
  category,
  sectionTitle,
}: {
  category: DocumentCategory;
  sectionTitle: string;
}) {
  const [docs, setDocs] = useState<(DocumentItem & { id?: string })[]>(() =>
    DOCUMENTS[category]?.map((d) => ({ ...d })) ?? []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/documents?category=${category}`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        setDocs(
          list.length > 0
            ? list.map(mapApiDocToItem)
            : DOCUMENTS[category]?.map((d) => ({ ...d })) ?? []
        );
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setDocs(DOCUMENTS[category]?.map((d) => ({ ...d })) ?? []);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [category]);

  if (loading && docs.length === 0) {
    return (
      <div>
        <h2 className="text-[22px] font-bold tracking-[-0.02em] text-text">
          {sectionTitle}
        </h2>
        <p className="mb-7 mt-1.5 text-[13px] text-text-muted">
          Loading…
        </p>
      </div>
    );
  }

  return <DocTable docs={docs} sectionTitle={sectionTitle} />;
}
