export interface CreateBookingPayload {
  nanny_id: string;
  date: string;
  start_time: string;
  timezone_offset_minutes: number;
  duration: number;
}

export type BookingStatus = "pending" | "approved" | "declined" | "cancelled" | "completed";
export type PaymentStatus =
  | "requires_payment_method"
  | "requires_confirmation"
  | "requires_action"
  | "processing"
  | "succeeded"
  | "failed"
  | "cancelled"
  | "refunded";

export interface Booking {
  id: string;
  conversation_id?: string;
  parent_profile_id: string;
  nanny_profile_id: string;
  parent_display_name?: string;
  parent_city?: string;
  parent_province?: string;
  parent_num_children?: number;
  nanny_display_name?: string;
  nanny_city?: string;
  nanny_province?: string;
  date: string;
  start_time: string;
  duration: number;
  total_amount: number;
  status: BookingStatus;
  payment_status?: PaymentStatus | "";
  payment_failure_message?: string;
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  stripe_refund_id?: string;
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
