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
  if (compact) {
    return (
      <>
        {bookings.map((booking, index) => {
          return (
            <div
              key={booking.id}
              className={cn(
                "grid grid-cols-[40px_minmax(0,1fr)_auto] items-start gap-x-[14px] gap-y-2 py-[14px]",
                index !== bookings.length - 1 && "border-b border-brand-border",
              )}
            >
              <Avatar initials={getBookingInitials(booking.nanny_display_name)} src={booking.nanny_avatar_url} size={40} />
              <button
                type="button"
                className="min-w-0 cursor-pointer bg-transparent p-0 text-left [font-family:inherit]"
                onClick={() => onSelect(booking.id)}
              >
                <div className="truncate text-[14px] font-semibold">{booking.nanny_display_name ?? "Selected nanny"}</div>
                <div className="mt-[1px] text-[12.5px] text-brand-faint">{describeBookingTime(booking)}</div>
              </button>
              <div className="shrink-0 text-[16px] font-bold">{formatCurrency(booking.total_amount)}</div>
              <div className="col-span-3 flex flex-wrap gap-1.5">
                <BookingStatusBadge status={booking.status} />
                <PaymentStatusBadge status={booking.payment_status} />
              </div>
            </div>
          );
        })}
      </>
    );
  }

  return (
    <>
      {bookings.map((booking, index) => {
        const isReviewed = reviewedBookingIds.has(booking.id);
        const actionButtons = (
          <>
            <button
              className="min-h-[52px] rounded-[18px] border-[1.5px] border-[#ded4c4] bg-white px-8 text-[18px] font-bold text-brand-text transition-colors hover:bg-[#fbf7ef] max-lg:min-h-[60px] max-lg:flex-1 max-lg:px-4 max-lg:text-[22px] max-sm:min-h-[52px] max-sm:text-[16px]"
              onClick={() => onSelect(booking.id)}
            >
              View details
            </button>
            {booking.status === "pending" && (
              <button
                className={cn(
                  "min-h-[52px] rounded-[18px] border-[1.5px] border-[#edc8c2] bg-white px-8 text-[18px] font-bold text-[#a84432] [font-family:inherit] transition-colors hover:bg-[#fff7f5] max-lg:min-h-[60px] max-lg:flex-1 max-lg:px-4 max-lg:text-[22px] max-sm:min-h-[52px] max-sm:text-[16px]",
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
                  "min-h-[52px] rounded-[18px] px-8 text-[18px] font-bold [font-family:inherit] max-lg:min-h-[60px] max-lg:flex-1 max-lg:px-4 max-lg:text-[22px] max-sm:min-h-[52px] max-sm:text-[16px]",
                  isReviewed
                    ? "cursor-default border-[1.5px] border-[#eee9df] bg-[#eee9df] text-[#8b8174]"
                    : "cursor-pointer border-0 bg-teal text-white",
                )}
                disabled={isReviewed}
                onClick={() => onReview(booking.id)}
              >
                {isReviewed ? "Reviewed ✓" : "Leave review"}
              </button>
            )}
          </>
        );

        return (
          <div
            key={booking.id}
            className={cn(
              "py-10 max-lg:py-12 max-sm:py-8",
              index !== bookings.length - 1 && "border-b border-[#e8dfd1]",
            )}
          >
            <div className="grid grid-cols-[1fr_auto] items-start gap-8">
              <div className="grid min-w-0 grid-cols-[72px_minmax(0,1fr)] items-start gap-5 max-lg:grid-cols-[96px_minmax(0,1fr)_auto] max-lg:gap-7 max-sm:grid-cols-[64px_minmax(0,1fr)_auto] max-sm:gap-3">
                <button
                  type="button"
                  className="shrink-0 cursor-pointer bg-transparent p-0"
                  onClick={() => onSelect(booking.id)}
                  aria-label={`View ${booking.nanny_display_name ?? "booking"} details`}
                >
                  <span className="hidden lg:block">
                    <Avatar initials={getBookingInitials(booking.nanny_display_name)} src={booking.nanny_avatar_url} size={72} />
                  </span>
                  <span className="block lg:hidden max-sm:hidden">
                    <Avatar initials={getBookingInitials(booking.nanny_display_name)} src={booking.nanny_avatar_url} size={96} />
                  </span>
                  <span className="hidden max-sm:block">
                    <Avatar initials={getBookingInitials(booking.nanny_display_name)} src={booking.nanny_avatar_url} size={64} />
                  </span>
                </button>

                <button
                  type="button"
                  className="min-w-0 cursor-pointer bg-transparent p-0 pt-1 text-left [font-family:inherit] max-lg:pt-3 max-sm:pt-1"
                  onClick={() => onSelect(booking.id)}
                >
                  <div className="truncate text-[24px] font-bold leading-tight text-brand-text max-lg:text-[28px] max-sm:text-[21px]">
                    {booking.nanny_display_name ?? "Selected nanny"}
                  </div>
                  <div className="mt-2 text-[18px] leading-tight text-[#81796f] max-lg:text-[22px] max-sm:text-[15px]">
                    {describeBookingTime(booking)}
                  </div>
                </button>

                <div className="text-right text-[32px] font-black leading-none text-brand-text lg:hidden max-sm:text-[22px]">
                  {formatCurrency(booking.total_amount)}
                </div>
              </div>

              <div className="hidden text-right text-[28px] font-black leading-none text-brand-text lg:block">
                {formatCurrency(booking.total_amount)}
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-between gap-4 max-lg:block max-sm:mt-6">
              <div className="flex flex-wrap gap-3 max-sm:gap-2">
                <BookingStatusBadge
                  status={booking.status}
                  className="border-0 px-4 py-2 text-[16px] max-lg:px-5 max-lg:py-3 max-lg:text-[20px] max-sm:px-3 max-sm:py-2 max-sm:text-[14px]"
                />
                <PaymentStatusBadge
                  status={booking.payment_status}
                  className="border-0 px-4 py-2 text-[16px] max-lg:px-5 max-lg:py-3 max-lg:text-[20px] max-sm:px-3 max-sm:py-2 max-sm:text-[14px]"
                />
              </div>

              <div className="flex justify-end gap-3 max-lg:mt-7 max-lg:grid max-lg:grid-cols-2 max-lg:gap-5 max-sm:mt-6 max-sm:gap-3">
                {actionButtons}
              </div>
            </div>
          </div>
        );
      })}

      {totalPages > 1 ? (
        <div className="mt-7 flex items-center justify-between gap-3">
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
