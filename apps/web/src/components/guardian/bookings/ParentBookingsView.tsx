"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { BookingStatus, ListBookingsParams } from "@/src/types/api/api";
import {
  cancelParentBooking,
  listParentBookings,
  parentBookingsQueryKey,
} from "@/src/utils/api/bookings";
import ReviewDialog from "@/src/components/shared/ReviewDialog";
import {
  createParentReview,
  findParentReviewedBookingIds,
  parentReviewedBookingIdsQueryKey,
  publicNannyReviewsQueryKey,
} from "@/src/utils/api/reviews";
import SectionCard from "../profile/SectionCard";
import ParentBookingsFilters from "./ParentBookingsFilters";
import ParentBookingsList from "./ParentBookingsList";

interface ParentBookingsViewProps {
  compact?: boolean;
  showViewAllLink?: boolean;
}

export default function ParentBookingsView({
  compact = false,
  showViewAllLink = true,
}: ParentBookingsViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const notifiedBookingID = searchParams.get("booking_id");
  const [status, setStatus] = useState<BookingStatus | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);

  const queryParams = useMemo<ListBookingsParams>(
    () => ({
      page,
      limit: compact ? 4 : 10,
      status: status || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }),
    [compact, dateFrom, dateTo, page, status],
  );

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: parentBookingsQueryKey(queryParams),
    queryFn: async () => listParentBookings(queryParams),
    placeholderData: (previousData) => previousData,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelParentBooking,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["parent-bookings"] });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({
      bookingId,
      rating,
      comment,
    }: {
      bookingId: string;
      rating: number;
      comment: string;
    }) => createParentReview(bookingId, { rating, comment }),
    onSuccess: async (response, variables) => {
      setReviewBookingId(null);
      await queryClient.invalidateQueries({ queryKey: ["parent-reviews"] });
      await queryClient.invalidateQueries({ queryKey: ["parent-reviewed-booking-ids"] });
      await queryClient.invalidateQueries({ queryKey: ["parent-bookings"] });
      await queryClient.invalidateQueries({ queryKey: ["parent-booking", variables.bookingId] });
      if (response.data?.nanny_profile_id) {
        await queryClient.invalidateQueries({
          queryKey: publicNannyReviewsQueryKey(response.data.nanny_profile_id),
        });
      }
    },
  });

  const bookings = useMemo(() => data?.data?.items ?? [], [data?.data?.items]);
  const total = data?.data?.total ?? 0;
  const currentPage = data?.data?.page ?? page;
  const currentLimit = data?.data?.limit ?? queryParams.limit ?? 10;
  const totalPages = Math.max(1, Math.ceil(total / currentLimit));
  const cancelError = cancelMutation.error instanceof Error
    ? cancelMutation.error.message
    : null;
  const completedBookingIds = useMemo(
    () => bookings.filter((booking) => booking.status === "completed").map((booking) => booking.id),
    [bookings],
  );
  const reviewedBookingIdsQuery = useQuery({
    queryKey: parentReviewedBookingIdsQueryKey(completedBookingIds),
    queryFn: async () => findParentReviewedBookingIds(completedBookingIds),
    enabled: completedBookingIds.length > 0,
  });
  const reviewedBookingIds = reviewedBookingIdsQuery.data ?? new Set<string>();
  const reviewBooking = bookings.find((booking) => booking.id === reviewBookingId) ?? null;
  const reviewError = reviewMutation.error instanceof Error ? reviewMutation.error.message : null;

  useEffect(() => {
    if (!compact && notifiedBookingID) {
      router.replace(`/parent/bookings/${notifiedBookingID}`);
    }
  }, [compact, notifiedBookingID, router]);

  const handleStatusChange = (value: BookingStatus | "") => {
    setStatus(value);
    setPage(1);
  };

  const handleDateFromChange = (value: string) => {
    setDateFrom(value);
    setPage(1);
  };

  const handleDateToChange = (value: string) => {
    setDateTo(value);
    setPage(1);
  };

  const bookingsContent = (
    <>
      {isLoading ? (
        <p className="m-0 text-[14px] text-brand-faint">Loading bookings...</p>
      ) : error ? (
        <p className="m-0 text-[14px] text-[#b24a3f]">
          {error instanceof Error ? error.message : "Unable to load bookings."}
        </p>
      ) : bookings.length === 0 ? (
        <div className={compact ? "py-2 text-left" : "py-10 text-center"}>
          <p className="m-0 text-[15px] text-brand-faint">No bookings match your filters.</p>
          {!compact && (
            <p className="mt-2 text-[13px] text-brand-faint">
              Try adjusting the status or date range.
            </p>
          )}
        </div>
      ) : (
        <>
          {isFetching && (
            <p className="mt-0 text-[13px] text-brand-faint">Updating bookings...</p>
          )}
          {cancelError && (
            <p className="mt-0 text-[13px] text-[#b24a3f]">{cancelError}</p>
          )}
          <ParentBookingsList
            bookings={bookings}
            cancelIsPending={cancelMutation.isPending}
            compact={compact}
            currentPage={currentPage}
            reviewedBookingIds={reviewedBookingIds}
            totalPages={totalPages}
            onCancel={(bookingId) => cancelMutation.mutate(bookingId)}
            onPageChange={setPage}
            onReview={setReviewBookingId}
            onSelect={(bookingId) => router.push(`/parent/bookings/${bookingId}`)}
          />
        </>
      )}
    </>
  );

  return (
    <div className="grid gap-5">
      {!compact && (
        <ParentBookingsFilters
          dateFrom={dateFrom}
          dateTo={dateTo}
          status={status}
          onDateFromChange={handleDateFromChange}
          onDateToChange={handleDateToChange}
          onStatusChange={handleStatusChange}
        />
      )}

      {compact ? (
        <SectionCard
          title="Booking History"
          titleAction={
            showViewAllLink ? (
              <Link
                href="/parent/bookings"
                className="whitespace-nowrap text-[13px] text-brand-text underline"
              >
                View all
              </Link>
            ) : undefined
          }
        >
          {bookingsContent}
        </SectionCard>
      ) : (
        <div className="overflow-hidden rounded-[34px] border border-[#e7decf] bg-[#fffdfa] px-8 py-7 shadow-[0_18px_55px_rgba(40,30,20,.08)] max-sm:rounded-[30px] max-sm:px-5 max-sm:py-7">
          {bookingsContent}
        </div>
      )}

      <ReviewDialog
        open={!!reviewBooking}
        title={`Review ${reviewBooking?.nanny_display_name ?? "your nanny"}`}
        description="Share feedback about this completed booking. Your review will appear on the nanny's public profile unless moderated."
        submitLabel="Submit review"
        isSubmitting={reviewMutation.isPending}
        error={reviewError}
        onClose={() => {
          if (!reviewMutation.isPending) setReviewBookingId(null);
        }}
        onSubmit={(payload) => {
          if (!reviewBooking) return;
          reviewMutation.mutate({ bookingId: reviewBooking.id, ...payload });
        }}
      />
    </div>
  );
}
