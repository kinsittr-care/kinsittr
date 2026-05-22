import type {
  AdminNanny,
  AdminAuditActionListData,
  AdminNannyDetailData,
  AdminNannyListData,
  AdminReasonPayload,
  ListAdminAuditActionsParams,
  ListAdminNanniesParams,
} from "@/src/types/api/admin";
import { adminApiRequest } from "./client";

export const adminNanniesQueryKey = (params: ListAdminNanniesParams = {}) => [
  "admin",
  "nannies",
  params,
];

export const adminNannyQueryKey = (nannyId: string) => ["admin", "nanny", nannyId];

export const adminNannyActionsQueryKey = (
  nannyId: string,
  params: ListAdminAuditActionsParams = {},
) => ["admin", "nanny-actions", nannyId, params];

function buildNannyQuery(params: ListAdminNanniesParams | ListAdminAuditActionsParams) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if ("search" in params && params.search) query.set("search", params.search);
  if ("status" in params && params.status) query.set("status", params.status);
  if ("city" in params && params.city) query.set("city", params.city);

  const value = query.toString();
  return value ? `?${value}` : "";
}

export async function listAdminNannies(params: ListAdminNanniesParams = {}) {
  return adminApiRequest<AdminNannyListData>(`/api/v1/admin/nannies${buildNannyQuery(params)}`);
}

export async function getAdminNanny(nannyId: string) {
  return adminApiRequest<AdminNannyDetailData>(`/api/v1/admin/nannies/${nannyId}`);
}

export async function listAdminNannyActions(
  nannyId: string,
  params: ListAdminAuditActionsParams = {},
) {
  return adminApiRequest<AdminAuditActionListData>(
    `/api/v1/admin/nannies/${nannyId}/actions${buildNannyQuery(params)}`,
  );
}

export async function verifyAdminNanny(nannyId: string) {
  return adminApiRequest<AdminNanny>(`/api/v1/admin/nannies/${nannyId}/verify`, {
    method: "PATCH",
  });
}

export async function rejectAdminNanny(nannyId: string, payload: AdminReasonPayload) {
  return adminApiRequest<AdminNanny>(`/api/v1/admin/nannies/${nannyId}/reject`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function suspendAdminNanny(nannyId: string, payload: AdminReasonPayload) {
  return adminApiRequest<AdminNanny>(`/api/v1/admin/nannies/${nannyId}/suspend`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function reactivateAdminNanny(nannyId: string, payload: AdminReasonPayload) {
  return adminApiRequest<AdminNanny>(`/api/v1/admin/nannies/${nannyId}/reactivate`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
