import type {
  AdminParent,
  AdminParentDetailData,
  AdminParentListData,
  AdminReasonPayload,
  ListAdminParentsParams,
} from "@/src/types/api/admin";
import { adminApiRequest } from "./client";

export const adminParentsQueryKey = (params: ListAdminParentsParams = {}) => [
  "admin",
  "parents",
  params,
];

export const adminParentQueryKey = (parentId: string) => ["admin", "parent", parentId];

function buildParentQuery(params: ListAdminParentsParams) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.city) query.set("city", params.city);

  const value = query.toString();
  return value ? `?${value}` : "";
}

export async function listAdminParents(params: ListAdminParentsParams = {}) {
  return adminApiRequest<AdminParentListData>(`/api/v1/admin/parents${buildParentQuery(params)}`);
}

export async function getAdminParent(parentId: string) {
  return adminApiRequest<AdminParentDetailData>(`/api/v1/admin/parents/${parentId}`);
}

export async function suspendAdminParent(parentId: string, payload: AdminReasonPayload) {
  return adminApiRequest<AdminParent>(`/api/v1/admin/parents/${parentId}/suspend`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
