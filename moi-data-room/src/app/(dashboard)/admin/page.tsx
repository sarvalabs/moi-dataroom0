"use client";

import { useState, useEffect, useCallback } from "react";
import { BentoCard } from "@/components/bento-card";
import { Button } from "@/components/button";
import { Pill } from "@/components/pill";
import { UploadModal } from "@/components/upload-modal";
import type { Document } from "@/lib/types";

const CATEGORY_LABELS: Record<string, string> = {
  overview: "Overview",
  contextual_compute: "Contextual Compute",
  engineering: "Engineering",
  business: "Business & GTM",
  tokenomics: "Tokenomics",
  research: "Research",
  usecases: "Use Cases",
};

function embeddingVariant(s: string) {
  if (s === "completed") return "green" as const;
  if (s === "processing") return "amber" as const;
  if (s === "failed") return "red" as const;
  return "amber" as const;
}

function embeddingLabel(s: string) {
  if (s === "completed") return "Indexed";
  if (s === "processing") return "Indexing...";
  if (s === "failed") return "Index Failed";
  return "Pending";
}

interface AdminStats {
  chatQueries: number;
  topDocs: { title: string; views: number }[];
}

export default function AdminDashboard() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [stats, setStats] = useState<AdminStats>({ chatQueries: 0, topDocs: [] });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);

  const fetchDocs = useCallback(async () => {
    try {
      const res = await fetch("/api/documents", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load documents");
      const data = await res.json();
      setDocs(Array.isArray(data) ? data : []);
    } catch {
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchDocs();
    fetchStats();
  }, [fetchDocs, fetchStats]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
      setDocs((prev) => prev.filter((d) => d.id !== id));
    } catch {
      // silent
    }
  }, []);

  const handleToggleDownload = useCallback(async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ allow_download: !current }),
      });
      if (!res.ok) throw new Error("Toggle failed");
      setDocs((prev) =>
        prev.map((d) => (d.id === id ? { ...d, allow_download: !current } : d))
      );
    } catch {
      // silent
    }
  }, []);

  const handleReindex = useCallback(async (id: string) => {
    try {
      await fetch("/api/documents/reembed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ documentId: id }),
      });
      fetchDocs();
    } catch {
      // silent
    }
  }, [fetchDocs]);

  const totalDocs = docs.length;
  const totalViews = docs.reduce((sum, d) => sum + (d.view_count ?? 0), 0);
  const indexedDocs = docs.filter((d) => d.embedding_status === "completed").length;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-[22px] font-bold tracking-[-0.02em] text-text">
            Admin Dashboard
          </h2>
          <p className="mt-1 text-[13px] text-text-muted">
            Manage data room documents
          </p>
        </div>
        <Button size="md" onClick={() => setShowModal(true)}>
          + Upload Document
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3.5">
        <BentoCard>
          <div className="mb-2 text-xs font-medium text-text-muted">Documents</div>
          <div className="text-[28px] font-bold tracking-[-0.03em] text-text">
            {totalDocs}
          </div>
        </BentoCard>
        <BentoCard>
          <div className="mb-2 text-xs font-medium text-text-muted">Indexed for AI</div>
          <div className="text-[28px] font-bold tracking-[-0.03em] text-text">
            {indexedDocs} / {totalDocs}
          </div>
        </BentoCard>
        <BentoCard>
          <div className="mb-2 text-xs font-medium text-text-muted">Total Views</div>
          <div className="text-[28px] font-bold tracking-[-0.03em] text-text">
            {totalViews}
          </div>
        </BentoCard>
        <BentoCard>
          <div className="mb-2 text-xs font-medium text-text-muted">Chatbot Questions</div>
          <div className="text-[28px] font-bold tracking-[-0.03em] text-text">
            {stats.chatQueries}
          </div>
        </BentoCard>
      </div>

      {/* Most Viewed Documents */}
      {stats.topDocs.length > 0 && (
        <div className="mb-8">
          <BentoCard>
            <h3 className="mb-4 text-[13px] font-semibold uppercase tracking-[0.06em] text-text-muted">
              Most Viewed Documents
            </h3>
            <div className="flex flex-col gap-3">
              {stats.topDocs.map((doc, i) => {
                const maxViews = stats.topDocs[0]?.views || 1;
                const pct = Math.max((doc.views / maxViews) * 100, 4);
                return (
                  <div key={i}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
                        {doc.title}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {doc.views} views
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        borderRadius: 3,
                        background: "var(--surface-2)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${pct}%`,
                          height: "100%",
                          borderRadius: 3,
                          background: "linear-gradient(90deg, #7b61ff, #a78bfa)",
                          transition: "width 0.6s ease",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </BentoCard>
        </div>
      )}

      {/* Document Management Table */}
      <BentoCard>
        <h3 className="mb-5 text-[13px] font-semibold uppercase tracking-[0.06em] text-text-muted">
          Document Management
        </h3>

        {loading ? (
          <div className="py-8 text-center text-[13px] text-text-muted">Loading...</div>
        ) : docs.length === 0 ? (
          <div className="py-8 text-center text-[13px] text-text-muted">
            No documents uploaded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr 90px 100px 80px 60px 200px",
                gap: 8,
                padding: "10px 16px",
                borderRadius: 8,
                background: "var(--surface-2)",
                marginBottom: 4,
                minWidth: 780,
              }}
            >
              {["Document", "Category", "Status", "Embeddings", "Download", "Views", "Actions"].map((h) => (
                <div key={h} style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {h}
                </div>
              ))}
            </div>

            {/* Rows */}
            {docs.map((doc) => (
              <DocRow
                key={doc.id}
                doc={doc}
                onDelete={() => handleDelete(doc.id)}
                onReindex={() => handleReindex(doc.id)}
                onToggleDownload={() => handleToggleDownload(doc.id, doc.allow_download)}
                onEdit={() => setEditingDoc(doc)}
              />
            ))}
          </div>
        )}
      </BentoCard>

      {showModal && (
        <UploadModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchDocs}
        />
      )}

      {editingDoc && (
        <EditModal
          doc={editingDoc}
          onClose={() => setEditingDoc(null)}
          onSaved={(updated) => {
            setDocs((prev) =>
              prev.map((d) => (d.id === updated.id ? updated : d))
            );
          }}
        />
      )}
    </div>
  );
}

