import AdminPill from "./AdminPill";
import { btnApprove, btnDanger } from "./admin-styles";
import { A } from "../tokens";
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
    <aside style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 16, boxShadow: A.shadow, padding: 22, alignSelf: "start", display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <div style={{ fontSize: 12, color: A.inkSoft, fontFamily: "monospace" }}>{booking.id}</div>
        <h2 style={{ margin: "8px 0 0", fontFamily: "var(--font-dm-serif), serif", fontSize: 24, color: A.ink }}>Booking details</h2>
        <div style={{ marginTop: 10 }}>
          <AdminPill tone={bookingStatusTone(booking.status)}>{booking.status}</AdminPill>
          <AdminPill tone={paymentTone} style={{ marginLeft: 8 }}>{paymentState.label}</AdminPill>
        </div>
      </div>

      <div style={{ display: "grid", gap: 10, fontSize: 14, color: A.inkMid }}>
        <div><strong style={{ color: A.ink }}>Parent:</strong> {booking.parent_display_name}</div>
        <div><strong style={{ color: A.ink }}>Nanny:</strong> {booking.nanny_display_name}</div>
        <div><strong style={{ color: A.ink }}>Date:</strong> {formatDateOnlyShort(booking.date)} at {booking.start_time}</div>
        <div><strong style={{ color: A.ink }}>Duration:</strong> {booking.duration} hours</div>
        <div><strong style={{ color: A.ink }}>Total:</strong> {formatCurrency(booking.total_amount)}</div>
        <div><strong style={{ color: A.ink }}>Payment:</strong> {paymentState.label}</div>
        {booking.payment_amount ? <div><strong style={{ color: A.ink }}>Payment amount:</strong> {formatCurrency(booking.payment_amount)}</div> : null}
        {booking.platform_fee ? <div><strong style={{ color: A.ink }}>Platform fee:</strong> {formatCurrency(booking.platform_fee)}</div> : null}
        {booking.payment_failure_message && (
          <div style={{ color: A.red }}><strong>Payment issue:</strong> {booking.payment_failure_message}</div>
        )}
        {booking.stripe_payment_intent_id && <div><strong style={{ color: A.ink }}>Intent:</strong> {booking.stripe_payment_intent_id}</div>}
        {booking.stripe_charge_id && <div><strong style={{ color: A.ink }}>Charge:</strong> {booking.stripe_charge_id}</div>}
        {booking.stripe_refund_id && <div><strong style={{ color: A.ink }}>Refund:</strong> {booking.stripe_refund_id}</div>}
        {booking.payment_created_at && <div><strong style={{ color: A.ink }}>Payment created:</strong> {formatShortDateTime(booking.payment_created_at)}</div>}
        {booking.payment_updated_at && <div><strong style={{ color: A.ink }}>Payment updated:</strong> {formatShortDateTime(booking.payment_updated_at)}</div>}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button disabled={!canCancel || isBusy} onClick={onCancel} style={{ ...btnDanger, opacity: canCancel && !isBusy ? 1 : 0.55 }}>Cancel</button>
        <button disabled={!canComplete || isBusy} onClick={onComplete} style={{ ...btnApprove, opacity: canComplete && !isBusy ? 1 : 0.55 }}>Mark complete</button>
      </div>

      <div>
        <h3 style={{ margin: "0 0 10px", fontSize: 13, letterSpacing: ".12em", textTransform: "uppercase", color: A.inkSoft }}>Action history</h3>
        {isLoadingActions ? (
          <p style={{ margin: 0, color: A.inkSoft, fontSize: 14 }}>Loading actions...</p>
        ) : actions.length === 0 ? (
          <p style={{ margin: 0, color: A.inkSoft, fontSize: 14 }}>No admin actions yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {actions.map((action) => (
              <div key={action.id} style={{ borderTop: `1px solid ${A.borderSoft}`, paddingTop: 10 }}>
                <div style={{ fontSize: 13.5, color: A.ink, fontWeight: 600 }}>{action.action}</div>
                <div style={{ fontSize: 12.5, color: A.inkSoft, marginTop: 3 }}>
                  {action.previous_status} {"->"} {action.new_status} · {formatShortDateTime(action.created_at)}
                </div>
                <div style={{ fontSize: 13, color: A.inkMid, marginTop: 5 }}>{action.reason}</div>
                {action.admin_email && <div style={{ fontSize: 12, color: A.inkSoft, marginTop: 4 }}>{action.admin_email}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
