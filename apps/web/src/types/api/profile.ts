export interface ParentProfile {
  id: string;
  display_name: string;
  phone: string;
  num_children: number;
  children_ages: number[] | null;
  city: string;
  province: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateParentProfilePayload {
  display_name: string;
  phone: string;
  num_children: number;
  children_ages: number[];
  city: string;
  province: string;
}

export interface ParentSettings {
  id: string;
  notify_messages: boolean;
  notify_bookings: boolean;
  notify_reminders: boolean;
  notify_weekly_digest: boolean;
  show_profile: boolean;
  share_reviews: boolean;
  analytics: boolean;
  language: string;
  currency: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateParentSettingsPayload {
  notify_messages: boolean;
  notify_bookings: boolean;
  notify_reminders: boolean;
  notify_weekly_digest: boolean;
  show_profile: boolean;
  share_reviews: boolean;
  analytics: boolean;
  language: string;
  currency: string;
  timezone: string;
}

export interface NannyProfile {
  id: string;
  public_slug?: string;
  display_name: string;
  phone: string;
  bio: string;
  specialties: string[];
  rate_per_hour: number;
  service_type: "nanny";
  currency: string;
  verification_status: string;
  verified_at?: string | null;
  stripe_onboarded: boolean;
  rating_avg: number;
  rating_count: number;
  avatar_url?: string;
  city: string;
  province: string;
}

export interface UpdateNannyProfilePayload {
  phone: string;
  bio: string;
  specialties: string[];
  rate_per_hour: number;
  city: string;
  province: string;
}

export interface PublicNannyCard {
  id: string;
  public_slug?: string;
  display_name: string;
  bio: string;
  specialties: string[];
  rate_per_hour: number;
  service_type: "nanny";
  currency: string;
  rating_avg: number;
  rating_count: number;
  avatar_url?: string;
  city: string;
  province: string;
}

export interface PublicNannyProfile extends PublicNannyCard {
  verification_status: string;
  verified_at?: string | null;
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
  specialties?: string[];
  min_rate?: number;
  max_rate?: number;
  service_type?: "nanny";
  sort?: "newest" | "oldest" | "rate_asc" | "rate_desc" | "rating_desc";
}

export interface NannyDocument {
  id: string;
  file_name: string;
  file_url: string;
  mime_type: string;
  size_bytes: number;
  resource_type: string;
  created_at: string;
}

export interface NannyDocumentListData {
  items: NannyDocument[];
  total: number;
}
