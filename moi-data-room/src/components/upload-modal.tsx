"use client";

import { useState, useRef } from "react";
import { Button } from "./button";
import { SUBCATEGORIES } from "@/lib/constants";
import type { DocumentCategory } from "@/lib/constants";

const CATEGORIES: { value: DocumentCategory | "home"; label: string }[] = [
  { value: "home", label: "Overview (Home)" },
  { value: "contextual_compute", label: "Contextual Compute" },
  { value: "engineering", label: "Engineering" },
  { value: "business", label: "Business & GTM" },
  { value: "tokenomics", label: "Tokenomics" },
  { value: "research", label: "Research" },
  { value: "usecases", label: "Use Cases" },
];

const HOME_SLOTS = [
  { id: "litepaper", title: "Litepaper", description: "MOI protocol overview", category: "overview" as DocumentCategory },
  { id: "slide_deck", title: "Slide Deck", description: "Investor presentation", category: "business" as DocumentCategory },
  { id: "yellow_paper", title: "Yellow Paper", description: "Protocol specification", category: "engineering" as DocumentCategory },
  { id: "contextual_compute", title: "Contextual Compute", description: "The general theory of computation", category: "contextual_compute" as DocumentCategory },
];

function fileTypeFromMime(mime: string): string {
  if (mime === "application/pdf") return "PDF";
  if (mime.includes("presentation")) return "PPTX";
  if (mime.includes("wordprocessing")) return "DOCX";
  return "PDF";
}

export function UploadModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [category, setCategory] = useState<DocumentCategory | "home" | "">("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [subcategory, setSubcategory] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isHome = category === "home";
  const slot = HOME_SLOTS.find((s) => s.id === selectedSlot);
  const subcats = !isHome && category ? SUBCATEGORIES[category as DocumentCategory] : undefined;

  const handleCategoryChange = (val: string) => {
    setCategory(val as DocumentCategory | "home" | "");
    setSelectedSlot("");
    setSubcategory("");
    if (val !== "home") {
      setTitle("");
      setDescription("");
    }
  };

  const handleSlotChange = (slotId: string) => {
    setSelectedSlot(slotId);
    const s = HOME_SLOTS.find((h) => h.id === slotId);
    if (s) {
      setTitle(s.title);
      setDescription(s.description);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      if (file) formData.set("file", file);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!uploadRes.ok) {
        const data = await uploadRes.json().catch(() => ({}));
        throw new Error(data.error ?? uploadRes.statusText);
      }
      const { path } = await uploadRes.json();

      // For home slots, use the slot's real category; otherwise use the selected category
      const finalCategory = isHome && slot ? slot.category : category;
      const finalTitle = isHome && slot ? slot.title : title.trim();
      const finalDesc = isHome && slot ? slot.description : (description.trim() || null);

      const docRes = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: finalTitle,
          category: finalCategory,
          subcategory: isHome ? null : (subcategory || null),
          description: finalDesc,
          file_url: path,
          file_type: file ? fileTypeFromMime(file.type) : "PDF",
        }),
      });
      if (!docRes.ok) {
        const data = await docRes.json().catch(() => ({}));
        throw new Error(data.error ?? docRes.statusText);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
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
        <h3 className="text-lg font-bold text-text">Upload Document</h3>
        <p className="mb-6 mt-1 text-xs text-text-muted">
          Add a new document to the investor data room.
        </p>

        {/* Category */}
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold text-text-dim">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 font-sans text-[13px] text-text outline-none"
          >
            <option value=""></option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Home slot selector */}
        {isHome && (
          <div className="mb-4">
            <label className="mb-2 block text-xs font-semibold text-text-dim">
              Select Document
            </label>
            <div className="flex flex-col gap-2">
              {HOME_SLOTS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSlotChange(s.id)}
                  className="text-left transition-all"
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: selectedSlot === s.id
                      ? "1.5px solid var(--accent)"
                      : "1px solid var(--border)",
                    background: selectedSlot === s.id
                      ? "rgba(123,97,255,0.08)"
                      : "var(--surface-2)",
                    cursor: "pointer",
                  }}
                >
                  <div className="text-[13px] font-medium" style={{
                    color: selectedSlot === s.id ? "var(--accent-2)" : "var(--text)",
                  }}>
                    {s.title}
                  </div>
                  <div className="mt-0.5 text-[11px] text-text-muted">{s.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subcategory picker — shown when category has subcategories */}
        {subcats && subcats.length > 0 && (
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-semibold text-text-dim">
              Subcategory
            </label>
            <select
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 font-sans text-[13px] text-text outline-none"
            >
              <option value="">General</option>
              {subcats.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Title & Description — only for non-home categories */}
        {!isHome && category && (
          <>
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
                Description
              </label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 font-sans text-[13px] text-text outline-none"
              />
            </div>
          </>
        )}

        {/* File drop */}
        {(isHome ? selectedSlot : category) && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="mb-6 cursor-pointer rounded-xl border-2 border-dashed border-border p-8 text-center transition-colors hover:border-accent"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.pptx,.docx,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="mb-2 text-2xl">{file ? "✓" : "📎"}</div>
            <div className="text-[13px] text-text-dim">
              {file ? file.name : "Drop file or click to browse"}
            </div>
          </div>
        )}

        {error && (
          <p className="mb-4 text-xs text-[#F87171]">{error}</p>
        )}

        <div className="flex justify-end gap-2.5">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Uploading…" : "Upload"}
          </Button>
        </div>
      </div>
    </div>
  );
}
