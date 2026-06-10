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
        <p className="text-[var(--faint)] text-[14px] m-0">Loading booking details…</p>
      ) : error ? (
        <p className="text-[#b24a3f] text-[14px] m-0">
          {error instanceof Error ? error.message : "Unable to load booking details."}
        </p>
      ) : (
        (() => {
          const booking = data?.data as Booking | undefined;
          if (!booking) {
            return <p className="text-[var(--faint)] text-[14px] m-0">Booking details unavailable.</p>;
          }

          return (
            <div className="grid gap-[14px]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-[18px]">{booking.nanny_display_name ?? "Selected nanny"}</div>
                  <div className="text-[var(--faint)] text-[13px] mt-[2px]">
                    {formatLocation(booking.nanny_city, booking.nanny_province, "Location not set")}
                  </div>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <BookingStatusBadge status={booking.status} />
                  <PaymentStatusBadge status={booking.payment_status} />
                </div>
              </div>
              <div className="grid gap-[10px]">
                <div className="text-[14px]">
                  <strong>When:</strong> {describeBookingTime(booking)}
                </div>
                <div className="text-[14px]">
                  <strong>Total:</strong> {formatCurrency(booking.total_amount)}
                </div>
                {booking.payment_failure_message && (
                  <div className="text-[14px] text-[#b24a3f]">
                    <strong>Payment issue:</strong> {booking.payment_failure_message}
                  </div>
                )}
                <div className="text-[14px]">
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
