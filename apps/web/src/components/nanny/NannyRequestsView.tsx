"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Booking, BookingStatus } from "@/src/types/api/api";
import {
  approveNannyBooking,
  completeNannyBooking,
  declineNannyBooking,
  listNannyBookings,
  nannyBookingsQueryKey,
  retryNannyBookingPayment,
} from "@/src/utils/api/bookings";
import ReviewDialog from "@/src/components/shared/ReviewDialog";
import {
  createNannyReview,
  findNannyReviewedBookingIds,
  nannyReviewedBookingIdsQueryKey,
} from "@/src/utils/api/reviews";
import { formatCurrency, formatLocation, formatTimeRange } from "@/src/utils/format";
import { cn } from "@/lib/utils";
import BookingRequestCard from "./requests/BookingRequestCard";
import type { BookingRequest } from "./requests/BookingRequestCard";

const PAGE_SIZE = 20;

type Filter = "all" | BookingStatus;
const FILTERS: Filter[] = ["all", "pending", "approved", "completed", "declined", "cancelled"];

function getInitials(name?: string) {
  return (name || "Parent")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function getRequestDateParts(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return {
    month: new Intl.DateTimeFormat("en-CA", { month: "short" }).format(date).toUpperCase(),
    day: new Intl.DateTimeFormat("en-CA", { day: "numeric" }).format(date),
    weekday: new Intl.DateTimeFormat("en-CA", { weekday: "short" }).format(date),
  };
}

function formatRequestStatus(status: BookingStatus) {
  if (status === "cancelled") return "Cancelled";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function toBookingRequest(booking: Booking): BookingRequest {
  const parent = booking.parent_display_name || "Parent";
  const dateParts = getRequestDateParts(booking.date);
  return {
    id: booking.id,
    parent,
    initials: getInitials(parent),
    dateMonth: dateParts.month,
    dateDay: dateParts.day,
    dateWeekday: dateParts.weekday,
    time: formatTimeRange(booking.start_time, booking.duration),
    hours: booking.duration,
    amount: formatCurrency(booking.total_amount),
    status: booking.status === "cancelled" ? "neutral" : booking.status,
    statusLabel: formatRequestStatus(booking.status),
    conversationId: booking.conversation_id,
    paymentStatus: booking.payment_status,
    paymentFailure: booking.payment_failure_message,
    location: formatLocation(booking.parent_city, booking.parent_province, "Family details"),
  };
}

export default function NannyRequestsView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const notifiedBookingID = searchParams.get("booking_id");
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const [updatingID, setUpdatingID] = useState<string | null>(null);
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);

  const queryParams = { page, limit: PAGE_SIZE, status: filter === "all" ? undefined : filter };
  const bookingsQuery = useQuery({
    queryKey: nannyBookingsQueryKey(queryParams),
    queryFn: async () => listNannyBookings(queryParams),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "approve" | "decline" | "complete" | "retry-payment" }) => {
      setUpdatingID(id);
      if (action === "approve") return approveNannyBooking(id);
      if (action === "decline") return declineNannyBooking(id);
      if (action === "retry-payment") return retryNannyBookingPayment(id);
      return completeNannyBooking(id);
    },
    onSettled: async () => {
      setUpdatingID(null);
      await queryClient.invalidateQueries({ queryKey: ["nanny-bookings"] });
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
    }) => createNannyReview(bookingId, { rating, comment }),
    onSuccess: async () => {
      setReviewBookingId(null);
      await queryClient.invalidateQueries({ queryKey: ["nanny-reviews"] });
      await queryClient.invalidateQueries({ queryKey: ["nanny-reviewed-booking-ids"] });
      await queryClient.invalidateQueries({ queryKey: ["nanny-bookings"] });
    },
  });

  const data = bookingsQuery.data?.data;
  const bookings = useMemo(() => data?.items ?? [], [data?.items]);
  const visible = bookings.map(toBookingRequest);
  const total = data?.total ?? 0;
  const pendingCount = filter === "pending" ? total : undefined;
  const completedBookingIds = useMemo(
    () => bookings.filter((booking) => booking.status === "completed").map((booking) => booking.id),
    [bookings],
  );
  const reviewedBookingIdsQuery = useQuery({
    queryKey: nannyReviewedBookingIdsQueryKey(completedBookingIds),
    queryFn: async () => findNannyReviewedBookingIds(completedBookingIds),
    enabled: completedBookingIds.length > 0,
  });
  const reviewedBookingIds = reviewedBookingIdsQuery.data ?? new Set<string>();
  const reviewBooking = bookings.find((booking) => booking.id === reviewBookingId) ?? null;
  const reviewError = reviewMutation.error instanceof Error ? reviewMutation.error.message : null;

  const changeFilter = (f: Filter) => { setFilter(f); setPage(1); };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[900px] mx-auto px-4 pt-6 pb-16 md:px-12 md:pt-10 md:pb-20">
      {/* Header */}
      <div className="mb-6 md:mb-7">
        <h1 className="font-display text-[28px] md:text-[36px] font-normal text-nanny-green-dk leading-tight">
          Booking Requests
        </h1>
        <p className="mt-2 text-sm md:text-[14.5px] text-nanny-ink-faint">
          {pendingCount !== undefined ? `${pendingCount} pending` : `${total} total`}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="mb-6">
        <div className="flex w-full gap-1.5 overflow-x-auto rounded-xl border border-nanny-border bg-nanny-card-soft p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:w-fit">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => changeFilter(f)}
              className={cn(
                "shrink-0 px-4 py-2 rounded-[9px] text-[13.5px] capitalize transition-all cursor-pointer",
                filter === f
                  ? "bg-nanny-card border border-nanny-border text-nanny-green font-semibold shadow-[var(--nanny-shadow)]"
                  : "text-nanny-ink-faint font-medium hover:text-nanny-ink border border-transparent"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-4">
        {updateMutation.error && (
          <p className="text-nanny-rose text-[14px] m-0">
            {updateMutation.error instanceof Error ? updateMutation.error.message : "Unable to update booking."}
          </p>
        )}
        {bookingsQuery.isLoading ? (
          <p className="text-center py-14 text-nanny-ink-faint text-[15px]">Loading requests...</p>
        ) : bookingsQuery.isError ? (
          <p className="text-center py-14 text-nanny-rose text-[15px]">
            {bookingsQuery.error instanceof Error ? bookingsQuery.error.message : "Unable to load requests."}
          </p>
        ) : visible.length === 0 ? (
          <p className="text-center py-14 text-nanny-ink-faint text-[15px] capitalize">
            No {filter} requests
          </p>
        ) : (
          visible.map((r) => (
            <BookingRequestCard
              key={r.id}
              booking={r}
              isUpdating={updatingID === r.id}
              isHighlighted={r.id === notifiedBookingID}
              onApprove={() => updateMutation.mutate({ id: r.id, action: "approve" })}
              onDecline={() => updateMutation.mutate({ id: r.id, action: "decline" })}
              onComplete={() => updateMutation.mutate({ id: r.id, action: "complete" })}
              onMessageParent={() => {
                if (r.conversationId) router.push(`/nanny/messages?conversation_id=${r.conversationId}`);
              }}
              onRetryPayment={() => updateMutation.mutate({ id: r.id, action: "retry-payment" })}
              onReview={() => setReviewBookingId(r.id)}
              onViewDetails={() => router.push(`/nanny/requests/${r.id}`)}
              isReviewed={reviewedBookingIds.has(r.id)}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {data && data.total > data.limit && (
        <div className="flex justify-center gap-2.5 mt-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 bg-nanny-card border border-nanny-border rounded-[10px] text-[13.5px] font-semibold text-nanny-ink-faint disabled:opacity-40 cursor-pointer hover:bg-nanny-card-soft transition-colors"
          >
            Previous
          </button>
          <button
            disabled={page * data.limit >= data.total}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-nanny-card border border-nanny-border rounded-[10px] text-[13.5px] font-semibold text-nanny-ink-faint disabled:opacity-40 cursor-pointer hover:bg-nanny-card-soft transition-colors"
          >
            Next
          </button>
        </div>
      )}

      <ReviewDialog
        open={!!reviewBooking}
        title={`Review ${reviewBooking?.parent_display_name ?? "this parent"}`}
        description="Share feedback about this completed booking. The parent cannot edit or delete the review after it is submitted."
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
    </div>
  );
}
