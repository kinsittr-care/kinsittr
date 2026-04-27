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

export async function apiRequest<TResponse>(
  path: string,
  init?: RequestInit,
): Promise<ApiResponse<TResponse>> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload = (await response.json()) as ApiResponse<TResponse>;

  if (!response.ok) {
    throw new ApiRequestError(
      payload.message || "Something went wrong while processing your request.",
    );
  }

  return payload;
}
