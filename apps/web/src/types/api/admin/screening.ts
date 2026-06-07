export type AdminVerificationStatus = "pending" | "under_review" | "verified" | "rejected";

export interface AdminScreeningSteps {
  docs_reviewed: boolean;
  references_checked: boolean;
  interview_done: boolean;
}

export interface AdminNannyDocument {
  id: string;
  file_name: string;
  file_url: string;
  mime_type: string;
  size_bytes: number;
  resource_type: string;
  created_at: string;
}

export interface AdminNanny {
  id: string;
  user_id: string;
  user_email: string;
  user_firstname: string;
  user_lastname: string;
  user_is_active: boolean;
  display_name: string;
  bio: string;
  specialties: string[];
  rate_per_hour: number;
  service_type: "nanny";
  currency: string;
  verification_status: AdminVerificationStatus;
  verified_at?: string | null;
  stripe_account_id?: string | null;
  stripe_onboarded: boolean;
  rating_avg: number;
  rating_count: number;
  city: string;
  province: string;
  screening_steps: AdminScreeningSteps;
  documents: AdminNannyDocument[];
  waiting_days: number;
  created_at: string;
  updated_at: string;
}

export interface AdminNannyListData {
  items: AdminNanny[];
  page: number;
  limit: number;
  total: number;
}

export interface ListAdminScreeningNanniesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: Extract<AdminVerificationStatus, "pending" | "under_review" | "rejected">;
  city?: string;
}

export interface UpdateScreeningStepsPayload {
  docs_reviewed?: boolean;
  references_checked?: boolean;
  interview_done?: boolean;
}
