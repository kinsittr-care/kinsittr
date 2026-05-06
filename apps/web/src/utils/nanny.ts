import type {
  ListPublicNanniesParams,
  PublicNannyListData,
} from "@/src/types/api/api";
import { apiRequest, type ApiResponse } from "@/src/utils/api";

const LIST_PUBLIC_NANNIES_TTL_MS = 30_000;
const publicNannyListCache = new Map<
  string,
  { expiresAt: number; response: ApiResponse<PublicNannyListData> }
>();

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

export async function listPublicNannies(params: ListPublicNanniesParams) {
  const queryString = buildListPublicNanniesQuery(params);
  const cacheKey = queryString || "?";
  const now = Date.now();
  const cached = publicNannyListCache.get(cacheKey);

  if (cached && cached.expiresAt > now) {
    return cached.response;
  }

  const response = await apiRequest<PublicNannyListData>(
    `/api/v1/nannies${queryString}`,
  );

  publicNannyListCache.set(cacheKey, {
    expiresAt: now + LIST_PUBLIC_NANNIES_TTL_MS,
    response,
  });

  return response;
}
