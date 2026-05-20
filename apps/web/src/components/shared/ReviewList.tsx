import type { Review } from "@/src/types/api/api";

function formatReviewDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function ReviewList({
  reviews,
  emptyText,
}: {
  reviews: Review[];
  emptyText: string;
}) {
  if (reviews.length === 0) {
    return <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>{emptyText}</p>;
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {reviews.map((review) => (
        <article
          key={review.id}
          style={{
            border: "1px solid var(--border, #e7ddd2)",
            borderRadius: 16,
            background: "#fffdf8",
            padding: 16,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 700, color: "var(--brand-text, #33271f)" }}>
                {review.target === "nanny"
                  ? review.nanny_display_name || "Nanny"
                  : review.parent_display_name || "Parent"}
              </div>
              <div style={{ fontSize: 12.5, color: "var(--faint, #9b9188)", marginTop: 2 }}>
                {formatReviewDate(review.created_at)} · Booking {review.booking_date}
              </div>
            </div>
            <div style={{ color: "var(--gold, #c8992f)", fontSize: 13 }}>
              {"★".repeat(review.rating)}
            </div>
          </div>
          <p style={{ margin: "12px 0 0", lineHeight: 1.65, color: "var(--brand-text, #33271f)", fontSize: 14 }}>
            {review.comment}
          </p>
          {!review.is_visible && (
            <div
              style={{
                marginTop: 12,
                borderRadius: 10,
                background: "#fff4ea",
                border: "1px solid #f0c8a8",
                color: "#9a5528",
                padding: "8px 10px",
                fontSize: 12.5,
              }}
            >
              Hidden by moderation{review.flag_reason ? `: ${review.flag_reason}` : "."}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
