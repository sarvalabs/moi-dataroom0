"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { StatCardsGrid } from "@/components/stat-card";
import { Button } from "@/components/button";
import { HERO_CARDS, type HeroCard } from "@/lib/constants";

interface ApiDoc {
  id: string;
  title: string;
  description?: string | null;
  category: string;
}

function matchCardToDoc(card: HeroCard, docs: ApiDoc[]): ApiDoc | undefined {
  const byCategory = docs.filter((d) => d.category === card.matchCategory);
  if (card.matchTitleHint) {
    const byTitle = byCategory.find((d) =>
      d.title.toLowerCase().includes(card.matchTitleHint!.toLowerCase())
    );
    if (byTitle) return byTitle;
  }
  return byCategory[0];
}

function useOpenDoc() {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const openDoc = async (docId: string) => {
    if (loadingId) return;
    setLoadingId(docId);
    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ documentId: docId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Failed to open document");
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch {
      alert("Could not open document. Please try again.");
    } finally {
      setLoadingId(null);
    }
  };

  return { openDoc, loadingId };
}

/* ------------------------------------------------------------------ */
/*  Top Row — Research Paper Card                                      */
/* ------------------------------------------------------------------ */

function PaperCard({
  card,
  docId,
  index,
  loadingId,
  onOpen,
}: {
  card: HeroCard;
  docId?: string;
  index: number;
  loadingId: string | null;
  onOpen: (id: string) => void;
}) {
  const [hov, setHov] = useState(false);
  const isLoading = loadingId === docId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#141416",
        border: "1px solid",
        borderColor: hov ? "rgba(123, 97, 255, 0.3)" : "#222228",
        borderTop: "2px solid #7B61FF",
        borderRadius: 16,
        padding: 28,
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        boxShadow: hov ? "0 0 40px rgba(123, 97, 255, 0.06)" : "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Hover glow overlay */}
      {hov && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 100% 0%, rgba(123, 97, 255, 0.04), transparent 60%)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Tag + Icon row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#5A5A66",
          }}
        >
          {card.tag}
        </span>
        <FileText size={18} color="#5A5A66" strokeWidth={1.5} />
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: "#E8E8ED",
          letterSpacing: "-0.02em",
          marginBottom: 16,
          fontFamily: "var(--font-display, 'Instrument Sans', sans-serif)",
        }}
      >
        {card.title}
      </h3>

      {/* Description box */}
      <div
        style={{
          background: "#1A1A1E",
          border: "1px solid #222228",
          borderRadius: 10,
          padding: 16,
          marginBottom: 24,
        }}
      >
        <p
          style={{
            fontSize: 14,
            fontStyle: "italic",
            lineHeight: 1.6,
            color: "#8B8B96",
            margin: 0,
          }}
        >
          {card.tagline}
        </p>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Button */}
      <div>
        <button
          onClick={() => docId && onOpen(docId)}
          disabled={!docId || !!loadingId}
          style={{
            background: "#7B61FF",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            cursor: docId ? "pointer" : "not-allowed",
            opacity: docId ? 1 : 0.5,
            transition: "all 0.2s ease",
            transform: hov && docId ? "translateY(-1px)" : "translateY(0)",
            boxShadow: hov && docId ? "0 0 20px rgba(123, 97, 255, 0.4)" : "none",
          }}
        >
          {isLoading ? "Opening..." : `${card.buttonLabel} ↗`}
        </button>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Bottom Row — Asset Card                                            */
/* ------------------------------------------------------------------ */

function AssetCard({
  card,
  docId,
  index,
  loadingId,
  onOpen,
}: {
  card: HeroCard;
  docId?: string;
  index: number;
  loadingId: string | null;
  onOpen: (id: string) => void;
}) {
  const [hov, setHov] = useState(false);
  const [linkHov, setLinkHov] = useState(false);
  const isLoading = loadingId === docId;
  const isPlaceholder = !docId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#141416",
        border: "1px solid",
        borderColor: hov ? "#333" : "#222228",
        borderRadius: 16,
        padding: "24px 28px",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Title */}
      <h3
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: "#E8E8ED",
          fontFamily: "var(--font-display, 'Instrument Sans', sans-serif)",
          margin: 0,
        }}
      >
        {card.title}
      </h3>

      {/* Subtitle */}
      <p style={{ fontSize: 13, color: "#5A5A66", marginTop: 4, marginBottom: 20 }}>
        {card.tagline}
      </p>

      {/* Text link */}
      {isPlaceholder ? (
        <span style={{ fontSize: 13, fontWeight: 500, color: "#5A5A66" }}>
          Coming Soon
        </span>
      ) : (
        <span
          role="button"
          tabIndex={0}
          onClick={() => docId && onOpen(docId)}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && docId) {
              e.preventDefault();
              onOpen(docId);
            }
          }}
          onMouseEnter={() => setLinkHov(true)}
          onMouseLeave={() => setLinkHov(false)}
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: linkHov ? "#7B61FF" : "#8B8B96",
            cursor: "pointer",
            transition: "color 0.15s ease",
            width: "fit-content",
          }}
        >
          {isLoading ? "Opening..." : `${card.buttonLabel} ↗`}
        </span>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  const [docs, setDocs] = useState<ApiDoc[]>([]);
  const { openDoc, loadingId } = useOpenDoc();

  const fetchDocs = useCallback(async () => {
    try {
      const res = await fetch("/api/documents", { credentials: "include" });
      if (!res.ok) return;
      const data: ApiDoc[] = await res.json();
      setDocs(Array.isArray(data) ? data : []);
    } catch {
      // keep empty
    }
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const row1 = HERO_CARDS.filter((c) => c.row === 1);
  const row2 = HERO_CARDS.filter((c) => c.row === 2);

  return (
    <div>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "relative", padding: "64px 0 48px", marginBottom: 48 }}
      >
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(123,97,255,0.06), transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            display: "inline-block",
            padding: "4px 14px",
            borderRadius: 20,
            border: "1px solid var(--border)",
            marginBottom: 20,
          }}
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">
            Confidential — Investor Access Only
          </span>
        </div>
        <h1 className="mb-4 font-display text-5xl font-extrabold tracking-[-0.04em] leading-[1.1] text-text">
          MOI Data Room
        </h1>
        <p className="max-w-[560px] text-[17px] leading-[1.7] text-text-dim">
          The contextual compute network powering the next generation of
          decentralized applications. Everything you need for due diligence — all
          in one place.
        </p>
        <div className="mt-8 flex gap-3">
          <Button size="lg">Explore Documents</Button>
          <Button variant="ghost" size="lg">
            Schedule a Call ↗
          </Button>
        </div>
      </motion.div>

      {/* Row 1 — Research Paper Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
          marginBottom: 20,
        }}
      >
        {row1.map((card, i) => (
          <PaperCard
            key={card.id}
            card={card}
            docId={matchCardToDoc(card, docs)?.id}
            index={i}
            loadingId={loadingId}
            onOpen={openDoc}
          />
        ))}
      </div>

      {/* Row 2 — Asset Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
          marginBottom: 48,
        }}
      >
        {row2.map((card, i) => (
          <AssetCard
            key={card.id}
            card={card}
            docId={matchCardToDoc(card, docs)?.id}
            index={row1.length + i}
            loadingId={loadingId}
            onOpen={openDoc}
          />
        ))}
      </div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h3 className="mb-5 text-[13px] font-semibold uppercase tracking-[0.06em] text-text-muted">
          Network & Community
        </h3>
        <StatCardsGrid />
      </motion.div>
    </div>
  );
}
