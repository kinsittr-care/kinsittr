import type { AdminBookingListData } from "./shared";

export interface AdminParent {
  id: string;
  user_id: string;
  user_email: string;
  user_firstname: string;
  user_lastname: string;
  user_is_active: boolean;
  display_name: string;
  num_children: number;
  children_ages: number[];
  city: string;
  province: string;
  stripe_customer_id: string;
  booking_count: number;
  total_spend: number;
  created_at: string;
  updated_at: string;
}

export interface AdminParentListData {
  items: AdminParent[];
  page: number;
  limit: number;
  total: number;
}

export interface ListAdminParentsParams {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
}

export interface AdminParentDetailData {
  parent: AdminParent;
  bookings: AdminBookingListData;
}
