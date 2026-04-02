"use client";

import { useState } from "react";
import { Pill } from "./pill";
import { EmailGateModal, getStoredLeadEmail } from "./email-gate-modal";
import type { DocumentItem } from "@/lib/constants";

type DocWithMeta = DocumentItem & {
  id?: string;
  allow_download?: boolean;
  require_email?: boolean;
};

function DocRow({
  doc,
  index,
  onEmailGateRequest,
}: {
  doc: DocWithMeta;
  index: number;
  onEmailGateRequest: (doc: DocWithMeta) => void;
}) {
  const [loading, setLoading] = useState(false);

  const openDoc = async (email?: string) => {
    if (!doc.id || loading) return;
    setLoading(true);
    // Open window immediately while still in user-gesture context (Safari blocks
    // window.open after an await)
    const tab = window.open("about:blank", "_blank");
    try {
      const endpoint = email ? "/api/document-access" : "/api/download";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(
          email
            ? { documentId: doc.id, email }
            : { documentId: doc.id },
        ),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Failed to open document");
      if (tab && !tab.closed) {
        tab.location.href = data.url;
      } else {
        window.location.href = data.url;
      }
    } catch {
      if (tab && !tab.closed) tab.close();
      alert("Could not open document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    if (!doc.id || loading) return;
    if (doc.require_email) {
      const stored = getStoredLeadEmail();
      if (stored) {
        openDoc(stored);
      } else {
        onEmailGateRequest(doc);
      }
    } else {
      openDoc();
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
          handleOpen();
        }
      }}
      style={{
        textDecoration: "none",
        color: "inherit",
        pointerEvents: doc.id ? "auto" : "none",
      }}
    >
      <div
        className="group grid grid-cols-[1fr_60px] items-center gap-3 rounded-[10px] border border-transparent px-4 py-3 transition-all duration-200 hover:border-border hover:bg-surface-2 sm:grid-cols-[1fr_80px_80px_100px] sm:px-5 sm:py-4"
        style={{
          cursor: "pointer",
          animation: `fadeSlideUp 0.3s ease both`,
          animationDelay: `${0.06 + index * 0.05}s`,
        }}
      >
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-text">
            <span className="truncate">{doc.title}</span>
            {doc.require_email && (
              <span title="Email required" className="shrink-0 text-[11px] text-accent">🔒</span>
            )}
          </div>
          <div className="text-xs leading-relaxed text-text-muted line-clamp-2">{doc.desc}</div>
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
      </div>
    </div>
  );
}

export function DocTable({
  docs,
  sectionTitle,
}: {
  docs: DocWithMeta[];
  sectionTitle: string;
}) {
  const [gatedDoc, setGatedDoc] = useState<DocWithMeta | null>(null);

  const handleEmailSubmit = async (email: string) => {
    if (!gatedDoc?.id) return;
    const tab = window.open("about:blank", "_blank");
    try {
      const res = await fetch("/api/document-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ documentId: gatedDoc.id, email }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Failed to open document");
      if (tab && !tab.closed) {
        tab.location.href = data.url;
      } else {
        window.location.href = data.url;
      }
    } catch {
      if (tab && !tab.closed) tab.close();
      alert("Could not open document. Please try again.");
    } finally {
      setGatedDoc(null);
    }
  };

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
          <DocRow
            key={"id" in doc && doc.id ? doc.id : doc.title}
            doc={doc}
            index={i}
            onEmailGateRequest={setGatedDoc}
          />
        ))}
      </div>

      {gatedDoc && (
        <EmailGateModal
          docTitle={gatedDoc.title}
          onSubmit={handleEmailSubmit}
          onClose={() => setGatedDoc(null)}
        />
      )}
    </div>
  );
}
