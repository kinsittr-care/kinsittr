"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar, { useAdminSidebarBadges } from "./AdminSidebar";
import AdminMobileHeader from "./AdminMobileHeader";
import { AuthUser } from "@/src/types/api/api";
import { getCurrentAdminSession } from "@/src/utils/api/admin/auth";
import { clearAuthSession } from "@/src/utils/api/session";

export default function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [adminUser, setAdminUser] = useState<AuthUser | null>(null);
  const badgeValues = useAdminSidebarBadges(authorized);

  useEffect(() => {
    let active = true;

    async function validateAdminSession() {
      try {
        const response = await getCurrentAdminSession();
        if (!active) return;
        if (response.data?.user.role !== "admin") {
          clearAuthSession();
          router.replace("/auth/admin");
          return;
        }
        setAdminUser(response.data.user);
        setAuthorized(true);
      } catch {
        clearAuthSession();
        if (active) router.replace("/auth/admin");
      }
    }

    void validateAdminSession();

    return () => {
      active = false;
    };
  }, [router]);

  if (!authorized) return null;

  return (
    <div className="flex h-dvh overflow-hidden bg-admin-bg">
      <AdminSidebar user={adminUser} badgeValues={badgeValues} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminMobileHeader user={adminUser} badgeValues={badgeValues} />
        <main className="flex-1 overflow-auto flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
