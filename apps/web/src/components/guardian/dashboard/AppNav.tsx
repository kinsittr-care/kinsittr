"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
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

const NAV_TABS = [
  { id: "browse", label: "Browse", href: "/parent" },
  { id: "messages", label: "Messages", href: "/parent/messages" },
];

export default function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

        {/* User avatar */}
        <div className="relative ml-1">
          <button
            onClick={() => setDropdownOpen((p) => !p)}
            className="size-[38px] rounded-full bg-teal text-white border-none cursor-pointer font-semibold text-sm tracking-wide shadow-[0_2px_8px_rgba(58,90,90,.32)] transition-transform hover:scale-105 font-sans"
            aria-label="Open user menu"
          >
            JL
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-[calc(100%+10px)] bg-white border border-border rounded-[14px] shadow-[0_12px_48px_rgba(40,30,20,.14)] w-52 z-50 overflow-hidden">
              {/* User info */}
              <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-border">
                <Avatar initials="JL" size={34} />
                <div>
                  <div className="font-semibold text-sm text-brand-text">Jordan Lee</div>
                  <div className="text-xs text-brand-faint">jordan.lee@email.com</div>
                </div>
              </div>

              {/* Menu items */}
              {[
                { label: "Profile", href: "/parent/profile", icon: "👤" },
                { label: "Reviews", href: "/parent/reviews", icon: "★" },
                { label: "Billing", href: "/parent/billing", icon: "💳" },
                { label: "Settings", href: "/parent/settings", icon: "⚙" },
              ].map(({ label, href, icon }) => (
                <button
                  key={label}
                  onClick={() => { router.push(href); setDropdownOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-transparent border-0 border-b border-border text-sm cursor-pointer text-brand-text text-left font-sans transition-colors hover:bg-teal-lt"
                >
                  <span className="text-base">{icon}</span>
                  {label}
                </button>
              ))}

              {/* Log out */}
              <button
                className="w-full flex items-center gap-3 px-4 py-3 bg-transparent border-0 text-sm cursor-pointer text-red-600 text-left font-sans transition-colors hover:bg-red-50"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Log out
              </button>
            </div>
          )}
        </div>
      </nav>

      {dropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </>
  );
}
