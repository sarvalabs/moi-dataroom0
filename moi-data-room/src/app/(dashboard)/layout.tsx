"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { NAV_ITEMS, type NavItem } from "@/lib/constants";
import { useMobileMenu } from "@/lib/use-mobile-menu";

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

function HamburgerButton() {
  const toggle = useMobileMenu((s) => s.toggle);
  return (
    <button
      onClick={toggle}
      aria-label="Open menu"
      className="mr-3 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-dim md:hidden"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M3 5h12M3 9h12M3 13h12" />
      </svg>
    </button>
  );
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
        className="flex min-h-screen min-w-0 flex-col ml-0 px-5 pt-5 md:ml-[230px] md:w-[calc(100%-230px)] md:px-14 md:pt-10"
        style={{
          transition: "margin-left 0.3s ease",
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        {/* Breadcrumb + hamburger */}
        <div className="mb-6 flex shrink-0 items-center text-xs text-text-muted md:mb-8">
          <HamburgerButton />
          <span className="cursor-pointer">Data Room</span>
          {activeId !== "home" && breadcrumb.length > 0 && breadcrumb.map((crumb, i) => (
            <span key={crumb.id} className="flex items-center gap-2">
              <span className="text-border ml-2">›</span>
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
              <span className="text-border ml-2">›</span>
              <span className="text-text-dim ml-2">Admin</span>
            </>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
