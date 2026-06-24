import { cn } from "@/lib/utils";
import AdminPagination from "../AdminPagination";
import AdminPill from "./AdminPill";
import AdminStars from "./AdminStars";
import { cardCls } from "./admin-styles";
import type { AdminReview, ReviewTarget } from "@/src/types/api/admin";
import { formatShortDate } from "@/src/utils/format";

export function reviewerName(review: AdminReview) {
  return review.target === "nanny" ? review.parent_display_name : review.nanny_display_name;
}

export function targetName(review: AdminReview) {
  return review.target === "nanny" ? review.nanny_display_name : review.parent_display_name;
}

export default function FlaggedReviewList({
  reviews,
  isLoading,
  selectedReview,
  page,
  total,
  limit,
  onSelect,
  onPageChange,
}: {
  reviews: AdminReview[];
  isLoading: boolean;
  selectedReview: { id: string; target: ReviewTarget } | null;
  page: number;
  total: number;
  limit: number;
  onSelect: (review: { id: string; target: ReviewTarget }) => void;
  onPageChange: (page: number) => void;
}) {
  if (isLoading) {
    return (
      <>
        <div className={cardCls}><p className="m-0 text-admin-ink-soft">Loading reviews...</p></div>
        <AdminPagination page={page} total={total} limit={limit} onPageChange={onPageChange} />
      </>
    );
  }

  if (reviews.length === 0) {
    return (
      <>
        <div className={cardCls}><p className="m-0 text-admin-ink-soft">No reviews found.</p></div>
        <AdminPagination page={page} total={total} limit={limit} onPageChange={onPageChange} />
      </>
    );
  }

  return (
    <>
      {reviews.map((review) => {
        const isSelected = selectedReview?.id === review.id && selectedReview.target === review.target;
        return (
          <button
            key={`${review.target}-${review.id}`}
            onClick={() => onSelect({ id: review.id, target: review.target })}
            className={cn(cardCls, "block w-full min-w-0 text-left cursor-pointer", isSelected ? "bg-admin-card-warm" : "bg-admin-card")}
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 text-[14px] text-admin-ink sm:text-[15.5px]">
                <span className="font-bold">{reviewerName(review)}</span>
                <span className="text-admin-ink-soft mx-2">review of</span>
                <span className="font-bold">{targetName(review)}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <AdminPill tone={review.is_visible ? "green" : "red"}>{review.is_visible ? "Visible" : "Hidden"}</AdminPill>
                <AdminPill tone={review.reviewed_by_admin ? "clay" : "amber"}>{review.reviewed_by_admin ? "Reviewed" : "Needs review"}</AdminPill>
                <span className="text-[13px] text-admin-ink-soft">{formatShortDate(review.created_at)}</span>
              </div>
            </div>

            <div className="mt-4 px-4 py-4 bg-admin-bg-soft border border-admin-border-soft rounded-xl sm:px-5 sm:py-[18px]">
              <AdminStars value={review.rating} />
              <p className="mt-3 mb-0 font-display italic text-[15px] text-admin-ink leading-[1.45] break-words sm:text-[17px]">
                &ldquo;{review.comment}&rdquo;
              </p>
              {review.flag_reason && <p className="mt-[10px] mb-0 text-admin-red text-[13px]">Flag reason: {review.flag_reason}</p>}
            </div>
          </button>
        );
      })}
      <AdminPagination page={page} total={total} limit={limit} onPageChange={onPageChange} />
    </>
  );
}
