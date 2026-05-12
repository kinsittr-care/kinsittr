"use client";

import { useQuery } from "@tanstack/react-query";
import type { Booking } from "@/src/types/api/api";
import { getParentBookingById, parentBookingQueryKey } from "@/src/utils/bookings";
import SectionCard from "../profile/SectionCard";
import BookingStatusBadge from "./BookingStatusBadge";
import { describeBookingTime, formatBookingTotal } from "./booking-helpers";

interface BookingDetailCardProps {
  bookingId: string | null;
}

export default function BookingDetailCard({ bookingId }: BookingDetailCardProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: bookingId ? parentBookingQueryKey(bookingId) : ["parent-booking", "empty"],
    queryFn: async () => getParentBookingById(bookingId as string),
    enabled: !!bookingId,
  });

  if (!bookingId) {
    return null;
  }

  return (
    <SectionCard title="Booking Details">
      {isLoading ? (
        <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>Loading booking details…</p>
      ) : error ? (
        <p style={{ color: "#b24a3f", fontSize: 14, margin: 0 }}>
          {error instanceof Error ? error.message : "Unable to load booking details."}
        </p>
      ) : (
        (() => {
          const booking = data?.data as Booking | undefined;
          if (!booking) {
            return <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>Booking details unavailable.</p>;
          }

          return (
            <div style={{ display: "grid", gap: 14 }}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{booking.nanny_display_name ?? "Selected nanny"}</div>
                  <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>
                    {[booking.nanny_city, booking.nanny_province].filter(Boolean).join(", ")}
                  </div>
                </div>
                <BookingStatusBadge status={booking.status} />
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ fontSize: 14 }}>
                  <strong>When:</strong> {describeBookingTime(booking)}
                </div>
                <div style={{ fontSize: 14 }}>
                  <strong>Total:</strong> {formatBookingTotal(booking.total_amount)}
                </div>
                <div style={{ fontSize: 14 }}>
                  <strong>Requested:</strong> {new Intl.DateTimeFormat("en-CA", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }).format(new Date(booking.created_at))}
                </div>
              </div>
            </div>
          );
        })()
      )}
    </SectionCard>
  );
}
