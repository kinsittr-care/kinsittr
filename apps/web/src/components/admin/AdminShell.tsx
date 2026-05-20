"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { A } from "./tokens";
import AdminSidebar from "./AdminSidebar";
import { AuthUser } from "@/src/types/api/api";
import { getCurrentAdminSession } from "@/src/utils/api/admin/auth";
import { clearAuthSession } from "@/src/utils/api/session";

export default function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [adminUser, setAdminUser] = useState<AuthUser | null>(null);

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
    <div
      style={{
        display: "flex",
        height: "100dvh",
        background: A.bg,
        overflow: "hidden",
      }}
    >
      <AdminSidebar user={adminUser} />
      <main style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
        {children}
      </main>
    </div>
  );
}
