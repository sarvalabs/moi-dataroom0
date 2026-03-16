"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./button";

export function AdminPasswordGate() {
  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ key }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Invalid key");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid key");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[280px] rounded-xl border border-border bg-surface p-6"
      >
        <label className="mb-2 block text-xs font-semibold text-text-dim">
          Admin access
        </label>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Enter key"
          className="mb-4 w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-[13px] text-text outline-none placeholder:text-text-muted"
          autoComplete="current-password"
        />
        {error && (
          <p className="mb-3 text-xs text-[#F87171]">{error}</p>
        )}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Checking…" : "Continue"}
        </Button>
      </form>
    </div>
  );
}
