import type { BookingStatus } from "../bookings";

export interface AdminReasonPayload {
  reason: string;
}

export interface AdminBooking {
  id: string;
  parent_profile_id: string;
  nanny_profile_id: string;
  parent_display_name: string;
  parent_city: string;
  parent_province: string;
  nanny_display_name: string;
  nanny_city: string;
  nanny_province: string;
  date: string;
  start_time: string;
  duration: number;
  total_amount: number;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

export interface AdminBookingListData {
  items: AdminBooking[];
  page: number;
  limit: number;
  total: number;
}
