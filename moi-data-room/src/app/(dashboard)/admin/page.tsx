"use client";

import { useState, useEffect, useCallback } from "react";
import { BentoCard } from "@/components/bento-card";
import { Button } from "@/components/button";
import { Pill } from "@/components/pill";
import { ToggleSwitch } from "@/components/toggle-switch";
import { AdminRow } from "@/components/admin-row";
import { UploadModal } from "@/components/upload-modal";
import {
  ANALYTICS_DATA,
  ACCESS_USERS,
} from "@/lib/constants";
import type { Document } from "@/lib/types";

export default function AdminDashboard() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchDocs = useCallback(async () => {
    try {
      const res = await fetch("/api/documents", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load documents");
      const data = await res.json();
      setDocs(Array.isArray(data) ? data : []);
    } catch {
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
      setDocs((prev) => prev.filter((d) => d.id !== id));
    } catch {
      // could set error state
    }
  }, []);

  const topDocs = [...docs].sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0)).slice(0, 5);
  const maxViews = Math.max(...topDocs.map((d) => d.view_count ?? 0), 1);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-[22px] font-bold tracking-[-0.02em] text-text">
            Admin Dashboard
          </h2>
          <p className="mt-1 text-[13px] text-text-muted">
            Manage documents, permissions, and analytics
          </p>
        </div>
        <Button size="md" onClick={() => setShowModal(true)}>
          + Upload Document
        </Button>
      </div>

      {/* Analytics Cards */}
      <div className="mb-8 grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3.5">
        {ANALYTICS_DATA.map((a) => (
          <BentoCard key={a.label}>
            <div className="mb-2 text-xs font-medium text-text-muted">
              {a.label}
            </div>
            <div className="text-[28px] font-bold tracking-[-0.03em] text-text">
              {a.value}
            </div>
            <div className="mt-2">
              <Pill variant="green">{a.delta}</Pill>
            </div>
          </BentoCard>
        ))}
      </div>

      {/* Most Viewed Documents */}
      <BentoCard className="mb-6">
        <h3 className="mb-5 text-[13px] font-semibold uppercase tracking-[0.06em] text-text-muted">
          Most Viewed Documents
        </h3>
        <div className="flex flex-col gap-3">
          {topDocs.map((d) => (
            <div key={d.id} className="flex items-center gap-3.5">
              <div className="w-[140px] shrink-0 truncate text-xs text-text-dim">
                {d.title}
              </div>
              <div className="h-6 flex-1 overflow-hidden rounded-md bg-surface-2">
                <div
                  className="flex h-full items-center justify-end rounded-md pr-2"
                  style={{
                    width: `${((d.view_count ?? 0) / maxViews) * 100}%`,
                    background: "linear-gradient(90deg, var(--accent), #9B81FF)",
                    transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)",
                  }}
                >
                  <span className="text-[10px] font-bold text-white">
                    {d.view_count ?? 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </BentoCard>

      {/* Document Management Table */}
      <BentoCard>
        <h3 className="mb-5 text-[13px] font-semibold uppercase tracking-[0.06em] text-text-muted">
          Document Management
        </h3>
        <div className="flex flex-col gap-0.5">
          <div
            className="grid items-center gap-3 rounded-lg bg-surface-2 px-4 py-2.5"
            style={{
              gridTemplateColumns: "1fr 120px 100px 100px 80px 140px",
            }}
          >
            {["Document", "Category", "Status", "Embeddings", "Views", "Actions"].map(
              (h) => (
                <div
                  key={h}
                  className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted"
                >
                  {h}
                </div>
              ),
            )}
          </div>
          {loading ? (
            <div className="py-8 text-center text-[13px] text-text-muted">
              Loading…
            </div>
          ) : (
            docs.map((d) => (
              <AdminRow
                key={d.id}
                doc={d}
                onDelete={() => handleDelete(d.id)}
              />
            ))
          )}
        </div>
      </BentoCard>

      {/* Access Permissions */}
      <BentoCard className="mt-6">
        <h3 className="mb-5 text-[13px] font-semibold uppercase tracking-[0.06em] text-text-muted">
          Access Permissions
        </h3>
        {ACCESS_USERS.map((user, i) => (
          <div
            key={user.name}
            className="flex items-center justify-between py-3"
            style={{
              borderBottom:
                i < ACCESS_USERS.length - 1
                  ? "1px solid var(--border)"
                  : "none",
            }}
          >
            <div>
              <div className="text-[13px] font-medium text-text">
                {user.name}
              </div>
              <div className="mt-0.5 text-[11px] text-text-muted">
                {user.role}
              </div>
            </div>
            <ToggleSwitch checked={user.access} />
          </div>
        ))}
      </BentoCard>

      {showModal && (
        <UploadModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchDocs}
        />
      )}
    </div>
  );
}
