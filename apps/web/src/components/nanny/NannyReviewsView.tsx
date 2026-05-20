"use client";

import { useQuery } from "@tanstack/react-query";
import ReviewList from "@/src/components/shared/ReviewList";
import {
  listNannyReviews,
  nannyReviewsQueryKey,
} from "@/src/utils/api/reviews";

const params = { page: 1, limit: 50 };

export default function NannyReviewsView() {
  const reviewsQuery = useQuery({
    queryKey: nannyReviewsQueryKey(params),
    queryFn: async () => listNannyReviews(params),
  });

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-6 pb-16 md:px-12 md:pt-10 md:pb-20">
      <div className="mb-6 md:mb-7">
        <h1 className="font-display text-[28px] md:text-[36px] font-normal text-nanny-green-dk leading-tight">
          Reviews
        </h1>
        <p className="mt-2 text-sm md:text-[14.5px] text-nanny-ink-mute">
          Reviews you have submitted for completed parent bookings.
        </p>
      </div>

      <section className="bg-nanny-card border border-nanny-border rounded-[18px] p-5 md:p-6 shadow-[var(--nanny-shadow)]">
        {reviewsQuery.isLoading ? (
          <p className="text-nanny-ink-mute text-sm m-0">Loading reviews...</p>
        ) : reviewsQuery.isError ? (
          <p className="text-nanny-rose text-sm m-0">
            {reviewsQuery.error instanceof Error ? reviewsQuery.error.message : "Unable to load reviews."}
          </p>
        ) : (
          <ReviewList
            reviews={reviewsQuery.data?.data?.items ?? []}
            emptyText="You have not reviewed any completed parent bookings yet."
          />
        )}
      </section>
    </div>
  );
}
