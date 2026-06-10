import type {
  AdminParent,
  AdminAuditActionListData,
  AdminParentDetailData,
  AdminParentListData,
  AdminReasonPayload,
  ListAdminAuditActionsParams,
  ListAdminParentsParams,
} from "@/src/types/api/admin";
import { adminApiRequest } from "./client";

export const adminParentsQueryKey = (params: ListAdminParentsParams = {}) => [
  "admin",
  "parents",
  params,
];

export const adminParentQueryKey = (parentId: string) => ["admin", "parent", parentId];

export const adminParentActionsQueryKey = (
  parentId: string,
  params: ListAdminAuditActionsParams = {},
) => ["admin", "parent-actions", parentId, params];

function buildParentQuery(params: ListAdminParentsParams | ListAdminAuditActionsParams) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if ("search" in params && params.search) query.set("search", params.search);
  if ("city" in params && params.city) query.set("city", params.city);

  const value = query.toString();
  return value ? `?${value}` : "";
}

export async function listAdminParents(params: ListAdminParentsParams = {}) {
  return adminApiRequest<AdminParentListData>(`/api/v1/admin/parents${buildParentQuery(params)}`);
}

export async function getAdminParent(parentId: string) {
  return adminApiRequest<AdminParentDetailData>(`/api/v1/admin/parents/${parentId}`);
}

export async function listAdminParentActions(
  parentId: string,
  params: ListAdminAuditActionsParams = {},
) {
  return adminApiRequest<AdminAuditActionListData>(
    `/api/v1/admin/parents/${parentId}/actions${buildParentQuery(params)}`,
  );
}

export async function suspendAdminParent(parentId: string, payload: AdminReasonPayload) {
  return adminApiRequest<AdminParent>(`/api/v1/admin/parents/${parentId}/suspend`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function reactivateAdminParent(parentId: string, payload: AdminReasonPayload) {
  return adminApiRequest<AdminParent>(`/api/v1/admin/parents/${parentId}/reactivate`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
