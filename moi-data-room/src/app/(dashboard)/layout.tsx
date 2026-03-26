"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { ChatBot } from "@/components/chat-widget";
import { NAV_ITEMS, type NavItem } from "@/lib/constants";

function findNavItem(items: readonly NavItem[], href: string): NavItem | undefined {
  for (const item of items) {
    if (item.href === href) return item;
    if (item.children) {
      const child = findNavItem(item.children, href);
      if (child) return child;
    }
  }
  return undefined;
}

function findBreadcrumb(items: readonly NavItem[], href: string): NavItem[] {
  for (const item of items) {
    if (item.href === href) return [item];
    if (item.children) {
      const trail = findBreadcrumb(item.children, href);
      if (trail.length > 0) return [item, ...trail];
    }
  }
  return [];
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const matched = findNavItem(NAV_ITEMS, pathname);
  const activeId = matched?.id ?? (pathname === "/admin" ? "admin" : "home");
  const breadcrumb = findBreadcrumb(NAV_ITEMS, pathname);

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
          {activeId !== "home" && breadcrumb.length > 0 && breadcrumb.map((crumb, i) => (
            <span key={crumb.id} className="flex items-center gap-2">
              <span className="text-border">›</span>
              {i < breadcrumb.length - 1 ? (
                <Link href={crumb.href} className="text-text-muted hover:text-text-dim transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-text-dim">{crumb.label}</span>
              )}
            </span>
          ))}
          {activeId === "admin" && (
            <>
              <span className="text-border">›</span>
              <span className="text-text-dim">Admin</span>
            </>
          )}
        </div>
        {children}
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
