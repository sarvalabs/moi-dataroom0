"use client";

import { useState, useRef } from "react";
import { Button } from "./button";
import type { DocumentCategory } from "@/lib/constants";

const CATEGORIES: { value: DocumentCategory; label: string }[] = [
  { value: "contextual_compute", label: "Contextual Compute" },
  { value: "engineering", label: "Engineering" },
  { value: "business", label: "Business & GTM" },
  { value: "tokenomics", label: "Tokenomics" },
  { value: "research", label: "Research" },
  { value: "usecases", label: "Use Cases" },
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
  const [category, setCategory] = useState<DocumentCategory | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showOnOverview, setShowOnOverview] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [allowDownload, setAllowDownload] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCategoryChange = (val: string) => {
    setCategory(val as DocumentCategory | "");
    setTitle("");
    setDescription("");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (loading) return;
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (loading) return;
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!file) {
      setError("Please choose a file to upload.");
      return;
    }
    if (!category) {
      setError("Please select a category.");
      return;
    }
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    const submission = {
      category,
      title: title.trim(),
      description: description.trim() || null,
      fileType: fileTypeFromMime(file.type),
      allowDownload,
      showOnOverview,
    };

    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("category", submission.category);
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

      const docRes = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: submission.title,
          category: submission.category,
          description: submission.description,
          file_url: path,
          file_type: submission.fileType,
          allow_download: submission.allowDownload,
          show_on_overview: submission.showOnOverview,
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
            disabled={loading}
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

        {/* Title & Description */}
        {category && (
          <>
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-semibold text-text-dim">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
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
                disabled={loading}
                className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 font-sans text-[13px] text-text outline-none"
              />
            </div>
          </>
        )}

        {/* Show on Home toggle */}
        {category && (
          <div className="mb-4 flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={showOnOverview}
              onClick={() => setShowOnOverview(!showOnOverview)}
              disabled={loading}
              className="relative h-5 w-9 rounded-full transition-colors"
              style={{
                background: showOnOverview ? "var(--accent)" : "var(--border)",
              }}
            >
              <span
                className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform"
                style={{
                  transform: showOnOverview ? "translateX(16px)" : "translateX(0)",
                }}
              />
            </button>
            <label className="text-xs font-medium text-text-dim">
              Show on Home page (Overview)
            </label>
          </div>
        )}

        {/* Download permission */}
        {category && (
          <div className="mb-4 flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={allowDownload}
              onClick={() => setAllowDownload(!allowDownload)}
              disabled={loading}
              className="relative h-5 w-9 rounded-full transition-colors"
              style={{
                background: allowDownload ? "var(--accent)" : "var(--border)",
              }}
            >
              <span
                className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform"
                style={{
                  transform: allowDownload ? "translateX(16px)" : "translateX(0)",
                }}
              />
            </button>
            <label className="text-xs font-medium text-text-dim">
              Allow users to download this file
            </label>
          </div>
        )}

        {/* File drop */}
        {category && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => !loading && fileInputRef.current?.click()}
            className="mb-6 cursor-pointer rounded-xl border-2 border-dashed border-border p-8 text-center transition-colors hover:border-accent"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.pptx,.docx,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              disabled={loading}
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
