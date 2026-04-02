"use client";

import { useState, useEffect, useSyncExternalStore, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, type NavItem } from "@/lib/constants";
import { useMobileMenu } from "@/lib/use-mobile-menu";

const MOBILE_BP = 768;
const MOBILE_QUERY = `(max-width: ${MOBILE_BP - 1}px)`;

function useIsMobile() {
  const subscribe = useCallback((cb: () => void) => {
    const mql = window.matchMedia(MOBILE_QUERY);
    mql.addEventListener("change", cb);
    return () => mql.removeEventListener("change", cb);
  }, []);
  const getSnapshot = useCallback(() => window.matchMedia(MOBILE_QUERY).matches, []);
  const getServerSnapshot = useCallback(() => false, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function SidebarItem({
  item,
  active,
  collapsed,
  onNav,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onNav?: () => void;
}) {
  const [hov, setHov] = useState(false);

  return (
    <Link
      href={item.href}
      onClick={onNav}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: collapsed ? "10px 12px" : "9px 14px",
        borderRadius: 10,
        cursor: "pointer",
        background: active
          ? "var(--accent-dim)"
          : hov
            ? "rgba(255,255,255,0.03)"
            : "transparent",
        color: active ? "var(--accent)" : hov ? "var(--text)" : "var(--text-dim)",
        transition: "all 0.15s ease",
        position: "relative",
        justifyContent: collapsed ? "center" : "flex-start",
        textDecoration: "none",
      }}
    >
      {active && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            width: 3,
            height: 20,
            borderRadius: 2,
            background: "var(--accent)",
          }}
        />
      )}
      <span
        style={{
          fontSize: 16,
          flexShrink: 0,
          width: 20,
          textAlign: "center",
        }}
      >
        {item.icon}
      </span>
      {!collapsed && (
        <span
          style={{
            fontSize: 13,
            fontWeight: active ? 600 : 500,
            whiteSpace: "nowrap",
            letterSpacing: "0.01em",
          }}
        >
          {item.label}
        </span>
      )}
    </Link>
  );
}

