import {
  AuthSession,
  AuthSessionPayload,
  AuthTokenPair,
  ChangePasswordPayload,
  DeactivateAccountPayload,
  LoginPayload,
  RecoveryRequestPayload,
  RecoveryResetPayload,
  RecoveryVerifyData,
  RecoveryVerifyPayload,
  RegisterNannyPayload,
  RegisterParentPayload,
} from "@/src/types/api/api";
import { apiRequest } from "./api";
import {
  buildSessionFromTokenPair,
  clearAuthSession,
  mergeSessionWithPayload,
  saveAuthSession,
} from "./session";

export async function loginUser(payload: LoginPayload) {
  return apiRequest<AuthTokenPair>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function registerParent(payload: RegisterParentPayload) {
  return apiRequest<AuthTokenPair>("/api/v1/auth/parent/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function registerNanny(payload: RegisterNannyPayload) {
  return apiRequest<AuthTokenPair>("/api/v1/auth/nanny/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCurrentSession() {
  return apiRequest<AuthSessionPayload>("/api/v1/auth/me", undefined, {
    requiresAuth: true,
  });
}

async function getCurrentSessionWithAccessToken(accessToken: string) {
  return apiRequest<AuthSessionPayload>("/api/v1/auth/me", undefined, {
    accessToken,
  });
}

export async function logoutUser(refreshToken: string) {
  return apiRequest("/api/v1/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

export async function changePassword(payload: ChangePasswordPayload) {
  return apiRequest(
    "/api/v1/auth/password",
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
    {
      requiresAuth: true,
    },
  );
}

export async function deactivateAccount(payload: DeactivateAccountPayload) {
  return apiRequest(
    "/api/v1/auth/account",
    {
      method: "DELETE",
      body: JSON.stringify(payload),
    },
    {
      requiresAuth: true,
    },
  );
}

export async function requestPasswordRecovery(payload: RecoveryRequestPayload) {
  return apiRequest("/api/v1/auth/recovery/request", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifyPasswordRecovery(payload: RecoveryVerifyPayload) {
  return apiRequest<RecoveryVerifyData>("/api/v1/auth/recovery/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resetPasswordWithRecovery(payload: RecoveryResetPayload) {
  return apiRequest("/api/v1/auth/recovery/reset", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function establishAuthSession(auth: AuthTokenPair): Promise<AuthSession> {
  if (!auth.access_token || !auth.refresh_token) {
    throw new Error("Authentication response is incomplete.");
  }

  try {
    const currentSession = await getCurrentSessionWithAccessToken(auth.access_token);
    if (currentSession.data) {
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

  if (auth.user) {
    const baseSession = buildSessionFromTokenPair(auth);
    saveAuthSession(baseSession);
    return baseSession;
  }

  throw new Error("Authentication response is missing user data.");
}
