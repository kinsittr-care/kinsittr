import { apiRequest } from "../api";

export function adminApiRequest<TResponse>(
  path: string,
  init?: RequestInit,
) {
  return apiRequest<TResponse>(path, init, {
    requiresAuth: true,
    refreshPath: "/api/v1/admin/auth/refresh",
  });
}
