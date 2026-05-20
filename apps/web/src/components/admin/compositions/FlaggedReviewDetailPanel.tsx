import AdminPill from "./AdminPill";
import { btnApprove, btnDanger } from "./admin-styles";
import { A } from "../tokens";
import type { AdminReview, AdminReviewAction } from "@/src/types/api/admin";
import { formatShortDateTime } from "@/src/utils/format";
import { reviewerName, targetName } from "./FlaggedReviewList";

export default function FlaggedReviewDetailPanel({
  review,
  actions,
  isLoadingActions,
  isBusy,
  onHide,
  onRestore,
}: {
  review: AdminReview;
  actions: AdminReviewAction[];
  isLoadingActions: boolean;
  isBusy: boolean;
  onHide: () => void;
  onRestore: () => void;
}) {
  return (
    <aside style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 16, boxShadow: A.shadow, padding: 22, alignSelf: "start", display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <div style={{ fontSize: 12, color: A.inkSoft, fontFamily: "monospace" }}>{review.id}</div>
        <h2 style={{ margin: "8px 0 0", fontFamily: "var(--font-dm-serif), serif", fontSize: 24, color: A.ink }}>Review details</h2>
        <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <AdminPill tone="clay">{review.target} review</AdminPill>
          <AdminPill tone={review.is_visible ? "green" : "red"}>{review.is_visible ? "Visible" : "Hidden"}</AdminPill>
        </div>
      </div>

      <div style={{ display: "grid", gap: 10, fontSize: 14, color: A.inkMid }}>
        <div><strong style={{ color: A.ink }}>Reviewer:</strong> {reviewerName(review)}</div>
        <div><strong style={{ color: A.ink }}>Target:</strong> {targetName(review)}</div>
        <div><strong style={{ color: A.ink }}>Booking:</strong> {review.booking_date} at {review.booking_start_time}</div>
        <div><strong style={{ color: A.ink }}>Rating:</strong> {review.rating}/5</div>
        {review.flag_reason && <div><strong style={{ color: A.ink }}>Flag reason:</strong> {review.flag_reason}</div>}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button disabled={!review.is_visible || isBusy} onClick={onHide} style={{ ...btnDanger, opacity: review.is_visible && !isBusy ? 1 : 0.55 }}>Hide review</button>
        <button disabled={review.is_visible || isBusy} onClick={onRestore} style={{ ...btnApprove, opacity: !review.is_visible && !isBusy ? 1 : 0.55 }}>Restore</button>
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
                <div style={{ fontSize: 12.5, color: A.inkSoft, marginTop: 3 }}>{formatShortDateTime(action.created_at)}</div>
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
