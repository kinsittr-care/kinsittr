import AdminPagination from "../AdminPagination";
import AdminPill from "./AdminPill";
import AdminStars from "./AdminStars";
import { card } from "./admin-styles";
import { A } from "../tokens";
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
        <div style={card}><p style={{ margin: 0, color: A.inkSoft }}>Loading reviews...</p></div>
        <AdminPagination page={page} total={total} limit={limit} onPageChange={onPageChange} />
      </>
    );
  }

  if (reviews.length === 0) {
    return (
      <>
        <div style={card}><p style={{ margin: 0, color: A.inkSoft }}>No reviews found.</p></div>
        <AdminPagination page={page} total={total} limit={limit} onPageChange={onPageChange} />
      </>
    );
  }

  return (
    <>
      {reviews.map((review) => (
        <button
          key={`${review.target}-${review.id}`}
          onClick={() => onSelect({ id: review.id, target: review.target })}
          style={{
            ...card,
            display: "block",
            width: "100%",
            textAlign: "left",
            cursor: "pointer",
            background: selectedReview?.id === review.id && selectedReview.target === review.target ? A.cardWarm : A.card,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontSize: 15.5, color: A.ink }}>
              <span style={{ fontWeight: 700 }}>{reviewerName(review)}</span>
              <span style={{ color: A.inkSoft, margin: "0 8px" }}>review of</span>
              <span style={{ fontWeight: 700 }}>{targetName(review)}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <AdminPill tone={review.is_visible ? "green" : "red"}>{review.is_visible ? "Visible" : "Hidden"}</AdminPill>
              <AdminPill tone={review.reviewed_by_admin ? "clay" : "amber"}>{review.reviewed_by_admin ? "Reviewed" : "Needs review"}</AdminPill>
              <span style={{ fontSize: 13, color: A.inkSoft }}>{formatShortDate(review.created_at)}</span>
            </div>
          </div>

          <div style={{ marginTop: 16, padding: "18px 20px", background: A.bgSoft, border: `1px solid ${A.borderSoft}`, borderRadius: 12 }}>
            <AdminStars value={review.rating} />
            <p style={{ marginTop: 12, fontFamily: "var(--font-dm-serif), serif", fontStyle: "italic", fontSize: 17, color: A.ink, lineHeight: 1.4 }}>
              &ldquo;{review.comment}&rdquo;
            </p>
            {review.flag_reason && <p style={{ margin: "10px 0 0", color: A.red, fontSize: 13 }}>Flag reason: {review.flag_reason}</p>}
          </div>
        </button>
      ))}
      <AdminPagination page={page} total={total} limit={limit} onPageChange={onPageChange} />
    </>
  );
}
