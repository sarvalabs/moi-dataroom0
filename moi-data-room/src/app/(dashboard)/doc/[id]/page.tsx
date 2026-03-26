"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/button";

interface DocMeta {
  url: string;
  allowDownload: boolean;
  fileType: string;
  title?: string;
}

export default function DocViewerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [meta, setMeta] = useState<DocMeta | null>(null);
  const [pdf, setPdf] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch signed URL + metadata
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Fetch doc title from the documents list
        const listRes = await fetch(`/api/documents/${id}`, { credentials: "include" });
        let title = "Document";
        if (listRes.ok) {
          const listData = await listRes.json();
          title = listData.title ?? title;
        }

        const res = await fetch("/api/download", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ documentId: id }),
        });
        const data = await res.json();
        if (!res.ok || !data.url) throw new Error(data.error ?? "Failed to load document");
        if (!cancelled) {
          setMeta({
            url: data.url,
            allowDownload: data.allowDownload ?? true,
            fileType: data.fileType ?? "PDF",
            title,
          });
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message ?? "Failed to load document");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  // Load PDF once we have the URL
  useEffect(() => {
    if (!meta?.url || meta.fileType !== "PDF") return;
    let cancelled = false;
    (async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
        const doc = await pdfjsLib.getDocument(meta.url).promise;
        if (cancelled) return;
        setPdf(doc);
        setTotal(doc.numPages);
      } catch {
        if (!cancelled) setError("Failed to load PDF");
      }
    })();
    return () => { cancelled = true; };
  }, [meta]);

  // Render current page
  const renderPage = useCallback(async () => {
    if (!pdf || !canvasRef.current) return;
    try {
      const pg = await pdf.getPage(page);
      const viewport = pg.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d")!;
      await pg.render({ canvasContext: ctx, viewport }).promise;
    } catch {
      setError("Failed to render page");
    }
  }, [pdf, page]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") setPage((p) => Math.min(p + 1, total));
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") setPage((p) => Math.max(p - 1, 1));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [total]);

  // Non-PDF: redirect to the signed URL in the same tab
  useEffect(() => {
    if (meta && meta.fileType !== "PDF") {
      window.open(meta.url, "_blank", "noopener");
    }
  }, [meta]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-sm text-text-muted">
        Loading document...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-sm text-[#F87171]">{error}</p>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  if (meta && meta.fileType !== "PDF") {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-sm text-text-muted">
          This document has been opened in a new tab.
        </p>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.02em] text-text">
            {meta?.title ?? "Document"}
          </h1>
          {total > 0 && (
            <p className="mt-1 text-xs text-text-muted">
              Page {page} of {total}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page <= 1}
          >
            ← Prev
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => Math.min(p + 1, total))}
            disabled={page >= total}
          >
            Next →
          </Button>
          {meta?.allowDownload && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => { if (meta?.url) window.location.href = meta.url; }}
            >
              Download
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </div>

      {/* PDF Canvas */}
      <div
        className="rounded-2xl border border-border bg-surface p-4"
        style={{ userSelect: "none" }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <canvas
          ref={canvasRef}
          className="mx-auto"
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </div>
    </div>
  );
}
