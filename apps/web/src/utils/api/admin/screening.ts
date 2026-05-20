import type {
  AdminNanny,
  AdminNannyListData,
  AdminReasonPayload,
  ListAdminScreeningNanniesParams,
  UpdateScreeningStepsPayload,
} from "@/src/types/api/admin";
import { adminApiRequest } from "./client";

export const adminScreeningNanniesQueryKey = (params: ListAdminScreeningNanniesParams = {}) => [
  "admin",
  "screening",
  "nannies",
  params,
];

function buildScreeningQuery(params: ListAdminScreeningNanniesParams) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  if (params.city) query.set("city", params.city);

  const value = query.toString();
  return value ? `?${value}` : "";
}

export async function listAdminScreeningNannies(params: ListAdminScreeningNanniesParams = {}) {
  return adminApiRequest<AdminNannyListData>(
    `/api/v1/admin/screening/nannies${buildScreeningQuery(params)}`,
  );
}

export async function startAdminNannyScreening(nannyId: string) {
  return adminApiRequest<AdminNanny>(`/api/v1/admin/screening/nannies/${nannyId}/under-review`, {
    method: "PATCH",
  });
}

export async function updateAdminNannyScreeningSteps(
  nannyId: string,
  payload: UpdateScreeningStepsPayload,
) {
  return adminApiRequest<AdminNanny>(`/api/v1/admin/screening/nannies/${nannyId}/steps`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function resetAdminNannyScreening(nannyId: string, payload: AdminReasonPayload) {
  return adminApiRequest<AdminNanny>(`/api/v1/admin/screening/nannies/${nannyId}/reset`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
