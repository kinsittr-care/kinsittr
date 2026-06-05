"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthUser } from "@/src/types/api/api";
import { getCurrentSession } from "@/src/utils/api/auth";
import { getCurrentAdminSession } from "@/src/utils/api/admin/auth";
import { getPostAuthRedirectPath } from "@/src/utils/api/auth-routing";
import { clearAuthSession } from "@/src/utils/api/session";

interface AuthGuardProps {
  role: AuthUser["role"];
  children: ReactNode;
}

const authPath = {
  parent: "/auth/parent",
  nanny: "/auth/nanny",
  admin: "/auth/admin",
} as const;

export default function AuthGuard({ role, children }: AuthGuardProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;

    async function validateSession() {
      try {
        const response = role === "admin" ? await getCurrentAdminSession() : await getCurrentSession();
        if (!active) return;

        const user = response.data?.user;
        if (!user) {
          clearAuthSession();
          router.replace(authPath[role]);
          return;
        }

        if (user.role !== role) {
          router.replace(getPostAuthRedirectPath(user));
          return;
        }

        setAuthorized(true);
      } catch {
        clearAuthSession();
        if (active) router.replace(authPath[role]);
      }
    }

    void validateSession();

    return () => {
      active = false;
    };
  }, [role, router]);

  if (!authorized) return null;

  return children;
}
