"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Avatar from "./Avatar";
import { BrandMarkIcon } from "@/src/components/icons";
import {
  conversationsQueryKey,
  listConversations,
} from "@/src/utils/api/conversations";
import ParentNotificationsPanel from "@/src/components/guardian/notifications/ParentNotificationsPanel";
import { cn } from "@/lib/utils";
import { useLogout } from "@/src/components/auth/useLogout";
import { getCurrentSession } from "@/src/utils/api/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_TABS = [
  { id: "browse", label: "Browse", href: "/parent" },
  { id: "messages", label: "Messages", href: "/parent/messages" },
];

export default function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout("parent");
  const sessionQuery = useQuery({ queryKey: ["auth-me"], queryFn: getCurrentSession });
  const session = sessionQuery.data?.data;
  const user = session?.user;
  const parentProfile = session?.parent_profile;
  const displayName = parentProfile?.display_name || [user?.firstname, user?.lastname].filter(Boolean).join(" ") || "Parent";
  const displayEmail = user?.email || "";
  const initials = getInitials(displayName);

  const { data: conversationsData } = useQuery({
    queryKey: conversationsQueryKey({ page: 1, limit: 1 }),
    queryFn: async () => listConversations({ page: 1, limit: 1 }),
  });
  const hasMessages = (conversationsData?.data?.total ?? 0) > 0;

  const isActive = (href: string) =>
    href === "/parent" ? pathname === "/parent" : pathname.startsWith(href);

  return (
    <>
      <nav className="h-14 sm:h-[62px] bg-white border-b border-border flex items-center px-4 sm:px-7 gap-1 shrink-0 z-10 shadow-[0_1px_8px_rgba(40,30,20,.05)]">
        {/* Logo */}
        <Link
          href="/parent"
          className="flex items-center gap-2 no-underline mr-2 sm:mr-4"
        >
          <div className="size-[30px] rounded-lg bg-teal flex items-center justify-center">
            <BrandMarkIcon />
          </div>
          <span className="hidden sm:block font-display text-xl text-brand-text">
            Kin<span className="text-teal">Sittr</span>
          </span>
        </Link>

        {/* Tabs */}
        <div className="flex gap-2 flex-1 min-w-0 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none]">
          {NAV_TABS.map(({ id, label, href }) => {
            const active = isActive(href);
            return (
              <Link
                key={id}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 shrink-0 whitespace-nowrap rounded-[9px] px-3 sm:px-4 py-1.5 sm:py-[7px] text-[13px] sm:text-sm transition-all no-underline relative",
                  active
                    ? "bg-teal-lt text-teal font-semibold"
                    : "bg-teal-dk text-teal-lt font-normal"
                )}
              >
                {label}
                {id === "messages" && hasMessages && (
                  <span className="absolute top-1.5 right-2 sm:right-2.5 size-[7px] rounded-full bg-red-500" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Notifications */}
        <div className="ml-1">
          <ParentNotificationsPanel />
        </div>

        <div className="ml-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="size-[38px] rounded-full bg-teal text-white border-none cursor-pointer font-semibold text-sm tracking-wide shadow-[0_2px_8px_rgba(58,90,90,.32)] transition-transform hover:scale-105 font-sans"
                aria-label="Open user menu"
              >
                {initials}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="w-52 overflow-hidden rounded-[14px] border-border bg-white p-0 shadow-[0_12px_48px_rgba(40,30,20,.14)]"
            >
              <div className="flex items-center gap-2.5 px-4 py-3.5">
                <Avatar initials={initials} size={34} />
                <div className="min-w-0">
                  <div className="truncate font-semibold text-sm text-brand-text">{displayName}</div>
                  <div className="truncate text-xs text-brand-faint">{displayEmail || "Email not set"}</div>
                </div>
              </div>
              <DropdownMenuSeparator className="m-0 bg-border" />

              {[
                { label: "Profile", href: "/parent/profile", icon: "👤" },
                { label: "Reviews", href: "/parent/reviews", icon: "★" },
                { label: "Billing", href: "/parent/billing", icon: "💳" },
                { label: "Settings", href: "/parent/settings", icon: "⚙" },
              ].map(({ label, href, icon }) => (
                <DropdownMenuItem
                  key={label}
                  onSelect={() => router.push(href)}
                  className="cursor-pointer gap-3 rounded-none border-b border-border px-4 py-3 text-sm text-brand-text focus:bg-teal-lt focus:text-brand-text"
                >
                  <span className="text-base">{icon}</span>
                  {label}
                </DropdownMenuItem>
              ))}

              <DropdownMenuItem
                variant="destructive"
                onSelect={logout}
                className="cursor-pointer gap-3 rounded-none px-4 py-3 text-sm text-red-600 focus:bg-red-50 focus:text-red-600"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] ?? "P"}${parts[1]?.[0] ?? ""}`.toUpperCase();
}
