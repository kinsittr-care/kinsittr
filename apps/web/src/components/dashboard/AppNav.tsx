"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDashboard } from "./DashboardContext";
import Avatar from "./Avatar";
import { BrandMarkIcon } from "@/src/components/icons";

const NAV_TABS = [
  { id: "browse", label: "Browse", href: "/parent" },
  { id: "messages", label: "Messages", href: "/parent/messages" },
];

export default function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { hasMessages } = useDashboard();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/parent" ? pathname === "/parent" : pathname.startsWith(href);

  return (
    <>
      <nav
        style={{
          height: 62, background: "#fff",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center",
          padding: "0 28px", gap: 4, flexShrink: 0, zIndex: 10,
          boxShadow: "0 1px 8px rgba(40,30,20,.05)",
        }}
      >
        {/* Logo */}
        <Link
          href="/parent"
          className="flex items-center gap-[9px] no-underline"
          style={{ marginRight: 16 }}
        >
          <div
            style={{
              width: 30, height: 30, borderRadius: 8,
              background: "var(--teal)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <BrandMarkIcon />
          </div>
          <span className="font-display" style={{ fontSize: 20, color: "var(--brand-text)" }}>
            Kin<span style={{ color: "var(--teal)" }}>Sittr</span>
          </span>
        </Link>

        {/* Tabs */}
        <div className="flex gap-[2px]" style={{ flex: 1 }}>
          {NAV_TABS.map(({ id, label, href }) => {
            const active = isActive(href);
            return (
              <Link
                key={id}
                href={href}
                style={{
                  background: active ? "var(--teal-lt)" : "transparent",
                  borderRadius: 9, padding: "7px 18px",
                  fontSize: 14, cursor: "pointer",
                  color: active ? "var(--teal)" : "var(--muted)",
                  fontWeight: active ? 600 : 400,
                  display: "flex", alignItems: "center", gap: 7,
                  transition: "all .15s", position: "relative",
                  textDecoration: "none",
                }}
              >
                {label}
                {id === "messages" && hasMessages && (
                  <span
                    style={{
                      width: 7, height: 7, borderRadius: "50%",
                      background: "#e74c3c", display: "inline-block",
                      position: "absolute", top: 6, right: 10,
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* User avatar */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setDropdownOpen((p) => !p)}
            style={{
              width: 38, height: 38, borderRadius: "50%",
              background: "var(--teal)", color: "#fff",
              border: "none", cursor: "pointer",
              fontWeight: 600, fontSize: 14, letterSpacing: "0.04em",
              boxShadow: "0 2px 8px rgba(58,90,90,.32)",
              transition: "transform .12s", fontFamily: "inherit",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = "scale(1.06)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = "scale(1)")}
            aria-label="Open user menu"
          >
            JL
          </button>

          {dropdownOpen && (
            <div
              style={{
                position: "absolute", right: 0, top: "calc(100% + 10px)",
                background: "#fff", border: "1px solid var(--border)",
                borderRadius: 14, boxShadow: "0 12px 48px rgba(40,30,20,.14)",
                width: 210, zIndex: 100, overflow: "hidden",
              }}
            >
              {/* User info */}
              <div
                className="flex items-center gap-[10px]"
                style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}
              >
                <Avatar initials="JL" size={34} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Jordan Lee</div>
                  <div style={{ fontSize: 12, color: "var(--faint)" }}>jordan.lee@email.com</div>
                </div>
              </div>

              {/* Menu items */}
              {[
                { label: "Profile", href: "/parent/profile", icon: "👤" },
                { label: "Billing", href: "/parent/billing", icon: "💳" },
                { label: "Settings", href: "/parent/settings", icon: "⚙" },
              ].map(({ label, href, icon }) => (
                <button
                  key={label}
                  onClick={() => { router.push(href); setDropdownOpen(false); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center",
                    gap: 11, padding: "12px 18px",
                    background: "transparent", border: "none",
                    borderBottom: "1px solid var(--border)",
                    fontSize: 14, cursor: "pointer", color: "var(--brand-text)",
                    textAlign: "left", fontFamily: "inherit", transition: "background .1s",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--teal-lt)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
                >
                  <span style={{ fontSize: 16 }}>{icon}</span>
                  {label}
                </button>
              ))}

              {/* Log out */}
              <button
                style={{
                  width: "100%", display: "flex", alignItems: "center",
                  gap: 11, padding: "12px 18px",
                  background: "transparent", border: "none",
                  fontSize: 14, cursor: "pointer", color: "#c0392b",
                  textAlign: "left", fontFamily: "inherit", transition: "background .1s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#fdf5f5")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M11 11l3-3-3-3M14 8H6" stroke="#c0392b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Log out
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Dismiss dropdown on outside click */}
      {dropdownOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 9 }}
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </>
  );
}
