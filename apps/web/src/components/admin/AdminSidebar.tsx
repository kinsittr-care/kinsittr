"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
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

export const navItems = [
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

const badgeColorCls: Record<"red" | "amber", string> = {
  red: "bg-admin-red text-white",
  amber: "bg-admin-amber text-white",
};

const screeningBadgeParams = { page: 1, limit: 1, status: "pending" as const };
const flaggedReviewsBadgeParams = { page: 1, limit: 1, flagged: true };

function formatSidebarBadge(total: number | undefined) {
  if (!total || total < 1) return null;
  return total > 99 ? "99+" : String(total);
}

export type AdminBadgeValues = { screening: string | null; reviews: string | null };

export function useAdminSidebarBadges(enabled = true): AdminBadgeValues {
  const screeningBadgeQuery = useQuery({
    queryKey: adminScreeningNanniesQueryKey(screeningBadgeParams),
    queryFn: () => listAdminScreeningNannies(screeningBadgeParams),
    enabled,
    staleTime: 30_000,
  });
  const flaggedReviewsBadgeQuery = useQuery({
    queryKey: adminReviewsQueryKey(flaggedReviewsBadgeParams),
    queryFn: () => listAdminReviews(flaggedReviewsBadgeParams),
    enabled,
    staleTime: 30_000,
  });
  return {
    screening: formatSidebarBadge(screeningBadgeQuery.data?.data?.total),
    reviews: formatSidebarBadge(flaggedReviewsBadgeQuery.data?.data?.total),
  };
}

export function AdminNavLinks({
  pathname,
  badgeValues,
  onNavigate,
}: {
  pathname: string;
  badgeValues: AdminBadgeValues;
  onNavigate?: () => void;
}) {
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <nav className="flex flex-col gap-0.5 px-3 flex-1">
      {navItems.map((item) => {
        const active = isActive(item.href);
        const badgeCls = item.badgeTone ? badgeColorCls[item.badgeTone] : null;
        const badge = item.badgeKey ? badgeValues[item.badgeKey] : null;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-[14px] py-[11px] rounded-[10px] text-[14.5px] no-underline transition-all duration-150",
              active
                ? "font-semibold text-admin-clay bg-white border border-admin-border shadow-[0_1px_2px_rgba(80,40,20,.05)]"
                : "font-medium text-admin-ink-mid bg-transparent border border-transparent",
            )}
          >
            <span className="flex">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {badge && badgeCls && (
              <span className={cn("min-w-5 h-5 px-[6px] rounded-full inline-flex items-center justify-center text-[11px] font-bold", badgeCls)}>
                {badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminSidebar({
  user,
  badgeValues,
}: {
  user: AuthUser | null;
  badgeValues: AdminBadgeValues;
}) {
  const pathname = usePathname();
  const logout = useLogout("admin");
  const displayName = user ? `${user.firstname} ${user.lastname}`.trim() : "Admin";
  const initials = user
    ? `${user.firstname[0] ?? ""}${user.lastname[0] ?? ""}`.toUpperCase()
    : "AD";

  return (
    <aside className="hidden md:flex w-[264px] shrink-0 h-full bg-admin-sidebar border-r border-admin-border flex-col py-6">
      {/* Logo */}
      <div className="px-[22px] pt-1 pb-[22px] border-b border-admin-border-soft mb-[18px]">
        <div className="flex items-center gap-[10px]">
          <div className="w-[30px] h-[30px] rounded-lg bg-admin-card border border-admin-border flex items-center justify-center text-admin-clay font-display text-[16px] shadow-[0_1px_3px_rgba(80,40,20,.08)]">
            k
          </div>
          <div>
            <div className="font-display text-[19px] text-admin-ink leading-none">KinSittr</div>
            <div className="text-[11px] text-admin-ink-soft tracking-[.12em] uppercase mt-[3px]">Admin Console</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <AdminNavLinks pathname={pathname} badgeValues={badgeValues} />

      {/* Admin user */}
      <div className="px-[18px] pt-[18px] pb-[14px] mx-3 border-t border-admin-border-soft flex items-center gap-3">
        <AdminAvatar initials={initials} size={40} tone="clay" />
        <div className="min-w-0">
          <div className="text-[14px] font-semibold text-admin-ink overflow-hidden text-ellipsis whitespace-nowrap">{displayName}</div>
          <div className="text-[12px] text-admin-ink-soft mt-px overflow-hidden text-ellipsis whitespace-nowrap">{user?.email ?? ""}</div>
        </div>
      </div>
      <button
        type="button"
        onClick={logout}
        className="mx-6 px-[14px] py-[10px] rounded-[10px] border border-transparent bg-transparent text-[#b42318] text-[14px] font-bold cursor-pointer text-left"
      >
        Log out
      </button>
    </aside>
  );
}
