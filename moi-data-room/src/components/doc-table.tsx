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
          <span className="text-xs font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
            {loading ? "Opening..." : "Open in new tab ↗"}
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
        <div className="grid grid-cols-[1fr_100px_100px_120px] gap-3 rounded-[10px] bg-surface px-5 py-2.5">
          {["Document", "Type", "Views", ""].map((h, i) => (
            <div
              key={h || "action"}
              className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted"
              style={{ textAlign: i === 3 ? "right" : "left" }}
            >
              {h}
            </div>
          ))}
        </div>
        {/* Rows */}
        {docs.map((doc, i) => (
          <DocRow key={"id" in doc && doc.id ? doc.id : doc.title} doc={doc} index={i} />
        ))}
      </div>
    </div>
  );
}
