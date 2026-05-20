import type {
  AcceptAdminInvitePayload,
  AdminInviteData,
  AdminUser,
  AdminUserListData,
  InviteAdminPayload,
  ListAdminUsersParams,
} from "@/src/types/api/admin";
import { apiRequest } from "../api";
import { adminApiRequest } from "./client";

export const adminUsersQueryKey = (params: ListAdminUsersParams = {}) => [
  "admin",
  "users",
  params,
];

function buildAdminUsersQuery(params: ListAdminUsersParams) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const value = query.toString();
  return value ? `?${value}` : "";
}

export async function listAdminUsers(params: ListAdminUsersParams = {}) {
  return adminApiRequest<AdminUserListData>(`/api/v1/admin/admins${buildAdminUsersQuery(params)}`);
}

export async function inviteAdmin(payload: InviteAdminPayload) {
  return adminApiRequest<AdminInviteData>("/api/v1/admin/admins/invite", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function disableAdmin(adminUserId: string) {
  return adminApiRequest<AdminUser>(`/api/v1/admin/admins/${adminUserId}/disable`, {
    method: "PATCH",
  });
}

export async function acceptAdminInvite(payload: AcceptAdminInvitePayload) {
  return apiRequest<AdminUser>("/api/v1/admin/admins/accept-invite", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
