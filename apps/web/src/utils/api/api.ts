import type { AuthTokenPair } from "@/src/types/api/api";
import {
  buildSessionFromTokenPair,
  clearAuthSession,
  getStoredAuthSession,
  saveAuthSession,
} from "./session";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4006";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export class ApiRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiRequestError";
  }
}

interface ApiRequestOptions {
  requiresAuth?: boolean;
  retryOnUnauthorized?: boolean;
}

async function parseApiResponse<TResponse>(
  response: Response,
): Promise<ApiResponse<TResponse>> {
  return (await response.json()) as ApiResponse<TResponse>;
}

async function refreshStoredSession() {
  const session = getStoredAuthSession();
  if (!session?.refreshToken) {
    throw new ApiRequestError("Your session has expired. Please sign in again.");
  }

  const response = await fetch(`${apiBaseUrl}/api/v1/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: session.refreshToken }),
  });

  const payload = await parseApiResponse<AuthTokenPair>(response);

  if (!response.ok || !payload.data?.access_token || !payload.data?.refresh_token || !payload.data?.user) {
    clearAuthSession();
    throw new ApiRequestError(
      payload.message || "Your session has expired. Please sign in again.",
    );
  }

  const nextSession = buildSessionFromTokenPair(payload.data);
  saveAuthSession({
    ...session,
    ...nextSession,
  });

  return nextSession;
}

export async function apiRequest<TResponse>(
  path: string,
  init?: RequestInit,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<TResponse>> {
  const session = options.requiresAuth ? getStoredAuthSession() : null;

  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (options.requiresAuth && session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  let response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers,
  });

  if (
    options.requiresAuth &&
    response.status === 401 &&
    options.retryOnUnauthorized !== false
  ) {
    const refreshed = await refreshStoredSession();
    const retryHeaders = new Headers(init?.headers);
    if (!retryHeaders.has("Content-Type")) {
      retryHeaders.set("Content-Type", "application/json");
    }
    retryHeaders.set("Authorization", `Bearer ${refreshed.accessToken}`);

    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: retryHeaders,
    });
  }

  const payload = await parseApiResponse<TResponse>(response);

  if (!response.ok) {
    throw new ApiRequestError(
      payload.message || "Something went wrong while processing your request.",
    );
  }

  return payload;
}
