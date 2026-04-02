"use client";

import { useState } from "react";
import { Button } from "./button";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STORAGE_KEY = "moi_lead_email";

export function getStoredLeadEmail(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(STORAGE_KEY);
}

export function storeLeadEmail(email: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, email);
}

export function EmailGateModal({
  docTitle,
  onSubmit,
  onClose,
}: {
  docTitle: string;
  onSubmit: (email: string) => void;
  onClose: () => void;
}) {
  const [email, setEmail] = useState(getStoredLeadEmail() ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError("Please enter your email.");
      return;
    }
    if (!EMAIL_RE.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setSubmitting(true);
    storeLeadEmail(trimmed);
    onSubmit(trimmed);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[1000] flex items-center justify-center backdrop-blur-[4px]"
      style={{ background: "rgba(0,0,0,0.7)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[400px] max-w-[90vw] rounded-2xl border border-border bg-surface p-8"
      >
        <div className="mb-1 flex items-center gap-2">
          <span className="text-lg">🔒</span>
          <h3 className="text-lg font-bold text-text">Access Required</h3>
        </div>
        <p className="mb-6 mt-1 text-xs text-text-muted">
          Enter your email to access <strong className="text-text-dim">{docTitle}</strong>.
        </p>

        <div className="mb-5">
          <label className="mb-1.5 block text-xs font-semibold text-text-dim">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            disabled={submitting}
            placeholder="you@company.com"
            autoFocus
            className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 font-sans text-[13px] text-text outline-none focus:border-accent"
          />
        </div>

        {error && <p className="mb-4 text-xs text-[#F87171]">{error}</p>}

        <div className="flex justify-end gap-2.5">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Opening…" : "Continue"}
          </Button>
        </div>

        <p className="mt-4 text-center text-[10px] text-text-muted">
          Your email is used only to grant access and will not be shared.
        </p>
      </div>
    </div>
  );
}
