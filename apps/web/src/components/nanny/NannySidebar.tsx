"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getCurrentSession } from "@/src/utils/api/auth";
import { listNannyBookings, nannyBookingsQueryKey } from "@/src/utils/api/bookings";
import { conversationsQueryKey, listConversations } from "@/src/utils/api/conversations";
import { N } from "./tokens";
import NannyAvatar from "./NannyAvatar";
import { useIsMobile } from "@/src/components/guardian/dashboard/useIsMobile";

const navItems = [
  {
    href: "/nanny",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="2" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10" y="2" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.5" />
        <rect x="2" y="10" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10" y="10" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    href: "/nanny/requests",
    label: "Requests",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 5h12M3 9h8M3 13h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/nanny/messages",
    label: "Messages",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 3h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5l-4 3V4a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/nanny/profile",
    label: "Profile",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2.5 16c0-3.5 2.9-6 6.5-6s6.5 2.5 6.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/nanny/earnings",
    label: "Earnings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2v14M5 6h5.5a2.5 2.5 0 0 1 0 5H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/nanny/payments",
    label: "Payments",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 8h14" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

export default function NannySidebar() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const sessionQuery = useQuery({
    queryKey: ["auth-me"],
    queryFn: getCurrentSession,
  });
  const pendingParams = { page: 1, limit: 1, status: "pending" as const };
  const pendingBookingsQuery = useQuery({
    queryKey: nannyBookingsQueryKey(pendingParams),
    queryFn: async () => listNannyBookings(pendingParams),
  });
  const session = sessionQuery.data?.data;
  const displayName =
    session?.nanny_profile?.display_name ||
    [session?.user.firstname, session?.user.lastname].filter(Boolean).join(" ") ||
    "Nanny";
  const pendingCount = pendingBookingsQuery.data?.data?.total ?? 0;
  const conversationsQuery = useQuery({
    queryKey: conversationsQueryKey({ page: 1, limit: 1 }),
    queryFn: async () => listConversations({ page: 1, limit: 1 }),
  });
  const hasConversations = (conversationsQuery.data?.data?.total ?? 0) > 0;

  const isActive = (href: string) =>
    href === "/nanny" ? pathname === "/nanny" : pathname.startsWith(href);

  if (isMobile) return null;

  return (
    <aside
      style={{
        width: 260,
        flexShrink: 0,
        height: "100%",
        background: N.bgDeep,
        borderRight: `1px solid ${N.border}`,
        display: "flex",
        flexDirection: "column",
        padding: "24px 0",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "4px 22px 22px",
          borderBottom: `1px solid ${N.borderSoft}`,
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: N.green,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#f6efd9",
              fontFamily: "DM Serif Display, var(--font-dm-serif), serif",
              fontSize: 18,
            }}
          >
            k
          </div>
          <div>
            <div
              style={{
                fontFamily: "DM Serif Display, var(--font-dm-serif), serif",
                fontSize: 19,
                color: N.greenDk,
                lineHeight: 1,
              }}
            >
              KinSittr
            </div>
            <div
              style={{
                fontSize: 11,
                color: N.inkMute,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                marginTop: 3,
              }}
            >
              Caregiver
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          padding: "0 10px",
          flex: 1,
        }}
      >
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="nanny-sidebar-link"
              data-active={active ? "true" : "false"}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 14px",
                borderRadius: 10,
                fontSize: 14.5,
                fontWeight: active ? 600 : 500,
                color: active ? N.green : N.inkSoft,
                background: active ? N.greenLt : "transparent",
                textDecoration: "none",
                transition: "background .15s",
                position: "relative",
                borderLeft: active ? `3px solid ${N.green}` : "3px solid transparent",
              }}
            >
              <span style={{ display: "flex" }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.href === "/nanny/messages" && hasConversations && (
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: N.green,
                    display: "inline-block",
                  }}
                />
              )}
              {item.href === "/nanny/requests" && pendingCount > 0 && (
                <span
                  style={{
                    minWidth: 20,
                    height: 20,
                    padding: "0 6px",
                    borderRadius: 999,
                    background: N.amber,
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div
        style={{
          padding: "18px 18px 12px",
          margin: "0 10px",
          borderTop: `1px solid ${N.borderSoft}`,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <NannyAvatar initials={displayName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()} size={40} tone="cream" />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: N.greenDk }}>{displayName}</div>
          <div style={{ fontSize: 12, color: N.inkMute, marginTop: 1 }}>
            {session?.nanny_profile?.verification_status === "verified" ? "Verified caregiver" : "Caregiver"}
          </div>
        </div>
      </div>
    </aside>
  );
}
