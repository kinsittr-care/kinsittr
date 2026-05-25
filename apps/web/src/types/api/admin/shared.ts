import type { BookingStatus, PaymentStatus } from "../bookings";

export interface AdminReasonPayload {
  reason: string;
}

export interface ListAdminAuditActionsParams {
  page?: number;
  limit?: number;
}

export interface AdminAuditAction {
  id: string;
  admin_user_id?: string | null;
  admin_email?: string | null;
  action: string;
  reason?: string | null;
  previous_status?: string | null;
  new_status?: string | null;
  message_id?: string | null;
  target_role?: string;
  created_at: string;
}

export interface AdminAuditActionListData {
  items: AdminAuditAction[];
  page: number;
  limit: number;
  total: number;
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
  payment_status?: PaymentStatus | "";
  payment_failure_message?: string;
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  stripe_refund_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminBookingListData {
  items: AdminBooking[];
  page: number;
  limit: number;
  total: number;
}
