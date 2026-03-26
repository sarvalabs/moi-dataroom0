"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
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

function getDocPreview(card: HeroCard) {
  switch (card.id) {
    case "foundation":
      return { name: "MOI Mathematics Paper", meta: "PDF · 42 pages" };
    case "paradigm":
      return { name: "Contextual Compute Paper", meta: "PDF · 38 pages" };
    case "network":
      return { name: "MOI Network Whitepaper", meta: "PDF · 56 pages" };
    default:
      return { name: card.title, meta: "PDF" };
  }
}

function PaperCard({
  card,
  docId,
  onOpen,
}: {
  card: HeroCard;
  docId?: string;
  onOpen: (e: React.MouseEvent<HTMLAnchorElement>, id?: string) => void;
}) {
  const [hov, setHov] = useState(false);
  const preview = getDocPreview(card);

  return (
    <a
      href="#"
      onClick={(e) => onOpen(e, docId)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        textDecoration: "none",
        display: "flex",
        flexDirection: "column",
        background: "#141416",
        borderStyle: "solid",
        borderWidth: "2px 1px 1px 1px",
        borderTopColor: "#7B61FF",
        borderRightColor: hov ? "rgba(123,97,255,0.3)" : "#222228",
        borderBottomColor: hov ? "rgba(123,97,255,0.3)" : "#222228",
        borderLeftColor: hov ? "rgba(123,97,255,0.3)" : "#222228",
        borderRadius: 16,
        padding: "26px 24px 24px",
        minHeight: 305,
        transition: "border-color 0.3s ease, box-shadow 0.3s ease",
        boxShadow: hov ? "0 8px 40px rgba(0,0,0,0.25)" : "none",
      }}
    >
      {/* Tag */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase" as const,
            color: "#5A5A66",
          }}
        >
          {card.tag}
        </span>
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily: "var(--font-display, 'Instrument Sans', sans-serif)",
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          color: "#fff",
          margin: "0 0 8px 0",
        }}
      >
        {card.title}
      </h3>

      {/* Description */}
      <p
        style={{
          fontSize: 14,
          fontStyle: "italic",
          color: "#8B8B96",
          lineHeight: 1.55,
          margin: "0 0 22px 0",
          flexGrow: 1,
        }}
      >
        {card.tagline}
      </p>

      {/* Doc Preview */}
      <div
        style={{
          background: "#111113",
          border: "1px solid",
          borderColor: hov ? "rgba(123,97,255,0.2)" : "#222228",
          borderRadius: 10,
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          transition: "border-color 0.2s ease",
        }}
      >
        {/* Doc icon */}
        <div
          style={{
            width: 36,
            height: 44,
            background: "#1A1A1E",
            border: "1px solid #222228",
            borderRadius: 5,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true" style={{ opacity: 0.7 }}>
            <line x1="3" y1="5" x2="11" y2="5" stroke="#7B61FF" strokeWidth="1.4" />
            <line x1="3" y1="9" x2="9" y2="9" stroke="#7B61FF" strokeWidth="1.4" />
          </svg>
          {/* Folded corner */}
          <div
            style={{
              position: "absolute",
              top: -1,
              right: -1,
              width: 10,
              height: 10,
              background: "#111113",
              borderLeft: "1px solid #222228",
              borderBottom: "1px solid #222228",
              borderRadius: "0 0 0 3px",
            }}
          />
        </div>

        {/* Doc text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#E8E8ED",
              whiteSpace: "nowrap" as const,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {preview.name}
          </div>
          <div style={{ fontSize: 11, color: "#5A5A66", marginTop: 2 }}>
            {preview.meta}
          </div>
        </div>

        {/* Arrow */}
        <div
          style={{
            color: "#5A5A66",
            opacity: hov ? 1 : 0.4,
            transform: hov ? "translate(1px, -1px)" : "translate(0, 0)",
            transition: "opacity 0.2s ease, transform 0.2s ease",
            flexShrink: 0,
            display: "flex",
          }}
        >
          <svg viewBox="0 0 16 16" width="14" height="14">
            <path
              d="M5 11L11 5M7 5h4v4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </a>
  );
}

function AssetCard({
  card,
  docId,
  onOpen,
}: {
  card: HeroCard;
  docId?: string;
  onOpen: (e: React.MouseEvent<HTMLAnchorElement>, id?: string) => void;
}) {
  const [hov, setHov] = useState(false);

  return (
    <a
      href="#"
      onClick={(e) => onOpen(e, docId)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        textDecoration: "none",
        background: "#141416",
        border: "1px solid",
        borderColor: hov ? "#333" : "#222228",
        borderRadius: 14,
        padding: "22px 26px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "border-color 0.2s ease",
      }}
    >
      <div>
        <h3
          style={{
            fontFamily: "var(--font-display, 'Instrument Sans', sans-serif)",
            fontSize: 17,
            fontWeight: 600,
            color: "#E8E8ED",
            margin: "0 0 2px 0",
          }}
        >
          {card.title}
        </h3>
        <p style={{ fontSize: 13, color: "#5A5A66", margin: 0 }}>
          {card.tagline}
        </p>
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: hov ? "#7B61FF" : "#8B8B96",
          display: "flex",
          alignItems: "center",
          gap: 5,
          transition: "color 0.2s ease",
          flexShrink: 0,
        }}
      >
        <span>Open</span>
        <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
          <path
            d="M5 11L11 5M7 5h4v4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </a>
  );
}

export default function HomePage() {
  const [docs, setDocs] = useState<ApiDoc[]>([]);

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

  const handleOpen = useCallback(
    async (event: React.MouseEvent<HTMLAnchorElement>, docId?: string) => {
      event.preventDefault();
      if (!docId) return;
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
      }
    },
    []
  );

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
            background: "radial-gradient(circle, rgba(123,97,255,0.06), transparent 70%)",
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
          gap: 16,
          marginBottom: 16,
        }}
      >
        {row1.map((card) => (
          <PaperCard
            key={card.id}
            card={card}
            docId={matchCardToDoc(card, docs)?.id}
            onOpen={handleOpen}
          />
        ))}
      </div>

      {/* Row 2 — Asset Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 48,
        }}
      >
        {row2.map((card) => (
          <AssetCard
            key={card.id}
            card={card}
            docId={matchCardToDoc(card, docs)?.id}
            onOpen={handleOpen}
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
