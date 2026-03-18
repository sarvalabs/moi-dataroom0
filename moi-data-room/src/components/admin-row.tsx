"use client";

import { useState } from "react";
import { Pill } from "./pill";
import { Button } from "./button";
import type { Document } from "@/lib/types";

const CATEGORIES = [
  { value: "overview", label: "Overview" },
  { value: "contextual_compute", label: "Contextual Compute" },
  { value: "engineering", label: "Engineering" },
  { value: "business", label: "Business & GTM" },
  { value: "tokenomics", label: "Tokenomics" },
  { value: "research", label: "Research" },
  { value: "usecases", label: "Use Cases" },
];

function statusVariant(s: string) {
  if (s === "published") return "green" as const;
  if (s === "draft") return "amber" as const;
  return "red" as const;
}

function statusLabel(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function categoryLabel(cat: string) {
  return CATEGORIES.find((c) => c.value === cat)?.label ?? cat;
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
  const [category, setCategory] = useState(doc.category);
  const [description, setDescription] = useState(doc.description ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/documents/${doc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          category,
          description: description.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? res.statusText);
      }
      const updated = await res.json();
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setLoading(false);
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
          Update the document details.
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
            onChange={(e) => setCategory(e.target.value as Document["category"])}
            className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 font-sans text-[13px] text-text outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-6">
          <label className="mb-1.5 block text-xs font-semibold text-text-dim">
            Description
          </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 font-sans text-[13px] text-text outline-none"
          />
        </div>

        {error && <p className="mb-4 text-xs text-[#F87171]">{error}</p>}

        <div className="flex justify-end gap-2.5">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AdminRow({
  doc: initialDoc,
  onDelete,
}: {
  doc: Document & { view_count?: number };
  onDelete: () => void;
}) {
  const [doc, setDoc] = useState(initialDoc);
  const [hov, setHov] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const views = doc.view_count ?? 0;

  return (
    <>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 120px 100px 80px 140px",
          gap: 12,
          padding: "14px 16px",
          borderRadius: 8,
          alignItems: "center",
          background: hov ? "var(--surface-2)" : "transparent",
          transition: "all 0.2s ease",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
          {doc.title}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
          {categoryLabel(doc.category)}
        </div>
        <div>
          <Pill variant={statusVariant(doc.status)}>
            {statusLabel(doc.status)}
          </Pill>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{views}</div>
        <div style={{ display: "flex", gap: 6 }}>
          <Button variant="ghost" size="sm" onClick={() => setShowEdit(true)}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="!text-[#F87171]"
          >
            Delete
          </Button>
        </div>
      </div>

      {showEdit && (
        <EditModal
          doc={doc}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => setDoc((prev) => ({ ...prev, ...updated }))}
        />
      )}
    </>
  );
}
