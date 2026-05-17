export interface CreateBookingPayload {
  nanny_id: string;
  date: string;
  start_time: string;
  timezone_offset_minutes: number;
  duration: number;
}

export type BookingStatus = "pending" | "approved" | "declined" | "cancelled" | "completed";

export interface Booking {
  id: string;
  parent_profile_id: string;
  nanny_profile_id: string;
  parent_display_name?: string;
  parent_city?: string;
  parent_province?: string;
  nanny_display_name?: string;
  nanny_city?: string;
  nanny_province?: string;
  date: string;
  start_time: string;
  duration: number;
  total_amount: number;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

export interface BookingListData {
  items: Booking[];
  page: number;
  limit: number;
  total: number;
}

export interface ListBookingsParams {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  date_from?: string;
  date_to?: string;
}
