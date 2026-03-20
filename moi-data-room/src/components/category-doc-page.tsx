"use client";

import { useState, useEffect } from "react";
import { DocTable } from "@/components/doc-table";
import { SUBCATEGORIES } from "@/lib/constants";
import type { DocumentItem, DocumentCategory } from "@/lib/constants";

interface ApiDoc {
  id: string;
  title: string;
  description?: string | null;
  file_type?: string;
  created_at?: string;
  view_count?: number;
  subcategory?: string | null;
}

function mapApiDocToItem(d: ApiDoc): DocumentItem & { id?: string } {
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
  const [rawDocs, setRawDocs] = useState<ApiDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const subcats = SUBCATEGORIES[category];

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/documents?category=${category}`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (cancelled) return;
        setRawDocs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setRawDocs([]);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [category]);

  if (loading && rawDocs.length === 0) {
    return (
      <div>
        <h2 className="text-[22px] font-bold tracking-[-0.02em] text-text">
          {sectionTitle}
        </h2>
        <p className="mb-7 mt-1.5 text-[13px] text-text-muted">Loading...</p>
      </div>
    );
  }

  // If no subcategories defined, show flat list
  if (!subcats || subcats.length === 0) {
    return <DocTable docs={rawDocs.map(mapApiDocToItem)} sectionTitle={sectionTitle} />;
  }

  // Group docs by subcategory
  const grouped = new Map<string, ApiDoc[]>();
  const uncategorized: ApiDoc[] = [];

  for (const doc of rawDocs) {
    const sub = doc.subcategory;
    if (sub && subcats.some((s) => s.id === sub)) {
      const list = grouped.get(sub) ?? [];
      list.push(doc);
      grouped.set(sub, list);
    } else {
      uncategorized.push(doc);
    }
  }

  const totalDocs = rawDocs.length;

  return (
    <div>
      <h2 className="text-[22px] font-bold tracking-[-0.02em] text-text">
        {sectionTitle}
      </h2>
      <p className="mb-8 mt-1.5 text-[13px] text-text-muted">
        {totalDocs} document{totalDocs !== 1 ? "s" : ""} available
      </p>

      {/* Subcategory sections */}
      <div className="flex flex-col gap-10">
        {subcats.map((sub) => {
          const docs = grouped.get(sub.id) ?? [];
          return (
            <div key={sub.id}>
              <div className="mb-3 flex items-center gap-3">
                <h3 className="text-[15px] font-semibold text-text">
                  {sub.label}
                </h3>
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: "var(--border)",
                  }}
                />
                <span className="text-[12px] text-text-muted">
                  {docs.length} doc{docs.length !== 1 ? "s" : ""}
                </span>
              </div>

              {docs.length > 0 ? (
                <div className="flex flex-col gap-0.5">
                  {docs.map((doc, i) => (
                    <DocRow key={doc.id} doc={mapApiDocToItem(doc)} index={i} />
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    padding: "20px 16px",
                    borderRadius: 10,
                    border: "1px dashed var(--border)",
                    textAlign: "center",
                    fontSize: 13,
                    color: "var(--text-muted)",
                  }}
                >
                  No documents yet
                </div>
              )}
            </div>
          );
        })}

        {/* Uncategorized docs (if any) */}
        {uncategorized.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-3">
              <h3 className="text-[15px] font-semibold text-text">General</h3>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span className="text-[12px] text-text-muted">
                {uncategorized.length} doc{uncategorized.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              {uncategorized.map((doc, i) => (
                <DocRow key={doc.id} doc={mapApiDocToItem(doc)} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* Inline DocRow to avoid circular deps — same as doc-table's row */
import { motion } from "framer-motion";
import { Pill } from "./pill";
import { Button } from "./button";

function DocRow({
  doc,
  index,
}: {
  doc: DocumentItem & { id?: string };
  index: number;
}) {
  const [loadingDl, setLoadingDl] = useState(false);

  const handleView = async () => {
    if (!doc.id) return;
    setLoadingDl(true);
    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ documentId: doc.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Download failed");
      window.location.href = data.url;
    } catch {
      alert("Could not open document. Please try again.");
    } finally {
      setLoadingDl(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.06 + index * 0.05, duration: 0.3 }}
      className="group grid grid-cols-[1fr_100px_100px_120px] items-center gap-3 rounded-[10px] border border-transparent px-5 py-4 transition-all duration-200 hover:border-border hover:bg-surface-2"
      style={{ cursor: "pointer" }}
    >
      <div>
        <div className="mb-1 text-sm font-semibold text-text">{doc.title}</div>
        <div className="text-xs leading-relaxed text-text-muted">{doc.desc}</div>
      </div>
      <div>
        <Pill>{doc.type}</Pill>
      </div>
      <div className="text-[13px] text-text-dim">
        {doc.views.toLocaleString()}
      </div>
      <div className="text-right">
        <span className="hidden group-hover:inline-flex">
          <Button variant="primary" size="sm" onClick={handleView} disabled={loadingDl}>
            {loadingDl ? "Opening..." : "View ↓"}
          </Button>
        </span>
        <span className="inline-flex group-hover:hidden">
          <Button variant="ghost" size="sm" onClick={handleView} disabled={loadingDl}>
            {loadingDl ? "..." : "View ↓"}
          </Button>
        </span>
      </div>
    </motion.div>
  );
}
