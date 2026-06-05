"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { A } from "./tokens";
import AdminAvatar from "./compositions/AdminAvatar";
import {
  GridIcon,
  DiamondIcon,
  ClockIcon,
  FlagIcon,
  ChartIcon,
} from "./compositions/admin-icons";
import type { AuthUser } from "@/src/types/api/api";
import {
  adminReviewsQueryKey,
  listAdminReviews,
} from "@/src/utils/api/admin/reviews";
import {
  adminScreeningNanniesQueryKey,
  listAdminScreeningNannies,
} from "@/src/utils/api/admin/screening";
import { useLogout } from "../auth/useLogout";

const navItems = [
  {
    href: "/admin",
    label: "Screening Queue",
    badgeKey: "screening" as const,
    badgeTone: "red" as const,
    icon: <GridIcon />,
  },
  {
    href: "/admin/nannies",
    label: "All Nannies",
    icon: <DiamondIcon />,
  },
  {
    href: "/admin/parents",
    label: "Parents",
    icon: <GridIcon />,
  },
  {
    href: "/admin/bookings",
    label: "Bookings",
    icon: <ClockIcon />,
  },
  {
    href: "/admin/conversations",
    label: "Conversations",
    icon: <FlagIcon />,
  },
  {
    href: "/admin/flags",
    label: "Flagged Reviews",
    badgeKey: "reviews" as const,
    badgeTone: "amber" as const,
    icon: <FlagIcon />,
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    icon: <ChartIcon />,
  },
  {
    href: "/admin/admins",
    label: "Admin Management",
    icon: <GridIcon />,
  },
];

const badgeColors = {
  red:   { bg: A.red,   fg: "#fff" },
  amber: { bg: A.amber, fg: "#fff" },
};

const screeningBadgeParams = { page: 1, limit: 1, status: "pending" as const };
const flaggedReviewsBadgeParams = { page: 1, limit: 1, flagged: true };

function formatSidebarBadge(total: number | undefined) {
  if (!total || total < 1) return null;
  return total > 99 ? "99+" : String(total);
}

export default function AdminSidebar({ user }: { user: AuthUser | null }) {
  const pathname = usePathname();
  const logout = useLogout("admin");
  const screeningBadgeQuery = useQuery({
    queryKey: adminScreeningNanniesQueryKey(screeningBadgeParams),
    queryFn: () => listAdminScreeningNannies(screeningBadgeParams),
    staleTime: 30_000,
  });
  const flaggedReviewsBadgeQuery = useQuery({
    queryKey: adminReviewsQueryKey(flaggedReviewsBadgeParams),
    queryFn: () => listAdminReviews(flaggedReviewsBadgeParams),
    staleTime: 30_000,
  });
  const displayName = user ? `${user.firstname} ${user.lastname}`.trim() : "Admin";
  const initials = user
    ? `${user.firstname[0] ?? ""}${user.lastname[0] ?? ""}`.toUpperCase()
    : "AD";
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  const badgeValues = {
    screening: formatSidebarBadge(screeningBadgeQuery.data?.data?.total),
    reviews: formatSidebarBadge(flaggedReviewsBadgeQuery.data?.data?.total),
  };

  return (
    <aside
      style={{
        width: 264,
        flexShrink: 0,
        height: "100%",
        background: A.sidebar,
        borderRight: `1px solid ${A.border}`,
        display: "flex",
        flexDirection: "column",
        padding: "24px 0",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "4px 22px 22px",
          borderBottom: `1px solid ${A.borderSoft}`,
          marginBottom: 18,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: A.clay,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontFamily: "var(--font-dm-serif), serif",
              fontSize: 16,
            }}
          >
            k
          </div>
          <div>
            <div
              style={{
                fontFamily: "var(--font-dm-serif), serif",
                fontSize: 19,
                color: A.ink,
                lineHeight: 1,
              }}
            >
              KinSittr
            </div>
            <div
              style={{
                fontSize: 11,
                color: A.inkSoft,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                marginTop: 3,
              }}
            >
              Admin Console
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
          padding: "0 12px",
          flex: 1,
        }}
      >
        {navItems.map((item) => {
          const active = isActive(item.href);
          const bc = item.badgeTone ? badgeColors[item.badgeTone] : null;
          const badge = item.badgeKey ? badgeValues[item.badgeKey] : null;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 14px",
                borderRadius: 10,
                fontSize: 14.5,
                fontWeight: active ? 600 : 500,
                color: active ? A.clay : A.inkMid,
                background: active ? "#fff" : "transparent",
                border: active ? `1px solid ${A.border}` : "1px solid transparent",
                boxShadow: active ? "0 1px 2px rgba(80,40,20,.05)" : "none",
                textDecoration: "none",
                transition: "all .15s",
              }}
            >
              <span style={{ display: "flex" }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {badge && bc && (
                <span
                  style={{
                    minWidth: 20,
                    height: 20,
                    padding: "0 6px",
                    borderRadius: 999,
                    background: bc.bg,
                    color: bc.fg,
                    fontSize: 11,
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Admin user */}
      <div
        style={{
          padding: "18px 18px 14px",
          margin: "0 12px",
          borderTop: `1px solid ${A.borderSoft}`,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <AdminAvatar initials={initials} size={40} tone="clay" />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: A.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</div>
          <div style={{ fontSize: 12, color: A.inkSoft, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email ?? ""}</div>
        </div>
      </div>
      <button
        type="button"
        onClick={logout}
        style={{
          margin: "0 24px",
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid transparent",
          background: "transparent",
          color: "#b42318",
          fontSize: 14,
          fontWeight: 700,
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        Log out
      </button>
    </aside>
  );
}
