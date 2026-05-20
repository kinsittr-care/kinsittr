"use client";

import { useQuery } from "@tanstack/react-query";
import ReviewList from "@/src/components/shared/ReviewList";
import {
  listParentReviews,
  parentReviewsQueryKey,
} from "@/src/utils/api/reviews";
import SectionCard from "./SectionCard";

const params = { page: 1, limit: 50 };

export default function ParentReviewsView() {
  const reviewsQuery = useQuery({
    queryKey: parentReviewsQueryKey(params),
    queryFn: async () => listParentReviews(params),
  });

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 32px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 className="font-display" style={{ fontWeight: 400, fontSize: 30, marginBottom: 4 }}>
            Reviews
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>
            Reviews you have submitted for completed nanny bookings.
          </p>
        </div>
        <SectionCard title="Submitted reviews">
          {reviewsQuery.isLoading ? (
            <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>Loading reviews...</p>
          ) : reviewsQuery.isError ? (
            <p style={{ color: "#b24a3f", fontSize: 14, margin: 0 }}>
              {reviewsQuery.error instanceof Error ? reviewsQuery.error.message : "Unable to load reviews."}
            </p>
          ) : (
            <ReviewList
              reviews={reviewsQuery.data?.data?.items ?? []}
              emptyText="You have not reviewed any completed bookings yet."
            />
          )}
        </SectionCard>
      </div>
    </div>
  );
}
