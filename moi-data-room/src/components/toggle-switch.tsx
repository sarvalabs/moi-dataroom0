"use client";

import { useState } from "react";

export function ToggleSwitch({ checked: initial }: { checked: boolean }) {
  const [on, setOn] = useState(initial);

  return (
    <div
      onClick={() => setOn(!on)}
      style={{
        width: 40,
        height: 22,
        borderRadius: 11,
        padding: 2,
        cursor: "pointer",
        background: on ? "var(--accent)" : "var(--surface-2)",
        border: `1px solid ${on ? "var(--accent)" : "var(--border)"}`,
        transition: "all 0.2s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: on ? "flex-end" : "flex-start",
      }}
    >
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: 8,
          background: on ? "#fff" : "var(--text-muted)",
          transition: "all 0.2s ease",
        }}
      />
    </div>
  );
}
