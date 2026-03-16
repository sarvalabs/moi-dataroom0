"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";

function SidebarItem({
  item,
  active,
  collapsed,
}: {
  item: (typeof NAV_ITEMS)[number];
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

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const activeId =
    NAV_ITEMS.find((item) => pathname === item.href)?.id ?? "home";

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
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: "linear-gradient(135deg, var(--accent), #9B81FF)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            color: "#fff",
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          M
        </div>
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
        {NAV_ITEMS.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            active={activeId === item.id}
            collapsed={collapsed}
          />
        ))}
      </div>
    </div>
  );
}
