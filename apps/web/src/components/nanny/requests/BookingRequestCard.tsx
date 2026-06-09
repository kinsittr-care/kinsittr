import type { PaymentStatus } from "@/src/types/api/api";
import { formatPaymentState } from "@/src/utils/format";
import { cn } from "@/lib/utils";
import NannyAvatar from "../NannyAvatar";
import NannyPill from "../NannyPill";
import type { PillTone } from "../NannyPill";
import { btnAcceptCls, btnDeclineCls, btnGhostCls } from "../nanny-styles";

export type BookingRequest = {
  id: string;
  parent: string;
  initials: string;
  date: string;
  time: string;
  hours: number;
  amount: string;
  status: PillTone;
  paymentStatus?: PaymentStatus | "";
  paymentFailure?: string;
  children: string;
};

export default function BookingRequestCard({
  booking,
  onApprove,
  onDecline,
  onComplete,
  onRetryPayment,
  onReview,
  isUpdating = false,
  isHighlighted = false,
  isReviewed = false,
}: {
  booking: BookingRequest;
  onApprove?: () => void;
  onDecline?: () => void;
  onComplete?: () => void;
  onRetryPayment?: () => void;
  onReview?: () => void;
  isUpdating?: boolean;
  isHighlighted?: boolean;
  isReviewed?: boolean;
}) {
  const isPending = booking.status === "pending";
  const isApproved = booking.status === "approved";
  const isCompleted = booking.status === "completed";
  const paymentState = formatPaymentState(booking.paymentStatus);
  const canRetryPayment = isApproved && (booking.paymentStatus === "failed" || booking.paymentStatus === "requires_payment_method");

  return (
    <div
      className={cn(
        "bg-nanny-card rounded-[18px] px-6 py-[22px]",
        isHighlighted
          ? "border-2 border-nanny-green shadow-[0_0_0_4px_rgba(45,90,61,.08)]"
          : "border border-nanny-border shadow-[var(--nanny-shadow)]",
      )}
    >
      <div className="flex items-start gap-4">
        <NannyAvatar initials={booking.initials} size={52} tone="cream" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="font-display text-[20px] text-nanny-green-dk truncate">
                {booking.parent}
              </span>
              <NannyPill tone={booking.status}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </NannyPill>
              <NannyPill tone={paymentState.tone === "danger" ? "declined" : paymentState.tone === "success" ? "paid" : paymentState.tone === "warning" ? "pending" : "neutral"}>
                {paymentState.label}
              </NannyPill>
            </div>
            <div className="text-right shrink-0">
              <div className="font-display text-[22px] text-nanny-green leading-none">
                {booking.amount}
              </div>
              <div className="text-[12px] text-nanny-ink-faint mt-1">CAD</div>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-[14px] gap-y-1 text-[13px] text-nanny-ink-faint">
            <span>📅 {booking.date}</span>
            <span>🕐 {booking.time}</span>
            <span>👶 {booking.children}</span>
            <span>{booking.hours}h</span>
          </div>
        </div>
      </div>
      {booking.paymentFailure && (
        <div className="mt-3 text-nanny-rose text-[13.5px]">
          Payment issue: {booking.paymentFailure}
        </div>
      )}

      {isPending && (
        <div className="flex gap-[10px] mt-[18px]">
          <button className={btnAcceptCls} onClick={onApprove} disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Accept"}
          </button>
          <button className={btnDeclineCls} onClick={onDecline} disabled={isUpdating}>
            Decline
          </button>
          <button className={btnGhostCls}>Message parent</button>
        </div>
      )}
      {!isPending && (
        <div className="mt-4 flex gap-[10px] flex-wrap">
          <button className={btnGhostCls}>View details</button>
          {isApproved && (
            <button className={btnAcceptCls} onClick={canRetryPayment ? onRetryPayment : onComplete} disabled={isUpdating}>
              {isUpdating ? "Updating..." : canRetryPayment ? "Retry payment" : "Mark complete"}
            </button>
          )}
          {isCompleted && (
            <button className={cn(btnGhostCls, isReviewed && "opacity-60 cursor-not-allowed")} onClick={onReview} disabled={isReviewed}>
              {isReviewed ? "Reviewed" : "Review parent"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
