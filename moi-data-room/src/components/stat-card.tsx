"use client";

import { STATS } from "@/lib/constants";

function Badge({ delta }: { delta: string }) {
  const isActive = delta === "Active";
  const bg = isActive ? "rgba(123,97,255,0.12)" : "rgba(52,211,153,0.12)";
  const color = isActive ? "#7B61FF" : "#34D399";

  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11,
        fontWeight: 500,
        padding: "2px 7px",
        borderRadius: 999,
        background: bg,
        color,
        lineHeight: 1.4,
      }}
    >
      {delta}
    </span>
  );
}

export function StatCardsGrid() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 1,
        background: "var(--border)",
        border: "0.5px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {STATS.map((stat) => (
        <div
          key={stat.label}
          className="p-3 sm:p-[16px_18px]"
          style={{
            background: "var(--surface)",
            gridColumn: stat.label === "KMOI TVL" ? "span 2" : undefined,
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              marginBottom: 4,
            }}
          >
            {stat.label}
          </div>
          <div
            className="text-[17px] sm:text-[20px]"
            style={{
              fontWeight: 500,
              color: "var(--text)",
              marginBottom: 6,
            }}
          >
            {stat.value}
          </div>
          <Badge delta={stat.delta} />
        </div>
      ))}
    </div>
  );
}
