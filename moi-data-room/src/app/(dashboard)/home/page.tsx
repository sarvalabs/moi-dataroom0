"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { StatCardsGrid } from "@/components/stat-card";
import { Button } from "@/components/button";
import { DOC_SLOTS } from "@/lib/constants";

const DOT_COLORS: Record<string, string> = {
  "Litepaper": "#7B61FF",
  "Slide Deck": "#2DD4BF",
  "Yellow Paper": "#F59E0B",
  "Contextual Compute": "#EF4444",
};

interface QuickDoc {
  title: string;
  sub: string;
  docId?: string;
}

function QuickAccessRow({
  item,
  isLast,
}: {
  item: QuickDoc;
  isLast: boolean;
}) {
  const [hov, setHov] = useState(false);
  const [loading, setLoading] = useState(false);
  const dot = DOT_COLORS[item.title] ?? "var(--accent)";

  const handleClick = async () => {
    if (!item.docId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ documentId: item.docId }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={handleClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 0",
        borderBottom: isLast ? "none" : "0.5px solid var(--border)",
        cursor: item.docId ? "pointer" : "default",
        borderRadius: 6,
        marginLeft: -8,
        marginRight: -8,
        paddingLeft: 8,
        paddingRight: 8,
        background: hov ? "rgba(255,255,255,0.03)" : "transparent",
        opacity: item.docId ? 1 : 0.5,
        transition: "background 0.15s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: dot,
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>
          {item.title}
        </span>
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
          {item.sub}
        </span>
      </div>
      <span style={{ fontSize: 13, color: "var(--text-dim)" }}>
        {loading ? "…" : "↗"}
      </span>
    </div>
  );
}

function matchDoc(
  slotCategory: string,
  docs: { id: string; category: string }[]
): string | undefined {
  const found = docs.find((d) => d.category === slotCategory);
  return found?.id;
}

export default function HomePage() {
  const [quickDocs, setQuickDocs] = useState<QuickDoc[]>(
    DOC_SLOTS.map((s) => ({ title: s.label, sub: s.sub }))
  );

  const linkDocs = useCallback(async () => {
    try {
      const res = await fetch("/api/documents", { credentials: "include" });
      if (!res.ok) return;
      const docs: { id: string; category: string }[] = await res.json();
      setQuickDocs(
        DOC_SLOTS.map((s) => ({
          title: s.label,
          sub: s.sub,
          docId: matchDoc(s.slot, docs),
        }))
      );
    } catch {
      // keep fallback
    }
  }, []);

  useEffect(() => {
    linkDocs();
  }, [linkDocs]);

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

      {/* Quick Access */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{ marginBottom: 48 }}
      >
        <h3 className="mb-5 text-[13px] font-semibold uppercase tracking-[0.06em] text-text-muted">
          Quick Access
        </h3>
        <div>
          {quickDocs.map((item, i) => (
            <QuickAccessRow
              key={item.title}
              item={item}
              isLast={i === quickDocs.length - 1}
            />
          ))}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="mb-5 text-[13px] font-semibold uppercase tracking-[0.06em] text-text-muted">
          Network & Community
        </h3>
        <StatCardsGrid />
      </motion.div>
    </div>
  );
}
