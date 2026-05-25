import type { Booking } from "@/src/types/api/api";
import Avatar from "../dashboard/Avatar";
import BookingStatusBadge from "./BookingStatusBadge";
import PaymentStatusBadge from "./PaymentStatusBadge";
import { getBookingInitials } from "./booking-helpers";
import { describeBookingTime, formatCurrency } from "@/src/utils/format";

type ParentBookingsListProps = {
  bookings: Booking[];
  cancelIsPending: boolean;
  compact: boolean;
  currentPage: number;
  reviewedBookingIds: Set<string>;
  totalPages: number;
  onCancel: (bookingId: string) => void;
  onPageChange: (updater: (current: number) => number) => void;
  onReview: (bookingId: string) => void;
  onSelect: (bookingId: string) => void;
};

export default function ParentBookingsList({
  bookings,
  cancelIsPending,
  compact,
  currentPage,
  reviewedBookingIds,
  totalPages,
  onCancel,
  onPageChange,
  onReview,
  onSelect,
}: ParentBookingsListProps) {
  return (
    <>
      {bookings.map((booking, index) => (
        <div
          key={booking.id}
          className="flex flex-col md:flex-row md:items-center gap-4"
          style={{ padding: "14px 0", borderBottom: index === bookings.length - 1 ? "none" : "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-[14px]" style={{ flex: 1, cursor: !compact ? "pointer" : "default" }} onClick={!compact ? () => onSelect(booking.id) : undefined}>
            <Avatar initials={getBookingInitials(booking.nanny_display_name)} size={40} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{booking.nanny_display_name ?? "Selected nanny"}</div>
              <div style={{ fontSize: 12.5, color: "var(--faint)", marginTop: 1 }}>{describeBookingTime(booking)}</div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-3" style={{ marginLeft: compact ? 0 : "auto" }}>
            <div style={{ textAlign: compact ? "left" : "right" }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{formatCurrency(booking.total_amount)}</div>
              <div className="flex flex-wrap justify-start md:justify-end gap-1.5" style={{ marginTop: 4 }}>
                <BookingStatusBadge status={booking.status} />
                <PaymentStatusBadge status={booking.payment_status} />
              </div>
            </div>
            {!compact && (
              <div className="flex gap-2">
                <button className="btn-outline" style={{ padding: "8px 14px", fontSize: 13 }} onClick={() => onSelect(booking.id)}>
                  View details
                </button>
                {booking.status === "pending" && (
                  <button
                    style={{
                      padding: "8px 14px",
                      fontSize: 13,
                      borderRadius: 10,
                      background: "#fff",
                      color: "#c0392b",
                      border: "1.5px solid #f0d0d0",
                      cursor: cancelIsPending ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                    }}
                    disabled={cancelIsPending}
                    onClick={() => onCancel(booking.id)}
                  >
                    {cancelIsPending ? "Cancelling..." : "Cancel"}
                  </button>
                )}
                {booking.status === "completed" && (
                  <button
                    style={{
                      padding: "8px 14px",
                      fontSize: 13,
                      borderRadius: 10,
                      background: reviewedBookingIds.has(booking.id) ? "var(--bg-warm)" : "var(--teal)",
                      color: reviewedBookingIds.has(booking.id) ? "var(--muted)" : "#fff",
                      border: reviewedBookingIds.has(booking.id) ? "1.5px solid var(--border)" : "none",
                      cursor: reviewedBookingIds.has(booking.id) ? "default" : "pointer",
                      fontFamily: "inherit",
                      fontWeight: 600,
                    }}
                    disabled={reviewedBookingIds.has(booking.id)}
                    onClick={() => onReview(booking.id)}
                  >
                    {reviewedBookingIds.has(booking.id) ? "Reviewed" : "Leave review"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {!compact && totalPages > 1 ? (
        <div className="flex items-center justify-between" style={{ marginTop: 18, gap: 12 }}>
          <button className="btn-outline" style={{ padding: "10px 16px", fontSize: 13 }} onClick={() => onPageChange((current) => Math.max(1, current - 1))} disabled={currentPage === 1}>
            Previous
          </button>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>Page {currentPage} of {totalPages}</span>
          <button className="btn-outline" style={{ padding: "10px 16px", fontSize: 13 }} onClick={() => onPageChange((current) => Math.min(totalPages, current + 1))} disabled={currentPage >= totalPages}>
            Next
          </button>
        </div>
      ) : null}
    </>
  );
}
