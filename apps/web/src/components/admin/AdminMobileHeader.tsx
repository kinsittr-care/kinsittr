"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { AdminNavLinks, type AdminBadgeValues } from "./AdminSidebar";
import AdminAvatar from "./compositions/AdminAvatar";
import { useLogout } from "../auth/useLogout";
import type { AuthUser } from "@/src/types/api/api";

export default function AdminMobileHeader({
  user,
  badgeValues,
}: {
  user: AuthUser | null;
  badgeValues: AdminBadgeValues;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const logout = useLogout("admin");
  const displayName = user ? `${user.firstname} ${user.lastname}`.trim() : "Admin";
  const initials = user
    ? `${user.firstname[0] ?? ""}${user.lastname[0] ?? ""}`.toUpperCase()
    : "AD";

  return (
    <>
      {/* Mobile top bar — hidden on md+ */}
      <header className="md:hidden flex items-center gap-3 h-14 px-4 shrink-0 z-10 border-b bg-admin-sidebar border-admin-border">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          className="text-admin-ink-mid"
        >
          <Menu className="size-5" />
        </Button>

        <div className="flex items-center gap-2 flex-1">
          <div className="w-7 h-7 rounded-[7px] bg-admin-card border border-admin-border flex items-center justify-center text-admin-clay font-display text-[15px] shadow-[0_1px_3px_rgba(80,40,20,.08)]">
            k
          </div>
          <span className="font-display text-[17px] text-admin-ink leading-none">
            KinSittr
          </span>
        </div>
      </header>

      {/* Mobile nav */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="flex flex-col pt-0 bg-admin-sidebar border-admin-border"
        >
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Navigate between admin console sections.
          </SheetDescription>
          {/* Sheet header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-admin-border-soft">
            <div className="flex items-center gap-[10px]">
              <div className="w-[30px] h-[30px] rounded-lg bg-admin-card border border-admin-border flex items-center justify-center text-admin-clay font-display text-[16px] shadow-[0_1px_3px_rgba(80,40,20,.08)]">
                k
              </div>
              <div>
                <div className="font-display text-[19px] text-admin-ink leading-none">
                  KinSittr
                </div>
                <div className="text-[11px] text-admin-ink-soft tracking-[.12em] uppercase mt-[3px]">
                  Admin Console
                </div>
              </div>
            </div>
            <SheetClose asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Close navigation"
                className="text-admin-ink-mid"
              >
                <X className="size-4" />
              </Button>
            </SheetClose>
          </div>

          {/* Nav links */}
          <div className="flex-1 overflow-y-auto py-2">
            <AdminNavLinks
              pathname={pathname}
              badgeValues={badgeValues}
              onNavigate={() => setOpen(false)}
            />
          </div>

          {/* User footer */}
          <div className="px-[18px] pt-[18px] pb-[14px] mx-3 border-t border-admin-border-soft flex items-center gap-3">
            <AdminAvatar initials={initials} size={40} tone="clay" />
            <div className="min-w-0">
              <div className="text-[14px] font-semibold text-admin-ink overflow-hidden text-ellipsis whitespace-nowrap">
                {displayName}
              </div>
              <div className="text-[12px] text-admin-ink-soft mt-px overflow-hidden text-ellipsis whitespace-nowrap">
                {user?.email ?? ""}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="mx-6 mb-4 px-[14px] py-[10px] rounded-[10px] border border-transparent bg-transparent text-[#b42318] text-[14px] font-bold cursor-pointer text-left"
          >
            Log out
          </button>
        </SheetContent>
      </Sheet>
    </>
  );
}
