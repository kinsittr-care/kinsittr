import type {
  AdminBooking,
  AdminBookingActionListData,
  AdminBookingListData,
  AdminReasonPayload,
  ListAdminBookingActionsParams,
  ListAdminBookingsParams,
} from "@/src/types/api/admin";
import { adminApiRequest } from "./client";

export const adminBookingsQueryKey = (params: ListAdminBookingsParams = {}) => [
  "admin",
  "bookings",
  params,
];

export const adminBookingQueryKey = (bookingId: string) => ["admin", "booking", bookingId];

export const adminBookingActionsQueryKey = (
  bookingId: string,
  params: ListAdminBookingActionsParams = {},
) => ["admin", "booking-actions", bookingId, params];

function buildBookingQuery(params: ListAdminBookingsParams | ListAdminBookingActionsParams) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if ("search" in params && params.search) query.set("search", params.search);
  if ("status" in params && params.status) query.set("status", params.status);
  if ("date_from" in params && params.date_from) query.set("date_from", params.date_from);
  if ("date_to" in params && params.date_to) query.set("date_to", params.date_to);

  const value = query.toString();
  return value ? `?${value}` : "";
}

export async function listAdminBookings(params: ListAdminBookingsParams = {}) {
  return adminApiRequest<AdminBookingListData>(`/api/v1/admin/bookings${buildBookingQuery(params)}`);
}

export async function getAdminBooking(bookingId: string) {
  return adminApiRequest<AdminBooking>(`/api/v1/admin/bookings/${bookingId}`);
}

export async function listAdminBookingActions(
  bookingId: string,
  params: ListAdminBookingActionsParams = {},
) {
  return adminApiRequest<AdminBookingActionListData>(
    `/api/v1/admin/bookings/${bookingId}/actions${buildBookingQuery(params)}`,
  );
}

export async function cancelAdminBooking(bookingId: string, payload: AdminReasonPayload) {
  return adminApiRequest<AdminBooking>(`/api/v1/admin/bookings/${bookingId}/cancel`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function completeAdminBooking(bookingId: string, payload: AdminReasonPayload) {
  return adminApiRequest<AdminBooking>(`/api/v1/admin/bookings/${bookingId}/complete`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