function EditModal({
  doc,
  onClose,
  onSaved,
}: {
  doc: Document;
  onClose: () => void;
  onSaved: (updated: Document) => void;
}) {
  const [title, setTitle] = useState(doc.title);
  const [description, setDescription] = useState(doc.description ?? "");
  const [category, setCategory] = useState(doc.category);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!category) {
      setError("Please select a category.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/documents/${doc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          category,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Save failed");
      }
      const updated = await res.json();
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[1000] flex items-center justify-center backdrop-blur-[4px]"
      style={{ background: "rgba(0,0,0,0.7)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[440px] max-w-[90vw] rounded-2xl border border-border bg-surface p-8"
      >
        <h3 className="text-lg font-bold text-text">Edit Document</h3>
        <p className="mb-6 mt-1 text-xs text-text-muted">
          Update title, description, and category.
        </p>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold text-text-dim">
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 font-sans text-[13px] text-text outline-none"
          />
        </div>
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold text-text-dim">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 font-sans text-[13px] text-text outline-none"
          >
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-6">
          <label className="mb-1.5 block text-xs font-semibold text-text-dim">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 font-sans text-[13px] text-text outline-none resize-none"
          />
        </div>

        {error && <p className="mb-4 text-xs text-[#F87171]">{error}</p>}

        <div className="flex justify-end gap-2.5">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function DocRow({
  doc,
  onDelete,
  onReindex,
  onToggleDownload,
  onEdit,
}: {
  doc: Document;
  onDelete: () => void;
  onReindex: () => void;
  onToggleDownload: () => void;
  onEdit: () => void;
}) {
  const [hov, setHov] = useState(false);
  const embStatus = doc.embedding_status ?? "pending";

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "1.5fr 1fr 90px 100px 80px 60px 200px",
        gap: 8,
        padding: "14px 16px",
        alignItems: "center",
        borderBottom: "1px solid var(--border)",
        background: hov ? "var(--surface-2)" : "transparent",
        transition: "background 0.15s",
        minWidth: 780,
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>
        {doc.title}
      </div>
      <div style={{ fontSize: 13, color: "var(--text-dim)" }}>
        {CATEGORY_LABELS[doc.category] ?? doc.category}
      </div>
      <div>
        <Pill variant={doc.status === "published" ? "green" : "amber"}>
          {doc.status === "published" ? "Published" : doc.status}
        </Pill>
      </div>
      <div title={doc.embedding_error ?? undefined}>
        <Pill variant={embeddingVariant(embStatus)}>
          {embeddingLabel(embStatus)}
        </Pill>
      </div>
      <div>
        <button
          type="button"
          role="switch"
          aria-checked={doc.allow_download}
          onClick={onToggleDownload}
          style={{
            position: "relative",
            width: 34,
            height: 18,
            borderRadius: 9,
            border: "none",
            cursor: "pointer",
            background: doc.allow_download ? "var(--accent)" : "var(--border)",
            transition: "background 0.2s",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 2,
              left: doc.allow_download ? 18 : 2,
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "#fff",
              transition: "left 0.2s",
            }}
          />
        </button>
      </div>
      <div style={{ fontSize: 13, color: "var(--text-dim)" }}>
        {doc.view_count ?? 0}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <Button variant="ghost" size="sm" onClick={onReindex}>
          Re-index
        </Button>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          Edit
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete} className="!text-[#F87171]">
          Delete
        </Button>
      </div>
    </div>
  );
}
