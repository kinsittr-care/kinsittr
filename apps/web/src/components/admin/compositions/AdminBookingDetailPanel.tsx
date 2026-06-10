import AdminPill from "./AdminPill";
import { btnApproveCls, btnDangerCls } from "./admin-styles";
import { cn } from "@/lib/utils";
import type { AdminBooking, AdminBookingAction } from "@/src/types/api/admin";
import { formatCurrency, formatDateOnlyShort, formatPaymentState, formatShortDateTime } from "@/src/utils/format";
import { bookingStatusTone } from "./AdminBookingsTable";

export default function AdminBookingDetailPanel({
  booking,
  actions,
  isLoadingActions,
  isBusy,
  onCancel,
  onComplete,
}: {
  booking: AdminBooking;
  actions: AdminBookingAction[];
  isLoadingActions: boolean;
  isBusy: boolean;
  onCancel: () => void;
  onComplete: () => void;
}) {
  const canCancel = booking.status === "pending" || booking.status === "approved";
  const canComplete = booking.status === "approved";
  const paymentState = formatPaymentState(booking.payment_status);
  const paymentTone = paymentState.tone === "danger" ? "red" : paymentState.tone === "success" ? "green" : paymentState.tone === "warning" ? "amber" : "neutral";

  return (
    <aside className="bg-admin-card border border-admin-border rounded-2xl shadow-[var(--admin-shadow)] p-[22px] self-start flex flex-col gap-[18px]">
      <div>
        <div className="text-[12px] text-admin-ink-soft font-mono">{booking.id}</div>
        <h2 className="mt-2 mb-0 font-display text-[24px] text-admin-ink">Booking details</h2>
        <div className="mt-[10px] flex gap-2">
          <AdminPill tone={bookingStatusTone(booking.status)}>{booking.status}</AdminPill>
          <AdminPill tone={paymentTone}>{paymentState.label}</AdminPill>
        </div>
      </div>

      <div className="grid gap-[10px] text-[14px] text-admin-ink-mid">
        <div><strong className="text-admin-ink">Parent:</strong> {booking.parent_display_name}</div>
        <div><strong className="text-admin-ink">Nanny:</strong> {booking.nanny_display_name}</div>
        <div><strong className="text-admin-ink">Date:</strong> {formatDateOnlyShort(booking.date)} at {booking.start_time}</div>
        <div><strong className="text-admin-ink">Duration:</strong> {booking.duration} hours</div>
        <div><strong className="text-admin-ink">Total:</strong> {formatCurrency(booking.total_amount)}</div>
        <div><strong className="text-admin-ink">Payment:</strong> {paymentState.label}</div>
        {booking.payment_amount ? <div><strong className="text-admin-ink">Payment amount:</strong> {formatCurrency(booking.payment_amount)}</div> : null}
        {booking.platform_fee ? <div><strong className="text-admin-ink">Platform fee:</strong> {formatCurrency(booking.platform_fee)}</div> : null}
        {booking.payment_failure_message && (
          <div className="text-admin-red"><strong>Payment issue:</strong> {booking.payment_failure_message}</div>
        )}
        {booking.stripe_payment_intent_id && <div><strong className="text-admin-ink">Intent:</strong> {booking.stripe_payment_intent_id}</div>}
        {booking.stripe_charge_id && <div><strong className="text-admin-ink">Charge:</strong> {booking.stripe_charge_id}</div>}
        {booking.stripe_refund_id && <div><strong className="text-admin-ink">Refund:</strong> {booking.stripe_refund_id}</div>}
        {booking.payment_created_at && <div><strong className="text-admin-ink">Payment created:</strong> {formatShortDateTime(booking.payment_created_at)}</div>}
        {booking.payment_updated_at && <div><strong className="text-admin-ink">Payment updated:</strong> {formatShortDateTime(booking.payment_updated_at)}</div>}
      </div>

      <div className="flex gap-[10px] flex-wrap">
        <button disabled={!canCancel || isBusy} onClick={onCancel} className={cn(btnDangerCls, (!canCancel || isBusy) && "opacity-55")}>Cancel</button>
        <button disabled={!canComplete || isBusy} onClick={onComplete} className={cn(btnApproveCls, (!canComplete || isBusy) && "opacity-55")}>Mark complete</button>
      </div>

      <div>
        <h3 className="mb-[10px] mt-0 text-[13px] tracking-[.12em] uppercase text-admin-ink-soft">Action history</h3>
        {isLoadingActions ? (
          <p className="m-0 text-admin-ink-soft text-[14px]">Loading actions...</p>
        ) : actions.length === 0 ? (
          <p className="m-0 text-admin-ink-soft text-[14px]">No admin actions yet.</p>
        ) : (
          <div className="flex flex-col gap-[10px]">
            {actions.map((action) => (
              <div key={action.id} className="border-t border-admin-border-soft pt-[10px]">
                <div className="text-[13.5px] text-admin-ink font-semibold">{action.action}</div>
                <div className="text-[12.5px] text-admin-ink-soft mt-[3px]">
                  {action.previous_status} {"->"} {action.new_status} · {formatShortDateTime(action.created_at)}
                </div>
                <div className="text-[13px] text-admin-ink-mid mt-[5px]">{action.reason}</div>
                {action.admin_email && <div className="text-[12px] text-admin-ink-soft mt-[4px]">{action.admin_email}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
