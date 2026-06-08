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
import { A } from "./tokens";
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
      <header
        className="md:hidden flex items-center gap-3 h-14 px-4 shrink-0 z-10 border-b"
        style={{ background: A.sidebar, borderColor: A.border }}
      >
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          style={{ color: A.inkMid }}
        >
          <Menu className="size-5" />
        </Button>

        <div className="flex items-center gap-2 flex-1">
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: A.clay,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontFamily: "var(--font-dm-serif), serif",
              fontSize: 15,
            }}
          >
            k
          </div>
          <span style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 17, color: A.ink, lineHeight: 1 }}>
            KinSittr
          </span>
        </div>
      </header>

      {/* Mobile nav */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" showCloseButton={false} className="flex flex-col pt-0" style={{ background: A.sidebar, borderColor: A.border }}>
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Navigate between admin console sections.
          </SheetDescription>
          {/* Sheet header */}
          <div
            className="flex items-center justify-between px-5 pt-5 pb-4 border-b"
            style={{ borderColor: A.borderSoft }}
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
                <div style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 19, color: A.ink, lineHeight: 1 }}>
                  KinSittr
                </div>
                <div style={{ fontSize: 11, color: A.inkSoft, letterSpacing: ".12em", textTransform: "uppercase", marginTop: 3 }}>
                  Admin Console
                </div>
              </div>
            </div>
            <SheetClose asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Close navigation"
                style={{ color: A.inkMid }}
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
              <div style={{ fontSize: 14, fontWeight: 600, color: A.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {displayName}
              </div>
              <div style={{ fontSize: 12, color: A.inkSoft, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.email ?? ""}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            style={{
              margin: "0 24px 16px",
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
        </SheetContent>
      </Sheet>
    </>
  );
}
