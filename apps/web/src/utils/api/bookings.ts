import type {
  Booking,
  BookingListData,
  CreateBookingPayload,
  ListBookingsParams,
} from "@/src/types/api/api";
import { apiRequest } from "@/src/utils/api/api";

function buildListBookingsQuery(params: ListBookingsParams) {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.status) query.set("status", params.status);
  if (params.date_from) query.set("date_from", params.date_from);
  if (params.date_to) query.set("date_to", params.date_to);

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

export function parentBookingsQueryKey(params: ListBookingsParams) {
  return ["parent-bookings", params] as const;
}

export function parentBookingQueryKey(id: string) {
  return ["parent-booking", id] as const;
}

export function nannyBookingsQueryKey(params: ListBookingsParams) {
  return ["nanny-bookings", params] as const;
}

export function nannyBookingQueryKey(id: string) {
  return ["nanny-booking", id] as const;
}

export async function createBooking(payload: CreateBookingPayload) {
  return apiRequest<Booking>(
    "/api/v1/bookings",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    {
      requiresAuth: true,
    },
  );
}

export async function listParentBookings(params: ListBookingsParams) {
  const queryString = buildListBookingsQuery(params);

  return apiRequest<BookingListData>(
    `/api/v1/bookings${queryString}`,
    undefined,
    {
      requiresAuth: true,
    },
  );
}

export async function getParentBookingById(id: string) {
  return apiRequest<Booking>(`/api/v1/bookings/${id}`, undefined, {
    requiresAuth: true,
  });
}

export async function cancelParentBooking(id: string) {
  return apiRequest<Booking>(
    `/api/v1/bookings/${id}/cancel`,
    {
      method: "PATCH",
    },
    {
      requiresAuth: true,
    },
  );
}

export async function listNannyBookings(params: ListBookingsParams) {
  const queryString = buildListBookingsQuery(params);

  return apiRequest<BookingListData>(
    `/api/v1/nanny/bookings${queryString}`,
    undefined,
    {
      requiresAuth: true,
    },
  );
}

export async function getNannyBookingById(id: string) {
  return apiRequest<Booking>(`/api/v1/nanny/bookings/${id}`, undefined, {
    requiresAuth: true,
  });
}

export async function approveNannyBooking(id: string) {
  return apiRequest<Booking>(
    `/api/v1/nanny/bookings/${id}/approve`,
    {
      method: "PATCH",
    },
    {
      requiresAuth: true,
    },
  );
}

export async function declineNannyBooking(id: string) {
  return apiRequest<Booking>(
    `/api/v1/nanny/bookings/${id}/decline`,
    {
      method: "PATCH",
    },
    {
      requiresAuth: true,
    },
  );
}

export async function completeNannyBooking(id: string) {
  return apiRequest<Booking>(
    `/api/v1/nanny/bookings/${id}/complete`,
    {
      method: "PATCH",
    },
    {
      requiresAuth: true,
    },
  );
}

export async function retryNannyBookingPayment(id: string) {
  return apiRequest<Booking>(
    `/api/v1/nanny/bookings/${id}/payment/retry`,
    {
      method: "POST",
    },
    {
      requiresAuth: true,
    },
  );
}
