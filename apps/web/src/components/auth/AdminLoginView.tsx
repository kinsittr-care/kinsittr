"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "./LoginForm";
import { establishAdminAuthSession, getCurrentAdminSession, loginAdmin } from "@/src/utils/api/admin/auth";
import { clearAuthSession } from "@/src/utils/api/session";

export default function AdminLoginView() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const response = await getCurrentAdminSession();
        if (!active) return;
        if (response.data?.user.role === "admin") {
          router.replace("/admin");
          return;
        }
        clearAuthSession();
      } catch {
        clearAuthSession();
      } finally {
        if (active) setCheckingSession(false);
      }
    }

    void checkSession();

    return () => {
      active = false;
    };
  }, [router]);

  if (checkingSession) return null;

  return (
    <LoginForm
      establishSession={establishAdminAuthSession}
      login={loginAdmin}
      requiredRole="admin"
    />
  );
}
