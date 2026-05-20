import type { BookingStatus } from "../bookings";
import type { AdminBooking, AdminBookingListData, AdminReasonPayload } from "./shared";

export type { AdminBooking, AdminBookingListData, AdminReasonPayload };

export interface ListAdminBookingsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: BookingStatus;
  date_from?: string;
  date_to?: string;
}

export interface ListAdminBookingActionsParams {
  page?: number;
  limit?: number;
}

export interface AdminBookingAction {
  id: string;
  booking_id: string;
  admin_user_id?: string | null;
  admin_email?: string | null;
  action: string;
  previous_status: BookingStatus;
  new_status: BookingStatus;
  reason: string;
  created_at: string;
}

export interface AdminBookingActionListData {
  items: AdminBookingAction[];
  page: number;
  limit: number;
  total: number;
}
