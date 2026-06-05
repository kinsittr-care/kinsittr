"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { AuthUser } from "@/src/types/api/api";
import { logoutAdmin } from "@/src/utils/api/admin/auth";
import { logoutUser } from "@/src/utils/api/auth";
import { clearAuthSession, getStoredAuthSession } from "@/src/utils/api/session";

const logoutRedirect = {
  parent: "/auth/parent",
  nanny: "/auth/nanny",
  admin: "/auth/admin",
} as const;

export function useLogout(role: AuthUser["role"]) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return async () => {
    const session = getStoredAuthSession();
    try {
      if (session?.refreshToken) {
        if (role === "admin") {
          await logoutAdmin(session.refreshToken);
        } else {
          await logoutUser(session.refreshToken);
        }
      }
    } finally {
      clearAuthSession();
      queryClient.clear();
      router.replace(logoutRedirect[role]);
    }
  };
}
