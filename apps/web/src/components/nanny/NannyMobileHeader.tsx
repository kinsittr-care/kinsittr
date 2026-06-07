"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerClose,
} from "@/components/ui/drawer";
import { NannyNavLinks, useNannySidebarData } from "./NannySidebar";
import NannyAvatar from "./NannyAvatar";
import NannyNotificationsPanel from "./notifications/NannyNotificationsPanel";
import { useLogout } from "../auth/useLogout";

export default function NannyMobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { displayName, initials, isVerified, pendingCount, hasConversations } = useNannySidebarData();
  const logout = useLogout("nanny");

  return (
    <>
      {/* Mobile top bar — hidden on md+ */}
      <header className="md:hidden flex items-center gap-3 h-14 px-4 bg-nanny-bg border-b border-nanny-border shrink-0 z-10">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          className="text-nanny-ink-mute hover:text-nanny-green hover:bg-nanny-green-lt"
        >
          <Menu className="size-5" />
        </Button>

        {/* Logo */}
        <div className="flex items-center gap-2 flex-1">
          <div className="size-7 rounded-lg bg-nanny-green flex items-center justify-center text-[#f6efd9] font-display text-base">
            k
          </div>
          <span className="font-display text-[17px] text-nanny-green-dk leading-none">KinSittr</span>
        </div>

        <NannyNotificationsPanel />
      </header>

      {/* Drawer nav */}
      <Drawer open={open} onOpenChange={setOpen} direction="left">
        <DrawerContent className="bg-nanny-bg border-nanny-border flex flex-col pt-0">
          {/* Drawer header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-nanny-border-soft">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-[9px] bg-nanny-green flex items-center justify-center text-[#f6efd9] font-display text-lg">
                k
              </div>
              <div>
                <div className="font-display text-[19px] text-nanny-green-dk leading-none">KinSittr</div>
                <div className="text-[11px] text-nanny-ink-mute tracking-widest uppercase mt-0.5">Caregiver</div>
              </div>
            </div>
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Close navigation"
                className="text-nanny-ink-mute hover:text-nanny-green hover:bg-nanny-green-lt"
              >
                <X className="size-4" />
              </Button>
            </DrawerClose>
          </div>

          {/* Nav links */}
          <div className="flex-1 overflow-y-auto py-3">
            <NannyNavLinks
              pathname={pathname}
              pendingCount={pendingCount}
              hasConversations={hasConversations}
              onNavigate={() => setOpen(false)}
            />
          </div>

          {/* User footer */}
          <div className="flex items-center gap-3 mx-2.5 px-3.5 py-4 border-t border-nanny-border-soft">
            <NannyAvatar initials={initials} size={38} tone="cream" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-nanny-green-dk truncate">{displayName}</p>
              <p className="text-xs text-nanny-ink-mute mt-0.5">
                {isVerified ? "Verified caregiver" : "Caregiver"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="mx-2.5 mb-4 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Log out
          </button>
        </DrawerContent>
      </Drawer>
    </>
  );
}
