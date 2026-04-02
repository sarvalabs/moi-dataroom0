"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Pill } from "./pill";
import { Button } from "./button";
import { PdfViewer } from "./pdf-viewer";
import type { DocumentItem } from "@/lib/constants";

function DocRow({
  doc,
  index,
}: {
  doc: DocumentItem & { id?: string; allow_download?: boolean };
  index: number;
}) {
  const [loading, setLoading] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);

  const handleView = async () => {
    if (!doc.id) return;
    setLoading(true);
    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ documentId: doc.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Download failed");

      const allowDownload = data.allowDownload ?? true;
      const fileType = data.fileType ?? doc.type;

      if (!allowDownload && fileType === "PDF") {
        // View-only PDF: open in-app viewer
        setViewerUrl(data.url);
      } else if (!allowDownload) {
        // View-only PPTX/DOCX: open in new tab (inline)
        window.open(data.url, "_blank", "noopener");
      } else {
        // Downloadable: redirect to trigger download
        window.location.href = data.url;
      }
    } catch {
      alert("Could not open document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const allowDownload = doc.allow_download ?? true;
  const buttonLabel = doc.type === "LINK"
    ? "Visit ↗"
    : allowDownload
      ? "View ↓"
      : "View";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.06 + index * 0.05, duration: 0.3 }}
        className="group grid grid-cols-[1fr_100px_120px] items-center gap-3 rounded-[10px] border border-transparent px-5 py-4 transition-all duration-200 hover:border-border hover:bg-surface-2"
        style={{ cursor: "pointer" }}
      >
        <div>
          <div className="mb-1 text-sm font-semibold text-text">{doc.title}</div>
          <div className="text-xs leading-relaxed text-text-muted">{doc.desc}</div>
        </div>
        <div>
          <Pill>{doc.type}</Pill>
        </div>
        <div className="text-right">
          <span className="hidden group-hover:inline-flex">
            <Button variant="primary" size="sm" onClick={handleView} disabled={loading}>
              {loading ? "Opening…" : buttonLabel}
            </Button>
          </span>
          <span className="inline-flex group-hover:hidden">
            <Button variant="ghost" size="sm" onClick={handleView} disabled={loading}>
              {loading ? "…" : buttonLabel}
            </Button>
          </span>
        </div>
      </motion.div>

      {viewerUrl && (
        <PdfViewer
          url={viewerUrl}
          title={doc.title}
          onClose={() => setViewerUrl(null)}
        />
      )}
    </>
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
        <div className="grid grid-cols-[1fr_100px_120px] gap-3 rounded-[10px] bg-surface px-5 py-2.5">
          {["Document", "Type", ""].map((h, i) => (
            <div
              key={h || "action"}
              className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted"
              style={{ textAlign: i === 2 ? "right" : "left" }}
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
