import type {
  AuthSession,
  AuthSessionPayload,
  AuthTokenPair,
  AuthUser,
} from "@/src/types/api/api";

const AUTH_STORAGE_KEY = "kinsittr.auth.session";
const AUTH_ROLE_COOKIE = "kinsittr.auth.role";
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function isBrowser() {
  return typeof window !== "undefined";
}

export function getStoredAuthSession(): AuthSession | null {
  if (!isBrowser()) return null;

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function saveAuthSession(session: AuthSession) {
  if (!isBrowser()) return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  setAuthRoleCookie(session.user.role);
}

export function clearAuthSession() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.document.cookie = `${AUTH_ROLE_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

function setAuthRoleCookie(role: AuthUser["role"]) {
  window.document.cookie = `${AUTH_ROLE_COOKIE}=${role}; path=/; max-age=${AUTH_COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function buildSessionFromTokenPair(auth: AuthTokenPair): AuthSession {
  if (!auth.user) {
    throw new Error("Authentication response is missing user data.");
  }

  return {
    accessToken: auth.access_token,
    refreshToken: auth.refresh_token,
    user: auth.user,
  };
}

export function mergeSessionWithPayload(
  session: AuthSession,
  payload: AuthSessionPayload,
): AuthSession {
  return {
    ...session,
    user: payload.user,
    parentProfile: payload.parent_profile,
    nannyProfile: payload.nanny_profile,
  };
}
