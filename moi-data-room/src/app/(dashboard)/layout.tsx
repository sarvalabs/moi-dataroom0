"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { ChatBot } from "@/components/chat-widget";
import { NAV_ITEMS } from "@/lib/constants";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const activeId =
    NAV_ITEMS.find((item) => pathname === item.href)?.id ??
    (pathname === "/admin" ? "admin" : "home");

  return (
    <div className="min-h-screen bg-bg font-sans text-text">
      <Sidebar />
      <div
        style={{
          marginLeft: 230,
          minHeight: "100vh",
          padding: "40px 56px 80px",
          maxWidth: 960,
          transition: "margin-left 0.3s ease",
          position: "relative",
        }}
      >
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-xs text-text-muted">
          <span className="cursor-pointer">Data Room</span>
          {activeId !== "home" && (
            <>
              <span className="text-border">›</span>
              <span className="text-text-dim">
                {activeId === "admin"
                  ? "Admin"
                  : NAV_ITEMS.find((n) => n.id === activeId)?.label}
              </span>
            </>
          )}
        </div>
        {children}
        {/* Subtle Admin link at bottom of page */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            right: 56,
          }}
        >
          <Link
            href="/admin"
            className="text-[11px] text-text-muted hover:text-text-dim transition-colors"
          >
            Admin
          </Link>
        </div>
      </div>
      <ChatBot />
    </div>
  );
}
