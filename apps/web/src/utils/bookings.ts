import type { Booking, CreateBookingPayload } from "@/src/types/api/api";
import { apiRequest } from "@/src/utils/api";

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
