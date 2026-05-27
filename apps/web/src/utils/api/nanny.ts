import type {
  ListPublicNanniesParams,
  NannyProfile,
  PublicNannyListData,
  UpdateNannyProfilePayload,
} from "@/src/types/api/api";
import { ApiRequestError, type ApiResponse, apiRequest } from "@/src/utils/api/api";
import { getStoredAuthSession } from "@/src/utils/api/session";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4006";

function buildListPublicNanniesQuery(params: ListPublicNanniesParams) {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.city) query.set("city", params.city);
  if (params.province) query.set("province", params.province);
  for (const specialty of params.specialties ?? []) {
    query.append("specialty", specialty);
  }
  if (typeof params.min_rate === "number") query.set("min_rate", String(params.min_rate));
  if (typeof params.max_rate === "number") query.set("max_rate", String(params.max_rate));
  if (params.service_type) query.set("service_type", params.service_type);
  if (params.sort) query.set("sort", params.sort);

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

export function publicNanniesQueryKey(params: ListPublicNanniesParams) {
  return ["public-nannies", params] as const;
}

export function ownNannyProfileQueryKey() {
  return ["nanny-profile"] as const;
}

export async function listPublicNannies(params: ListPublicNanniesParams) {
  const queryString = buildListPublicNanniesQuery(params);
  return apiRequest<PublicNannyListData>(`/api/v1/nannies${queryString}`);
}

export async function getOwnNannyProfile() {
  return apiRequest<NannyProfile>("/api/v1/nanny/profile", undefined, {
    requiresAuth: true,
  });
}

export async function updateOwnNannyProfile(payload: UpdateNannyProfilePayload) {
  return apiRequest<NannyProfile>(
    "/api/v1/nanny/profile",
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
    {
      requiresAuth: true,
    },
  );
}

export async function uploadNannyAvatar(file: File): Promise<ApiResponse<NannyProfile>> {
  const formData = new FormData();
  formData.append("avatar", file);

  const session = getStoredAuthSession();
  const headers: Record<string, string> = {};
  if (session?.accessToken) {
    headers["Authorization"] = `Bearer ${session.accessToken}`;
  }

  const response = await fetch(`${apiBaseUrl}/api/v1/nanny/avatar`, {
    method: "POST",
    headers,
    body: formData,
  });

  const payload = (await response.json()) as ApiResponse<NannyProfile>;
  if (!response.ok) {
    throw new ApiRequestError(payload.message || "Upload failed");
  }
  return payload;
}
