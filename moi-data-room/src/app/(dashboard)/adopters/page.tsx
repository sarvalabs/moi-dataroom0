"use client";

import { useState, useEffect, useCallback } from "react";

interface Adopter {
  id: string;
  name: string;
  description: string | null;
  link: string | null;
  type: "business" | "dapp";
  created_at: string;
}

function AdopterRow({ adopter, delay }: { adopter: Adopter; delay: number }) {
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 2fr auto",
        alignItems: "start",
        gap: 16,
        padding: "14px 18px",
        borderRadius: 10,
        background: hov ? "var(--surface-2)" : "transparent",
        transition: "background 0.15s ease",
        animation: `fadeSlideUp 0.5s cubic-bezier(0.16,1,0.3,1) ${delay}ms both`,
      }}
    >
      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "var(--text)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {adopter.name}
      </span>

      <span
        style={{
          fontSize: 13,
          color: "var(--text-dim)",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          lineHeight: "1.5",
        }}
      >
        {adopter.description ?? "—"}
      </span>

      {adopter.link ? (
        <a
          href={adopter.link}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--accent)",
            textDecoration: "none",
            padding: "6px 14px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--surface)",
            transition: "all 0.15s ease",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--accent-dim)";
            e.currentTarget.style.borderColor = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--surface)";
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        >
          Visit&thinsp;↗
        </a>
      ) : (
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>—</span>
      )}
    </div>
  );
}

function AdopterTable({ title, adopters }: { title: string; adopters: Adopter[] }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: "var(--text)",
          marginBottom: 16,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h2>

      {/* Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr auto",
          gap: 16,
          padding: "10px 18px",
          borderBottom: "1px solid var(--border)",
          marginBottom: 4,
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Name
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Description
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Link
        </span>
      </div>

      {/* Rows */}
      {adopters.map((adopter, i) => (
        <AdopterRow key={adopter.id} adopter={adopter} delay={i * 60} />
      ))}

      {adopters.length === 0 && (
        <div
          style={{
            padding: "32px 18px",
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: 13,
          }}
        >
          No entries yet.
        </div>
      )}
    </div>
  );
}

export default function AdoptersPage() {
  const [adopters, setAdopters] = useState<Adopter[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdopters = useCallback(async () => {
    try {
      const res = await fetch("/api/adopters");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setAdopters(Array.isArray(data) ? data : []);
    } catch {
      setAdopters([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdopters();
  }, [fetchAdopters]);

  const businesses = adopters.filter((a) => a.type === "business");
  const dapps = adopters.filter((a) => a.type === "dapp");

  return (
    <div style={{ maxWidth: 900, width: "100%" }}>
      <h1
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: "var(--text)",
          marginBottom: 6,
          letterSpacing: "-0.02em",
          fontFamily: "var(--font-instrument-sans), sans-serif",
        }}
      >
        Adopters
      </h1>
      <p
        style={{
          fontSize: 14,
          color: "var(--text-dim)",
          marginBottom: 40,
        }}
      >
        Businesses and dApps building on MOI.
      </p>

      {loading ? (
        <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, padding: 40 }}>
          Loading...
        </div>
      ) : (
        <>
          <AdopterTable title="Businesses" adopters={businesses} />
          <AdopterTable title="dApps" adopters={dapps} />
        </>
      )}
    </div>
  );
}
