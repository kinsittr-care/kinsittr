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

function formatApiErrorMessage(message: string) {
  switch (message) {
    case "booking_payment_setup_missing":
      return "Payment setup is missing. The parent needs a saved card and the nanny needs completed Stripe setup.";
    case "booking_payment_failed":
      return "Payment failed, so the booking could not be completed.";
    case "admin_booking_payment_failed":
      return "Payment failed, so the admin completion could not be applied.";
    case "admin_booking_refund_failed":
      return "The booking was cancelled, but the refund failed. Review the Stripe payment before notifying participants.";
    default:
      return message;
  }
}

interface ApiRequestOptions {
  requiresAuth?: boolean;
  accessToken?: string;
  refreshPath?: string;
  retryOnUnauthorized?: boolean;
}

function isMultipartBody(body: RequestInit["body"]) {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

function buildApiHeaders(
  init: RequestInit | undefined,
  accessToken?: string,
) {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && !isMultipartBody(init?.body)) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  return headers;
}

async function parseApiResponse<TResponse>(
  response: Response,
): Promise<ApiResponse<TResponse>> {
  return (await response.json()) as ApiResponse<TResponse>;
}

async function refreshStoredSession(refreshPath = "/api/v1/auth/refresh") {
  const session = getStoredAuthSession();
  if (!session?.refreshToken) {
    throw new ApiRequestError("Your session has expired. Please sign in again.");
  }

  const response = await fetch(`${apiBaseUrl}${refreshPath}`, {
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
  const headers = buildApiHeaders(
    init,
    options.accessToken ?? (options.requiresAuth ? session?.accessToken : undefined),
  );

  let response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers,
  });

  if (
    options.requiresAuth &&
    response.status === 401 &&
    options.retryOnUnauthorized !== false
  ) {
    const refreshed = await refreshStoredSession(options.refreshPath);
    const retryHeaders = buildApiHeaders(init, refreshed.accessToken);

    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: retryHeaders,
    });
  }

  const payload = await parseApiResponse<TResponse>(response);

  if (!response.ok) {
    throw new ApiRequestError(
      formatApiErrorMessage(payload.message || "Something went wrong while processing your request."),
    );
  }

  return payload;
}
