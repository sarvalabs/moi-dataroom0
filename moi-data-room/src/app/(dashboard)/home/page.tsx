"use client";

import { useState, useEffect, useCallback } from "react";
import { StatCardsGrid } from "@/components/stat-card";
import { LandingFooter } from "@/components/landing-footer";
import { EmailGateModal, getStoredLeadEmail } from "@/components/email-gate-modal";
import { HERO_CARDS, type HeroCard } from "@/lib/constants";

interface ApiDoc {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  show_on_overview?: boolean;
  home_hero_slot?: string | null;
  require_email?: boolean;
}

function titleMatchesAnyHint(docTitle: string, card: HeroCard): boolean {
  const hints = [
    card.matchTitleHint,
    ...(card.matchTitleHintsExtra ?? []),
  ].filter((h): h is string => Boolean(h?.trim()));
  if (hints.length === 0) return false;
  const lower = docTitle.toLowerCase();
  return hints.some((h) => lower.includes(h.toLowerCase()));
}

function matchCardToDoc(card: HeroCard, docs: ApiDoc[]): ApiDoc | undefined {
  const pinned = docs.find((d) => d.home_hero_slot === card.id);
  if (pinned) return pinned;

  const unpinned = docs.filter((d) => !d.home_hero_slot);
  const pool = card.matchCategory
    ? unpinned.filter((d) => d.category === card.matchCategory)
    : unpinned.filter((d) => d.show_on_overview);

  const hasHints =
    Boolean(card.matchTitleHint?.trim()) ||
    (card.matchTitleHintsExtra?.length ?? 0) > 0;

  if (hasHints) {
    const byTitle = pool.find((d) => titleMatchesAnyHint(d.title, card));
    return byTitle;
  }

  return pool[0];
}

function getDocPreview(card: HeroCard): string {
  switch (card.id) {
    case "foundation":
      return "Math paper";
    case "paradigm":
      return "Contextual Compute Paper";
    case "network":
      return "Whitepaper";
    default:
      return card.title;
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
  const docName = getDocPreview(card);
  const docNameMultiline = card.id === "paradigm";

  return (
    <a
      href="#"
      onClick={(e) => onOpen(e, docId)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        boxSizing: "border-box",
        width: "100%",
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
        padding: "18px 16px 16px",
        minHeight: 200,
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
        className="font-display text-[22px] font-bold tracking-[-0.03em] text-white sm:text-[28px]"
        style={{ margin: "0 0 8px 0" }}
      >
        {card.title}
      </h3>

      {/* Description */}
      <p
        className="text-[13px] italic font-medium text-[#E8E8ED] leading-[1.55] sm:text-[15px]"
        style={{ margin: "0 0 16px 0", flexGrow: 1 }}
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
          alignItems: docNameMultiline ? "flex-start" : "center",
          gap: 12,
          transition: "border-color 0.2s ease",
        }}
      >
        <span
          style={{
            flexShrink: 0,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.05em",
            color: "#7B61FF",
            background: "rgba(123, 97, 255, 0.12)",
            border: "1px solid rgba(123, 97, 255, 0.2)",
            padding: "6px 10px",
            borderRadius: 6,
          }}
        >
          PDF
        </span>

        {/* Doc text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#E8E8ED",
              ...(docNameMultiline
                ? {
                    whiteSpace: "normal" as const,
                    lineHeight: 1.4,
                  }
                : {
                    whiteSpace: "nowrap" as const,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }),
            }}
          >
            {docName}
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
        boxSizing: "border-box",
        width: "100%",
        height: "fit-content",
        alignSelf: "start",
        textDecoration: "none",
        background: "#141416",
        border: "1px solid",
        borderColor: hov ? "#333" : "#222228",
        borderRadius: 14,
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "border-color 0.2s ease",
      }}
    >
      <div style={{ minWidth: 0 }}>
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
  const [gatedDoc, setGatedDoc] = useState<{ id: string; title: string } | null>(null);

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

  const openDocDirect = useCallback(
    async (docId: string, email?: string, preOpenedTab?: Window | null) => {
      const tab = preOpenedTab ?? window.open("about:blank", "_blank");
      try {
        const endpoint = email ? "/api/document-access" : "/api/download";
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(
            email ? { documentId: docId, email } : { documentId: docId },
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
      }
    },
    [],
  );

  const handleOpen = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, docId?: string) => {
      event.preventDefault();
      if (!docId) return;
      const doc = docs.find((d) => d.id === docId);
      if (doc?.require_email) {
        const stored = getStoredLeadEmail();
        if (stored) {
          const tab = window.open("about:blank", "_blank");
          openDocDirect(docId, stored, tab);
        } else {
          setGatedDoc({ id: docId, title: doc.title });
        }
      } else {
        const tab = window.open("about:blank", "_blank");
        openDocDirect(docId, undefined, tab);
      }
    },
    [docs, openDocDirect],
  );

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="min-w-0 flex-1">
      {/* Hero */}
      <div
        className="animate-fade-in-up relative mb-8 px-0 pt-8 pb-6 md:mb-12 md:pt-16 md:pb-12"
      >
        <div
          className="hidden sm:block"
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
        <h1 className="mb-4 font-display text-3xl font-extrabold tracking-[-0.04em] leading-[1.1] text-text md:text-5xl">
          MOI Data Room
        </h1>
        <p className="max-w-[560px] text-[15px] leading-[1.7] text-text-dim md:text-[17px]">
          The contextual compute network powering the participant layer of the internet — the
          context infrastructure of the AI economy.
        </p>
        <div className="mt-6 flex gap-3 md:mt-8">
          <a
            href="https://calendly.com/aikrish/meet"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-accent bg-accent-dim px-7 py-3 text-sm font-sans font-semibold tracking-[0.01em] text-accent transition-all duration-200 hover:bg-accent-glow sm:w-auto"
          >
            Schedule a Call ↗
          </a>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 md:mb-12">
        {row1.map((card) => (
          <PaperCard
            key={card.id}
            card={card}
            docId={matchCardToDoc(card, docs)?.id}
            onOpen={handleOpen}
          />
        ))}
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
      <div className="animate-fade-in-up" style={{ animationDelay: "0.3s", animationFillMode: "backwards" }}>
        <h3 className="mb-5 text-[13px] font-semibold uppercase tracking-[0.06em] text-text-muted">
          Network & Community
        </h3>
        <StatCardsGrid />
      </div>
      </div>
      <LandingFooter />

      {gatedDoc && (
        <EmailGateModal
          docTitle={gatedDoc.title}
          onSubmit={async (email) => {
            const tab = window.open("about:blank", "_blank");
            await openDocDirect(gatedDoc.id, email, tab);
            setGatedDoc(null);
          }}
          onClose={() => setGatedDoc(null)}
        />
      )}
    </div>
  );
}
