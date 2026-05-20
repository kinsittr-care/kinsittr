import type { BookingStatus } from "./bookings";

export type ReviewTarget = "nanny" | "parent";

export interface Review {
  target: ReviewTarget;
  id: string;
  booking_id: string;
  nanny_profile_id: string;
  parent_profile_id: string;
  nanny_display_name: string;
  nanny_city: string;
  nanny_province: string;
  parent_display_name: string;
  parent_city: string;
  parent_province: string;
  parent_email?: string;
  booking_date: string;
  booking_start_time: string;
  booking_status: BookingStatus;
  rating: number;
  comment: string;
  is_visible: boolean;
  flagged_at?: string;
  flagged_by?: string;
  flag_reason?: string;
  reviewed_by_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReviewListData {
  items: Review[];
  page: number;
  limit: number;
  total: number;
}

export interface CreateReviewPayload {
  rating: number;
  comment: string;
}

export interface ListReviewsParams {
  page?: number;
  limit?: number;
  target?: ReviewTarget;
  rating?: number;
  flagged?: boolean;
  visible?: boolean;
  nanny_id?: string;
  parent_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}
