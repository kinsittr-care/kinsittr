import type { NannyProfile, ParentProfile } from "./profile";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterParentPayload {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phone?: string;
  display_name: string;
  num_children: number;
  children_ages: number[];
  city: string;
  province: string;
}

export interface RegisterNannyPayload {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phone?: string;
  display_name: string;
  service_type: "nanny";
  bio: string;
  rate_per_hour: number;
  city: string;
  province: string;
}

export interface AuthUser {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: "parent" | "nanny" | "admin";
  phone: string;
  is_active: boolean;
  country_code: string;
  created_at: string;
  updated_at: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export interface DeactivateAccountPayload {
  password: string;
}

export interface AuthTokenPair {
  access_token: string;
  refresh_token: string;
  user?: AuthUser;
}

export interface AuthSessionPayload {
  user: AuthUser;
  parent_profile?: ParentProfile;
  nanny_profile?: NannyProfile;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  parentProfile?: ParentProfile;
  nannyProfile?: NannyProfile;
}
