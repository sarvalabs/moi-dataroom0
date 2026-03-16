"use client";

import { useState } from "react";

export function BentoCard({
  children,
  span = 1,
  className,
}: {
  children: React.ReactNode;
  span?: number;
  className?: string;
}) {
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={className}
      style={{
        gridColumn: span > 1 ? `span ${span}` : undefined,
        background: "var(--surface)",
        borderRadius: 16,
        border: `1px solid ${hov ? "rgba(123,97,255,0.3)" : "var(--border)"}`,
        padding: "24px 28px",
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "hidden",
        boxShadow: hov
          ? "0 0 30px rgba(123,97,255,0.06), inset 0 0 30px rgba(123,97,255,0.02)"
          : "none",
      }}
    >
      {hov && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(123,97,255,0.25), transparent)",
          }}
        />
      )}
      {children}
    </div>
  );
}
