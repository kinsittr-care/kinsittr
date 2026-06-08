"use client";

import { useQuery } from "@tanstack/react-query";
import type { Booking } from "@/src/types/api/api";
import { getParentBookingById, parentBookingQueryKey } from "@/src/utils/api/bookings";
import { describeBookingTime, formatCurrency, formatLocation, formatShortDateCA } from "@/src/utils/format";
import SectionCard from "../profile/SectionCard";
import BookingStatusBadge from "./BookingStatusBadge";
import PaymentStatusBadge from "./PaymentStatusBadge";

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
                    {formatLocation(booking.nanny_city, booking.nanny_province, "Location not set")}
                  </div>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <BookingStatusBadge status={booking.status} />
                  <PaymentStatusBadge status={booking.payment_status} />
                </div>
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ fontSize: 14 }}>
                  <strong>When:</strong> {describeBookingTime(booking)}
                </div>
                <div style={{ fontSize: 14 }}>
                  <strong>Total:</strong> {formatCurrency(booking.total_amount)}
                </div>
                {booking.payment_failure_message && (
                  <div style={{ fontSize: 14, color: "#b24a3f" }}>
                    <strong>Payment issue:</strong> {booking.payment_failure_message}
                  </div>
                )}
                <div style={{ fontSize: 14 }}>
                  <strong>Requested:</strong> {formatShortDateCA(booking.created_at)}
                </div>
              </div>
            </div>
          );
        })()
      )}
    </SectionCard>
  );
}
