"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import BookingDetailCard from "./BookingDetailCard";
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
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const notifiedBookingID = searchParams.get("booking_id");
  const [status, setStatus] = useState<BookingStatus | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
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
      if (selectedBookingId) {
        await queryClient.invalidateQueries({ queryKey: ["parent-booking", selectedBookingId] });
      }
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
  const effectiveSelectedBookingId = selectedBookingId ?? notifiedBookingID;
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

      <SectionCard
        title={compact ? "Booking History" : "Bookings"}
        titleAction={
          compact && showViewAllLink ? (
            <Link
              href="/parent/bookings"
              className="text-[13px] text-brand-text underline whitespace-nowrap"
            >
              View all
            </Link>
          ) : undefined
        }
      >
        {isLoading ? (
          <p className="text-brand-faint text-[14px] m-0">Loading bookings…</p>
        ) : error ? (
          <p className="text-[#b24a3f] text-[14px] m-0">
            {error instanceof Error ? error.message : "Unable to load bookings."}
          </p>
        ) : bookings.length === 0 ? (
          <div className={compact ? "text-left py-2" : "text-center py-7"}>
            <p className="text-[15px] m-0 text-brand-faint">No bookings match your filters.</p>
            {!compact && (
              <p className="text-[13px] mt-2 text-brand-faint">
                Try adjusting the status or date range.
              </p>
            )}
          </div>
        ) : (
          <>
            {isFetching && (
              <p className="text-[13px] text-brand-faint mt-0">Updating bookings…</p>
            )}
            {cancelError && (
              <p className="text-[13px] text-[#b24a3f] mt-0">{cancelError}</p>
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
              onSelect={setSelectedBookingId}
            />
          </>
        )}
      </SectionCard>

      {!compact && <BookingDetailCard bookingId={effectiveSelectedBookingId} />}

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