function SidebarGroup({
  item,
  pathname,
  collapsed,
  onNav,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
  onNav?: () => void;
}) {
  const isChildActive = item.children?.some((c) => pathname === c.href) ?? false;
  const isSelfActive = pathname === item.href;
  const [expanded, setExpanded] = useState(isSelfActive || isChildActive);
  const [hov, setHov] = useState(false);

  return (
    <div>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: collapsed ? "10px 12px" : "9px 14px",
          borderRadius: 10,
          cursor: "pointer",
          background: isSelfActive
            ? "var(--accent-dim)"
            : hov
              ? "rgba(255,255,255,0.03)"
              : "transparent",
          color: isSelfActive || isChildActive
            ? "var(--accent)"
            : hov
              ? "var(--text)"
              : "var(--text-dim)",
          transition: "all 0.15s ease",
          position: "relative",
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        {isSelfActive && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              width: 3,
              height: 20,
              borderRadius: 2,
              background: "var(--accent)",
            }}
          />
        )}
        <Link
          href={item.href}
          onClick={onNav}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flex: 1,
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <span style={{ fontSize: 16, flexShrink: 0, width: 20, textAlign: "center" }}>
            {item.icon}
          </span>
          {!collapsed && (
            <span
              style={{
                fontSize: 13,
                fontWeight: isSelfActive ? 600 : 500,
                whiteSpace: "nowrap",
                letterSpacing: "0.01em",
              }}
            >
              {item.label}
            </span>
          )}
        </Link>
        {!collapsed && item.children && (
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "inherit",
              padding: "2px 4px",
              fontSize: 10,
              opacity: 0.6,
              transition: "transform 0.2s ease",
              transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
            }}
          >
            ▶
          </button>
        )}
      </div>

      {!collapsed && expanded && item.children && (
        <div style={{ paddingLeft: 18, marginTop: 2 }}>
          {item.children.map((child) => (
            <SidebarItem
              key={child.id}
              item={child}
              active={pathname === child.href}
              collapsed={false}
              onNav={onNav}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { open: mobileOpen, close: closeMobile } = useMobileMenu();
  const [collapsed, setCollapsed] = useState(false);
  const [adminHov, setAdminHov] = useState(false);

  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  const effectiveCollapsed = isMobile ? false : collapsed;
  const sidebarWidth = isMobile ? 260 : effectiveCollapsed ? 60 : 230;

  const visible = isMobile ? mobileOpen : true;

  return (
    <>
      {/* Backdrop for mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          onClick={closeMobile}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 199,
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      <div
        style={{
          width: sidebarWidth,
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
          padding: "20px 0",
          display: "flex",
          flexDirection: "column",
          transition: isMobile
            ? "transform 0.3s cubic-bezier(0.16,1,0.3,1)"
            : "width 0.3s cubic-bezier(0.16,1,0.3,1)",
          zIndex: 200,
          overflow: "hidden",
          transform: visible ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: effectiveCollapsed ? "0 12px 20px" : "0 20px 20px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: isMobile ? "default" : "pointer",
          }}
          onClick={() => {
            if (!isMobile) setCollapsed(!collapsed);
          }}
        >
          <img
            src="/logo-moi-dark.svg"
            alt="MOI"
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              flexShrink: 0,
              objectFit: "contain",
            }}
          />
          {!effectiveCollapsed && (
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--text)",
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
              }}
            >
              MOI Protocol
            </span>
          )}

          {/* Close button on mobile */}
          {isMobile && (
            <button
              onClick={closeMobile}
              aria-label="Close menu"
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                fontSize: 20,
                cursor: "pointer",
                padding: "4px 8px",
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          )}
        </div>

        <div
          style={{
            height: 1,
            background: "var(--border)",
            margin: effectiveCollapsed ? "0 8px 12px" : "0 16px 12px",
          }}
        />

        {/* Nav Items */}
        <div
          style={{
            flex: 1,
            padding: effectiveCollapsed ? "0 8px" : "0 10px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            overflowY: "auto",
          }}
        >
          {NAV_ITEMS.map((item) =>
            item.children && item.children.length > 0 ? (
              <SidebarGroup
                key={item.id}
                item={item}
                pathname={pathname}
                collapsed={effectiveCollapsed}
                onNav={isMobile ? closeMobile : undefined}
              />
            ) : (
              <SidebarItem
                key={item.id}
                item={item}
                active={pathname === item.href}
                collapsed={effectiveCollapsed}
                onNav={isMobile ? closeMobile : undefined}
              />
            )
          )}
        </div>

        <div
          style={{
            marginTop: "auto",
            borderTop: "1px solid var(--border)",
            margin: effectiveCollapsed ? "12px 8px 0" : "12px 16px 0",
            padding: effectiveCollapsed ? "12px 0 16px" : "12px 0 20px",
          }}
        >
          <Link
            href="/admin"
            title="Admin"
            onClick={isMobile ? closeMobile : undefined}
            onMouseEnter={() => setAdminHov(true)}
            onMouseLeave={() => setAdminHov(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: effectiveCollapsed ? "10px 12px" : "9px 14px",
              borderRadius: 10,
              textDecoration: "none",
              fontSize: 13,
              fontWeight: pathname === "/admin" ? 600 : 500,
              color:
                pathname === "/admin"
                  ? "var(--accent)"
                  : adminHov
                    ? "var(--text)"
                    : "var(--text-muted)",
              background:
                pathname === "/admin"
                  ? "var(--accent-dim)"
                  : adminHov
                    ? "rgba(255,255,255,0.03)"
                    : "transparent",
              transition: "color 0.15s ease, background 0.15s ease",
              justifyContent: effectiveCollapsed ? "center" : "flex-start",
            }}
          >
            <span style={{ fontSize: 16, width: 20, textAlign: "center", flexShrink: 0 }}>
              ⧉
            </span>
            {!effectiveCollapsed && <span>Admin</span>}
          </Link>
        </div>
      </div>
    </>
  );
}
