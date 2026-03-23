"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "./button";

interface PdfViewerProps {
  url: string;
  title?: string;
  onClose: () => void;
}

export function PdfViewer({ url, title, onClose }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdf, setPdf] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load PDF
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
        const doc = await pdfjsLib.getDocument(url).promise;
        if (cancelled) return;
        setPdf(doc);
        setTotal(doc.numPages);
        setLoading(false);
      } catch {
        if (!cancelled) {
          setError("Failed to load PDF");
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [url]);

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
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" || e.key === "ArrowDown") setPage((p) => Math.min(p + 1, total));
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") setPage((p) => Math.max(p - 1, 1));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, total]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[1000] flex items-center justify-center backdrop-blur-[4px]"
      style={{ background: "rgba(0,0,0,0.8)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
        className="flex max-h-[90vh] w-[90vw] max-w-[900px] flex-col rounded-2xl border border-border bg-surface"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h3 className="text-sm font-semibold text-text">{title ?? "Document Viewer"}</h3>
            {total > 0 && (
              <p className="text-xs text-text-muted">
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
              ←
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.min(p + 1, total))}
              disabled={page >= total}
            >
              →
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4" style={{ userSelect: "none" }}>
          {loading && (
            <div className="flex h-64 items-center justify-center text-sm text-text-muted">
              Loading document...
            </div>
          )}
          {error && (
            <div className="flex h-64 items-center justify-center text-sm text-[#F87171]">
              {error}
            </div>
          )}
          {!loading && !error && (
            <canvas
              ref={canvasRef}
              className="mx-auto"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
