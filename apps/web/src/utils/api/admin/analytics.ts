import type { AdminAnalyticsData, AdminAnalyticsParams } from "@/src/types/api/admin";
import { adminApiRequest } from "./client";

export const adminAnalyticsQueryKey = (params: AdminAnalyticsParams = {}) => [
  "admin",
  "analytics",
  params,
];

function buildAnalyticsQuery(params: AdminAnalyticsParams) {
  const query = new URLSearchParams();
  if (params.date_from) query.set("date_from", params.date_from);
  if (params.date_to) query.set("date_to", params.date_to);
  if (params.bucket) query.set("bucket", params.bucket);
  if (params.city_limit) query.set("city_limit", String(params.city_limit));
  if (params.top_nannies_limit) query.set("top_nannies_limit", String(params.top_nannies_limit));

  const value = query.toString();
  return value ? `?${value}` : "";
}

export async function getAdminAnalytics(params: AdminAnalyticsParams = {}) {
  return adminApiRequest<AdminAnalyticsData>(
    `/api/v1/admin/analytics${buildAnalyticsQuery(params)}`,
  );
}
