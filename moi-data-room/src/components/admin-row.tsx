"use client";

import { useState } from "react";
import { Pill } from "./pill";
import { Button } from "./button";
import type { Document } from "@/lib/types";

function statusVariant(s: string) {
  if (s === "published") return "green" as const;
  if (s === "draft") return "amber" as const;
  return "red" as const;
}

function statusLabel(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function categoryLabel(cat: string) {
  if (cat === "overview") return "Overview";
  if (cat === "contextual_compute") return "Contextual Compute";
  if (cat === "usecases") return "Use Cases";
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

export function AdminRow({
  doc,
  onDelete,
}: {
  doc: Document & { view_count?: number };
  onDelete: () => void;
}) {
  const [hov, setHov] = useState(false);
  const views = doc.view_count ?? 0;

  return (
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
        <Button variant="ghost" size="sm">
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
  );
}
