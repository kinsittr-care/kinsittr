import { cn } from "@/lib/utils";
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
      {bookings.map((booking, index) => {
        const isReviewed = reviewedBookingIds.has(booking.id);
        return (
          <div
            key={booking.id}
            className={cn(
              "flex flex-col md:flex-row md:items-center gap-4 py-[14px]",
              index !== bookings.length - 1 && "border-b border-brand-border",
            )}
          >
            <div
              className={cn("flex items-center gap-[14px] flex-1", !compact ? "cursor-pointer" : "cursor-default")}
              onClick={!compact ? () => onSelect(booking.id) : undefined}
            >
              <Avatar initials={getBookingInitials(booking.nanny_display_name)} size={40} />
              <div className="flex-1">
                <div className="font-semibold text-[14px]">{booking.nanny_display_name ?? "Selected nanny"}</div>
                <div className="text-[12.5px] text-brand-faint mt-[1px]">{describeBookingTime(booking)}</div>
              </div>
            </div>
            <div className={cn("flex flex-col md:flex-row md:items-center gap-3", !compact && "md:ml-auto")}>
              <div className={compact ? "text-left" : "text-right"}>
                <div className="font-bold text-[15px]">{formatCurrency(booking.total_amount)}</div>
                <div className="flex flex-wrap justify-start md:justify-end gap-1.5 mt-1">
                  <BookingStatusBadge status={booking.status} />
                  <PaymentStatusBadge status={booking.payment_status} />
                </div>
              </div>
              {!compact && (
                <div className="flex gap-2">
                  <button className="btn-outline px-[14px] py-2 text-[13px]" onClick={() => onSelect(booking.id)}>
                    View details
                  </button>
                  {booking.status === "pending" && (
                    <button
                      className={cn(
                        "px-[14px] py-2 text-[13px] rounded-[10px] bg-white text-[#c0392b] border-[1.5px] border-[#f0d0d0] [font-family:inherit]",
                        cancelIsPending ? "cursor-not-allowed" : "cursor-pointer",
                      )}
                      disabled={cancelIsPending}
                      onClick={() => onCancel(booking.id)}
                    >
                      {cancelIsPending ? "Cancelling..." : "Cancel"}
                    </button>
                  )}
                  {booking.status === "completed" && (
                    <button
                      className={cn(
                        "px-[14px] py-2 text-[13px] rounded-[10px] [font-family:inherit] font-semibold",
                        isReviewed
                          ? "bg-[var(--bg-warm)] text-[var(--faint)] border-[1.5px] border-brand-border cursor-default"
                          : "bg-teal text-white border-0 cursor-pointer",
                      )}
                      disabled={isReviewed}
                      onClick={() => onReview(booking.id)}
                    >
                      {isReviewed ? "Reviewed" : "Leave review"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {!compact && totalPages > 1 ? (
        <div className="flex items-center justify-between mt-[18px] gap-3">
          <button className="btn-outline px-4 py-[10px] text-[13px]" onClick={() => onPageChange((current) => Math.max(1, current - 1))} disabled={currentPage === 1}>
            Previous
          </button>
          <span className="text-[13px] text-[var(--faint)]">Page {currentPage} of {totalPages}</span>
          <button className="btn-outline px-4 py-[10px] text-[13px]" onClick={() => onPageChange((current) => Math.min(totalPages, current + 1))} disabled={currentPage >= totalPages}>
            Next
          </button>
        </div>
      ) : null}
    </>
  );
}
