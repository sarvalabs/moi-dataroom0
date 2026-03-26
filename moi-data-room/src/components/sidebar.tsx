"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, type NavItem } from "@/lib/constants";

function SidebarItem({
  item,
  active,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}) {
  const [hov, setHov] = useState(false);

  return (
    <Link
      href={item.href}
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

function allChildHrefs(item: NavItem): string[] {
  const hrefs = [item.href];
  if (item.children) {
    for (const child of item.children) {
      hrefs.push(...allChildHrefs(child));
    }
  }
  return hrefs;
}

function SidebarGroup({
  item,
  pathname,
  collapsed,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
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
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      style={{
        width: collapsed ? 60 : 230,
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        padding: "20px 0",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s cubic-bezier(0.16,1,0.3,1)",
        zIndex: 100,
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? "0 12px 20px" : "0 20px 20px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          cursor: "pointer",
        }}
        onClick={() => setCollapsed(!collapsed)}
      >
        <img
          src="/moi-logo.jpeg"
          alt="MOI"
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            flexShrink: 0,
            objectFit: "cover",
          }}
        />
        {!collapsed && (
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
      </div>

      <div
        style={{
          height: 1,
          background: "var(--border)",
          margin: collapsed ? "0 8px 12px" : "0 16px 12px",
        }}
      />

      {/* Nav Items */}
      <div
        style={{
          flex: 1,
          padding: collapsed ? "0 8px" : "0 10px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {NAV_ITEMS.map((item) =>
          item.children && item.children.length > 0 ? (
            <SidebarGroup
              key={item.id}
              item={item}
              pathname={pathname}
              collapsed={collapsed}
            />
          ) : (
            <SidebarItem
              key={item.id}
              item={item}
              active={pathname === item.href}
              collapsed={collapsed}
            />
          )
        )}
      </div>
    </div>
  );
}
