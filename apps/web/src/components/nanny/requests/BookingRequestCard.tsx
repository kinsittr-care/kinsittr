import type { PaymentStatus } from "@/src/types/api/api";
import { formatPaymentState } from "@/src/utils/format";
import { cn } from "@/lib/utils";
import NannyPill from "../NannyPill";
import type { PillTone } from "../NannyPill";
import { btnAcceptCls, btnDeclineCls, btnGhostCls } from "../nanny-styles";

export type BookingRequest = {
  id: string;
  parent: string;
  initials: string;
  dateMonth: string;
  dateDay: string;
  dateWeekday: string;
  time: string;
  hours: number;
  amount: string;
  status: PillTone;
  statusLabel: string;
  conversationId?: string;
  paymentStatus?: PaymentStatus | "";
  paymentFailure?: string;
  location: string;
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
  const compactGhostCls = cn(
    btnGhostCls,
    "min-w-0 justify-center rounded-[14px] px-2 py-3 text-[13px] font-bold sm:rounded-[16px] sm:px-6 sm:py-4 sm:text-[16px]",
  );
  const compactAcceptCls = cn(
    btnAcceptCls,
    "min-w-0 justify-center rounded-[14px] px-2 py-3 text-[13px] font-bold sm:rounded-[16px] sm:px-6 sm:py-4 sm:text-[16px]",
  );
  const compactDeclineCls = cn(
    btnDeclineCls,
    "min-w-0 justify-center rounded-[14px] px-2 py-3 text-[13px] font-bold sm:rounded-[16px] sm:px-6 sm:py-4 sm:text-[16px]",
  );

  return (
    <div
      className={cn(
        "bg-nanny-card rounded-[26px] px-4 py-5 sm:px-8 sm:py-8",
        isHighlighted
          ? "border-2 border-nanny-green shadow-[0_0_0_4px_rgba(45,90,61,.08)]"
          : "border border-nanny-border shadow-[var(--nanny-shadow)]",
      )}
    >
      <div className="grid grid-cols-[64px_minmax(0,1fr)_auto] gap-3 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:gap-6">
        <div className="flex h-[80px] w-[64px] flex-col items-center justify-center rounded-[18px] bg-nanny-green-lt text-nanny-green-dk sm:h-[86px] sm:w-[72px] sm:rounded-[22px]">
          <span className="text-[10px] font-black uppercase tracking-[0.18em] sm:text-[12px]">{booking.dateMonth}</span>
          <span className="font-display text-[30px] leading-none sm:text-[36px]">{booking.dateDay}</span>
          <span className="mt-1 text-[12px] font-semibold sm:text-[14px]">{booking.dateWeekday}</span>
        </div>

        <div className="min-w-0">
          <div className="min-w-0">
            <span className="block truncate font-display text-[22px] leading-tight text-nanny-green-dk sm:text-[22px]">
                {booking.parent}
            </span>
            <div className="mt-1 whitespace-nowrap text-[14px] leading-snug text-nanny-ink-faint sm:mt-2 sm:text-[16px]">
              {booking.time} · {booking.hours}h
            </div>
            <div className="mt-1 truncate text-[14px] leading-snug text-nanny-ink-faint sm:mt-2 sm:text-[16px]">
              {booking.location}
            </div>
          </div>

        </div>

        <div className="shrink-0 text-right">
          <div className="font-display text-[24px] leading-none text-nanny-green sm:text-[28px]">
            {booking.amount}
          </div>
          <div className="mt-1 text-[13px] text-nanny-ink-faint sm:mt-2 sm:text-[14px]">CAD</div>
        </div>

        <div className="col-span-3 flex flex-wrap gap-2 [&>span]:border-0 [&>span]:px-3 [&>span]:py-2 [&>span]:text-[13px] sm:col-start-2 sm:col-end-4 sm:[&>span]:px-4 sm:[&>span]:py-2 sm:[&>span]:text-[15px]">
          <NannyPill tone={booking.status}>
            {booking.statusLabel}
          </NannyPill>
          <NannyPill tone={paymentState.tone === "danger" ? "declined" : paymentState.tone === "success" ? "paid" : paymentState.tone === "warning" ? "pending" : "neutral"}>
            {paymentState.label}
          </NannyPill>
        </div>
      </div>

      {booking.paymentFailure && (
        <div className="mt-3 text-nanny-rose text-[13.5px]">
          Payment issue: {booking.paymentFailure}
        </div>
      )}

      <div className="mt-7 border-t border-nanny-border pt-7 sm:mt-6 sm:pt-6" />

      {isPending && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
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
        <div className={cn("grid gap-2 sm:gap-3", isApproved || isCompleted ? "grid-cols-3" : "grid-cols-2")}>
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
