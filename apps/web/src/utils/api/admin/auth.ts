import type {
  AuthSession,
  AuthSessionPayload,
  AuthTokenPair,
  LoginPayload,
} from "@/src/types/api/api";
import { apiRequest } from "../api";
import { adminApiRequest } from "./client";
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
  return adminApiRequest<AuthSessionPayload>("/api/v1/admin/auth/me");
}

async function getCurrentAdminSessionWithAccessToken(accessToken: string) {
  return apiRequest<AuthSessionPayload>("/api/v1/admin/auth/me", undefined, {
    accessToken,
  });
}

export async function logoutAdmin(refreshToken: string) {
  return apiRequest("/api/v1/admin/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

export async function establishAdminAuthSession(auth: AuthTokenPair): Promise<AuthSession> {
  if (!auth.access_token || !auth.refresh_token) {
    throw new Error("Admin authentication response is incomplete.");
  }

  try {
    const currentSession = await getCurrentAdminSessionWithAccessToken(auth.access_token);
    if (currentSession.data) {
      if (currentSession.data.user.role !== "admin") {
        throw new Error("Admin authentication response is incomplete.");
      }
      const baseSession: AuthSession = {
        accessToken: auth.access_token,
        refreshToken: auth.refresh_token,
        user: auth.user ?? currentSession.data.user,
      };
      const mergedSession = mergeSessionWithPayload(baseSession, currentSession.data);
      saveAuthSession(mergedSession);
      return mergedSession;
    }
  } catch (error) {
    clearAuthSession();
    throw error;
  }

  if (auth.user?.role === "admin") {
    const baseSession = buildSessionFromTokenPair(auth);
    saveAuthSession(baseSession);
    return baseSession;
  }

  throw new Error("Admin authentication response is missing user data.");
}
