"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Pill } from "./pill";
import type { DocumentItem } from "@/lib/constants";

function DocRow({
  doc,
  index,
}: {
  doc: DocumentItem & { id?: string; allow_download?: boolean };
  index: number;
}) {
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    if (!doc.id || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ documentId: doc.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Failed to open document");
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch {
      alert("Could not open document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={handleOpen}
      role="button"
      tabIndex={doc.id ? 0 : -1}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          void handleOpen();
        }
      }}
      style={{
        textDecoration: "none",
        color: "inherit",
        pointerEvents: doc.id ? "auto" : "none",
      }}
    >
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.06 + index * 0.05, duration: 0.3 }}
        className="group grid grid-cols-[1fr_60px] items-center gap-3 rounded-[10px] border border-transparent px-4 py-3 transition-all duration-200 hover:border-border hover:bg-surface-2 sm:grid-cols-[1fr_80px_80px_100px] sm:px-5 sm:py-4"
        style={{ cursor: "pointer" }}
      >
        <div>
          <div className="mb-1 text-sm font-semibold text-text">{doc.title}</div>
          <div className="text-xs leading-relaxed text-text-muted">{doc.desc}</div>
        </div>
        <div className="hidden sm:block">
          <Pill>{doc.type}</Pill>
        </div>
        <div className="hidden text-[13px] text-text-dim sm:block">
          {doc.views.toLocaleString()}
        </div>
        <div className="text-right">
          <span className="text-xs font-medium text-accent sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
            {loading ? "Opening..." : "Open ↗"}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

export function DocTable({
  docs,
  sectionTitle,
}: {
  docs: (DocumentItem & { id?: string; allow_download?: boolean })[];
  sectionTitle: string;
}) {
  return (
    <div>
      <h2 className="text-[22px] font-bold tracking-[-0.02em] text-text">
        {sectionTitle}
      </h2>
      <p className="mb-7 mt-1.5 text-[13px] text-text-muted">
        {docs.length} document{docs.length !== 1 ? "s" : ""} available
      </p>
      <div className="flex flex-col gap-0.5">
        {/* Header */}
        <div className="grid grid-cols-[1fr_60px] gap-3 rounded-[10px] bg-surface px-4 py-2.5 sm:grid-cols-[1fr_80px_80px_100px] sm:px-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted">Document</div>
          <div className="hidden text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted sm:block">Type</div>
          <div className="hidden text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted sm:block">Views</div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted text-right" />
        </div>
        {/* Rows */}
        {docs.map((doc, i) => (
          <DocRow key={"id" in doc && doc.id ? doc.id : doc.title} doc={doc} index={i} />
        ))}
      </div>
    </div>
  );
}
