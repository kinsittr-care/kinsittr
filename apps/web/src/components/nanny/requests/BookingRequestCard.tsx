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
  conversationId?: string;
  paymentStatus?: PaymentStatus | "";
  paymentFailure?: string;
  children: string;
};

export default function BookingRequestCard({
  booking,
  onApprove,
  onDecline,
  onComplete,
  onMessageParent,
  onRetryPayment,
  onReview,
  onViewDetails,
  isUpdating = false,
  isHighlighted = false,
  isReviewed = false,
}: {
  booking: BookingRequest;
  onApprove?: () => void;
  onDecline?: () => void;
  onComplete?: () => void;
  onMessageParent?: () => void;
  onRetryPayment?: () => void;
  onReview?: () => void;
  onViewDetails?: () => void;
  isUpdating?: boolean;
  isHighlighted?: boolean;
  isReviewed?: boolean;
}) {
  const isPending = booking.status === "pending";
  const isApproved = booking.status === "approved";
  const isCompleted = booking.status === "completed";
  const paymentState = formatPaymentState(booking.paymentStatus);
  const canRetryPayment = isApproved && (booking.paymentStatus === "failed" || booking.paymentStatus === "requires_payment_method");
  const canMessageParent = Boolean(booking.conversationId) && (isApproved || isCompleted);
  const compactGhostCls = cn(btnGhostCls, "justify-center px-3 py-2 text-[12px] sm:px-5 sm:py-[11px] sm:text-[14px]");
  const compactAcceptCls = cn(btnAcceptCls, "justify-center px-3 py-2 text-[12px] sm:px-[18px] sm:py-[9px] sm:text-[13.5px]");
  const compactDeclineCls = cn(btnDeclineCls, "justify-center px-3 py-2 text-[12px] sm:px-[18px] sm:py-[9px] sm:text-[13.5px]");

  return (
    <div
      className={cn(
        "bg-nanny-card rounded-[18px] px-4 py-4 sm:px-6 sm:py-[22px]",
        isHighlighted
          ? "border-2 border-nanny-green shadow-[0_0_0_4px_rgba(45,90,61,.08)]"
          : "border border-nanny-border shadow-[var(--nanny-shadow)]",
      )}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <NannyAvatar initials={booking.initials} size={44} tone="cream" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="block truncate font-display text-[17px] text-nanny-green-dk sm:text-[20px]">
                {booking.parent}
              </span>
            </div>
            <div className="text-right shrink-0">
              <div className="font-display text-[18px] text-nanny-green leading-none sm:text-[22px]">
                {booking.amount}
              </div>
              <div className="mt-1 text-[10.5px] text-nanny-ink-faint sm:text-[12px]">CAD</div>
            </div>
          </div>
          <div className="mt-2 flex flex-nowrap items-center gap-1.5 overflow-hidden [&>span]:shrink-0 [&>span]:px-2 [&>span]:text-[11px] sm:[&>span]:px-[11px] sm:[&>span]:text-[12.5px]">
              <NannyPill tone={booking.status}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </NannyPill>
              <NannyPill tone={paymentState.tone === "danger" ? "declined" : paymentState.tone === "success" ? "paid" : paymentState.tone === "warning" ? "pending" : "neutral"}>
                {paymentState.label}
              </NannyPill>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-2.5 gap-y-1 text-[12px] text-nanny-ink-faint sm:gap-x-[14px] sm:text-[13px]">
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
        <div className="mt-4 grid grid-cols-3 gap-2 sm:flex sm:gap-[10px]">
          <button className={compactAcceptCls} onClick={onApprove} disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Accept"}
          </button>
          <button className={compactDeclineCls} onClick={onDecline} disabled={isUpdating}>
            Decline
          </button>
          <button className={cn(compactGhostCls, "opacity-55 cursor-not-allowed")} disabled>
            Message
          </button>
        </div>
      )}
      {!isPending && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:gap-[10px] sm:flex-wrap">
          <button className={compactGhostCls} onClick={onViewDetails}>View details</button>
          <button
            className={cn(compactGhostCls, !canMessageParent && "opacity-55 cursor-not-allowed")}
            onClick={onMessageParent}
            disabled={!canMessageParent}
          >
            Message
          </button>
          {isApproved && (
            <button className={compactAcceptCls} onClick={canRetryPayment ? onRetryPayment : onComplete} disabled={isUpdating}>
              {isUpdating ? "Updating..." : canRetryPayment ? "Retry payment" : "Mark complete"}
            </button>
          )}
          {isCompleted && (
            <button className={cn(compactGhostCls, isReviewed && "opacity-60 cursor-not-allowed")} onClick={onReview} disabled={isReviewed}>
              {isReviewed ? "Reviewed" : "Review parent"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
