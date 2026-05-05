export interface ContactFormPayload {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  subject: string;
  message: string;
}

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

export interface ParentProfile {
  id: string;
  user_id: string;
  display_name: string;
  num_children: number;
  children_ages: number[];
  city: string;
  province: string;
  stripe_customer_id: string;
  created_at: string;
  updated_at: string;
}

export interface NannyProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  rate_per_hour: number;
  service_type: "nanny";
  currency: string;
  verification_status: string;
  verified_at?: string | null;
  stripe_account_id?: string | null;
  stripe_onboarded: boolean;
  rating_avg: number;
  rating_count: number;
  city: string;
  province: string;
  created_at: string;
  updated_at: string;
}

export interface PublicNannyCard {
  id: string;
  display_name: string;
  bio: string;
  rate_per_hour: number;
  service_type: "nanny";
  currency: string;
  rating_avg: number;
  rating_count: number;
  city: string;
  province: string;
}

export interface PublicNannyListData {
  items: PublicNannyCard[];
  page: number;
  limit: number;
  total: number;
}

export interface ListPublicNanniesParams {
  page?: number;
  limit?: number;
  city?: string;
  province?: string;
  min_rate?: number;
  max_rate?: number;
  service_type?: "nanny";
  sort?: "newest" | "oldest" | "rate_asc" | "rate_desc" | "rating_desc";
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
