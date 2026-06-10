import type { AuthUser } from "../auth";

export type AdminUser = AuthUser;

export interface ListAdminUsersParams {
  page?: number;
  limit?: number;
}

export interface AdminUserListData {
  items: AdminUser[];
  page: number;
  limit: number;
  total: number;
}

export interface InviteAdminPayload {
  firstname: string;
  lastname: string;
  email: string;
}

export interface AcceptAdminInvitePayload {
  token: string;
  password: string;
}

export interface AdminInviteData {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  token?: string;
  expires_at: string;
  created_at: string;
}
