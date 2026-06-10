import type { Review } from "@/src/types/api/api";
import { formatReviewDate } from "@/src/utils/format";

export default function ReviewList({
  reviews,
  emptyText,
}: {
  reviews: Review[];
  emptyText: string;
}) {
  if (reviews.length === 0) {
    return <p className="m-0 text-[14px] text-brand-faint">{emptyText}</p>;
  }

  return (
    <div className="grid gap-3">
      {reviews.map((review) => (
        <article
          key={review.id}
          className="rounded-2xl border border-(--border) bg-[#fffdf8] p-4"
        >
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              <div className="font-bold text-brand-text">
                {review.target === "nanny"
                  ? review.nanny_display_name || "Nanny"
                  : review.parent_display_name || "Parent"}
              </div>
              <div className="mt-0.5 text-[12.5px] text-brand-faint">
                {formatReviewDate(review.created_at)} · Booking {review.booking_date}
              </div>
            </div>
            <div className="text-[13px] text-gold">
              {"★".repeat(review.rating)}
            </div>
          </div>
          <p className="mt-3 mb-0 text-[14px] leading-[1.65] text-brand-text">
            {review.comment}
          </p>
          {!review.is_visible && (
            <div className="mt-3 rounded-[10px] border border-[#f0c8a8] bg-[#fff4ea] px-[10px] py-2 text-[12.5px] text-[#9a5528]">
              Hidden by moderation{review.flag_reason ? `: ${review.flag_reason}` : "."}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
