import AdminPill from "./AdminPill";
import { btnApproveCls, btnDangerCls } from "./admin-styles";
import { cn } from "@/lib/utils";
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
    <aside className="bg-admin-card border border-admin-border rounded-2xl shadow-[var(--admin-shadow)] p-[22px] self-start flex flex-col gap-[18px]">
      <div>
        <div className="text-[12px] text-admin-ink-soft font-mono">{review.id}</div>
        <h2 className="mt-2 mb-0 font-display text-[24px] text-admin-ink">Review details</h2>
        <div className="mt-[10px] flex gap-2 flex-wrap">
          <AdminPill tone="clay">{review.target} review</AdminPill>
          <AdminPill tone={review.is_visible ? "green" : "red"}>{review.is_visible ? "Visible" : "Hidden"}</AdminPill>
        </div>
      </div>

      <div className="grid gap-[10px] text-[14px] text-admin-ink-mid">
        <div><strong className="text-admin-ink">Reviewer:</strong> {reviewerName(review)}</div>
        <div><strong className="text-admin-ink">Target:</strong> {targetName(review)}</div>
        <div><strong className="text-admin-ink">Booking:</strong> {review.booking_date} at {review.booking_start_time}</div>
        <div><strong className="text-admin-ink">Rating:</strong> {review.rating}/5</div>
        {review.flag_reason && <div><strong className="text-admin-ink">Flag reason:</strong> {review.flag_reason}</div>}
      </div>

      <div className="flex gap-[10px] flex-wrap">
        <button disabled={!review.is_visible || isBusy} onClick={onHide} className={cn(btnDangerCls, (!review.is_visible || isBusy) && "opacity-55")}>Hide review</button>
        <button disabled={review.is_visible || isBusy} onClick={onRestore} className={cn(btnApproveCls, (review.is_visible || isBusy) && "opacity-55")}>Restore</button>
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
                <div className="text-[12.5px] text-admin-ink-soft mt-[3px]">{formatShortDateTime(action.created_at)}</div>
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
