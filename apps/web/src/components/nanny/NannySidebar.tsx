"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getCurrentSession } from "@/src/utils/api/auth";
import { listNannyBookings, nannyBookingsQueryKey } from "@/src/utils/api/bookings";
import { conversationsQueryKey, listConversations } from "@/src/utils/api/conversations";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import NannyAvatar from "./NannyAvatar";
import NannyNotificationsPanel from "./notifications/NannyNotificationsPanel";

export const navItems = [
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
    href: "/nanny/reviews",
    label: "Reviews",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2.5l1.9 3.9 4.3.6-3.1 3 .7 4.3L9 12.3l-3.8 2 .7-4.3-3.1-3 4.3-.6L9 2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
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

export function useNannySidebarData() {
  const sessionQuery = useQuery({ queryKey: ["auth-me"], queryFn: getCurrentSession });
  const pendingParams = { page: 1, limit: 1, status: "pending" as const };
  const pendingBookingsQuery = useQuery({
    queryKey: nannyBookingsQueryKey(pendingParams),
    queryFn: async () => listNannyBookings(pendingParams),
  });
  const conversationsQuery = useQuery({
    queryKey: conversationsQueryKey({ page: 1, limit: 1 }),
    queryFn: async () => listConversations({ page: 1, limit: 1 }),
  });

  const session = sessionQuery.data?.data;
  const displayName =
    session?.nanny_profile?.display_name ||
    [session?.user.firstname, session?.user.lastname].filter(Boolean).join(" ") ||
    "Nanny";
  const initials = displayName.split(" ").map((p: string) => p[0]).join("").slice(0, 2).toUpperCase();
  const isVerified = session?.nanny_profile?.verification_status === "verified";
  const pendingCount = pendingBookingsQuery.data?.data?.total ?? 0;
  const hasConversations = (conversationsQuery.data?.data?.total ?? 0) > 0;

  return { displayName, initials, isVerified, pendingCount, hasConversations };
}

export function NannyNavLinks({
  pathname,
  pendingCount,
  hasConversations,
  onNavigate,
}: {
  pathname: string;
  pendingCount: number;
  hasConversations: boolean;
  onNavigate?: () => void;
}) {
  const isActive = (href: string) =>
    href === "/nanny" ? pathname === "/nanny" : pathname.startsWith(href);

  return (
    <nav className="flex flex-col gap-0.5 px-2.5 flex-1">
      {navItems.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14.5px] font-medium transition-colors relative",
              "border-l-[3px]",
              active
                ? "bg-nanny-green-lt text-nanny-green border-nanny-green font-semibold"
                : "text-nanny-ink border-transparent hover:bg-nanny-green-lt/50"
            )}
          >
            <span className="flex shrink-0">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.href === "/nanny/messages" && hasConversations && (
              <span className="size-2 rounded-full bg-nanny-green" />
            )}
            {item.href === "/nanny/requests" && pendingCount > 0 && (
              <Badge className="min-w-5 h-5 px-1.5 text-[11px] bg-nanny-amber border-0">
                {pendingCount}
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export default function NannySidebar() {
  const pathname = usePathname();
  const { displayName, initials, isVerified, pendingCount, hasConversations } = useNannySidebarData();

  return (
    <aside className="hidden md:flex w-[260px] shrink-0 h-full flex-col bg-nanny-bg border-r border-nanny-border py-6">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 pb-5 mb-4 border-b border-nanny-border-soft">
        <div className="size-8 rounded-[9px] bg-nanny-green flex items-center justify-center text-[#f6efd9] font-display text-lg shrink-0">
          k
        </div>
        <div>
          <div className="font-display text-[19px] text-nanny-green-dk leading-none">KinSittr</div>
          <div className="text-[11px] text-nanny-ink-mute tracking-widest uppercase mt-0.5">Caregiver</div>
        </div>
      </div>

      {/* Nav */}
      <NannyNavLinks
        pathname={pathname}
        pendingCount={pendingCount}
        hasConversations={hasConversations}
      />

      {/* User + notifications */}
      <div className="flex items-center gap-3 mx-2.5 px-3.5 pt-4 mt-2 border-t border-nanny-border-soft">
        <NannyAvatar initials={initials} size={40} tone="cream" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-nanny-green-dk truncate">{displayName}</p>
          <p className="text-xs text-nanny-ink-mute mt-0.5">
            {isVerified ? "Verified caregiver" : "Caregiver"}
          </p>
        </div>
        <NannyNotificationsPanel />
      </div>
    </aside>
  );
}
