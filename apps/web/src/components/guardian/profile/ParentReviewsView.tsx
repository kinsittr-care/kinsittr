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
    <div className="flex-1 overflow-y-auto pt-5 px-4 pb-8">
      <div className="max-w-[900px] mx-auto">
        <div className="mb-7">
          <h1 className="font-display font-normal text-[30px] mb-1">
            Reviews
          </h1>
          <p className="text-[var(--faint)] text-[14px]">
            Reviews you have submitted for completed nanny bookings.
          </p>
        </div>
        <SectionCard title="Submitted reviews">
          {reviewsQuery.isLoading ? (
            <p className="text-[var(--faint)] text-[14px] m-0">Loading reviews...</p>
          ) : reviewsQuery.isError ? (
            <p className="text-[#b24a3f] text-[14px] m-0">
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
