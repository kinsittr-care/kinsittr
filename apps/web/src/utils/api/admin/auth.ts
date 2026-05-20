import type {
  AuthSession,
  AuthSessionPayload,
  AuthTokenPair,
  LoginPayload,
} from "@/src/types/api/api";
import { apiRequest } from "../api";
import {
  buildSessionFromTokenPair,
  clearAuthSession,
  mergeSessionWithPayload,
  saveAuthSession,
} from "../session";

export async function loginAdmin(payload: LoginPayload) {
  return apiRequest<AuthTokenPair>("/api/v1/admin/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCurrentAdminSession() {
  return apiRequest<AuthSessionPayload>("/api/v1/admin/auth/me", undefined, {
    requiresAuth: true,
    refreshPath: "/api/v1/admin/auth/refresh",
  });
}

export async function logoutAdmin(refreshToken: string) {
  return apiRequest("/api/v1/admin/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

export async function establishAdminAuthSession(auth: AuthTokenPair): Promise<AuthSession> {
  if (!auth.access_token || !auth.refresh_token || !auth.user || auth.user.role !== "admin") {
    throw new Error("Admin authentication response is incomplete.");
  }

  const baseSession = buildSessionFromTokenPair(auth);
  saveAuthSession(baseSession);

  try {
    const currentSession = await getCurrentAdminSession();
    if (currentSession.data) {
      const mergedSession = mergeSessionWithPayload(baseSession, currentSession.data);
      saveAuthSession(mergedSession);
      return mergedSession;
    }
  } catch (error) {
    clearAuthSession();
    throw error;
  }

  return baseSession;
}
