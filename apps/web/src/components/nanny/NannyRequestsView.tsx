"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { Booking, BookingStatus } from "@/src/types/api/api";
import {
  approveNannyBooking,
  declineNannyBooking,
  listNannyBookings,
  nannyBookingsQueryKey,
} from "@/src/utils/api/bookings";
import { N } from "./tokens";
import BookingRequestCard from "./requests/BookingRequestCard";
import type { BookingRequest } from "./requests/BookingRequestCard";

const PAGE_SIZE = 20;

type Filter = "all" | BookingStatus;
const FILTERS: Filter[] = ["all", "pending", "approved", "declined", "cancelled"];

function getInitials(name?: string) {
  return (name || "Parent")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatTimeRange(startTime: string, duration: number) {
  const [hour, minute] = startTime.split(":").map(Number);
  const start = new Date();
  start.setHours(hour || 0, minute || 0, 0, 0);
  const end = new Date(start.getTime() + duration * 60 * 60 * 1000);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

function toBookingRequest(booking: Booking): BookingRequest {
  const parent = booking.parent_display_name || "Parent";
  return {
    id: booking.id,
    parent,
    initials: getInitials(parent),
    date: formatDate(booking.date),
    time: formatTimeRange(booking.start_time, booking.duration),
    hours: booking.duration,
    amount: `$${booking.total_amount.toFixed(0)}`,
    status: booking.status === "cancelled" ? "neutral" : booking.status,
    children: booking.parent_city
      ? `${booking.parent_city}${booking.parent_province ? `, ${booking.parent_province}` : ""}`
      : "Family details",
  };
}

export default function NannyRequestsView() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const [updatingID, setUpdatingID] = useState<string | null>(null);
  const queryParams = {
    page,
    limit: PAGE_SIZE,
    status: filter === "all" ? undefined : filter,
  };

  const bookingsQuery = useQuery({
    queryKey: nannyBookingsQueryKey(queryParams),
    queryFn: async () => listNannyBookings(queryParams),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "approve" | "decline" }) => {
      setUpdatingID(id);
      return action === "approve" ? approveNannyBooking(id) : declineNannyBooking(id);
    },
    onSettled: async () => {
      setUpdatingID(null);
      await queryClient.invalidateQueries({ queryKey: ["nanny-bookings"] });
    },
  });

  const data = bookingsQuery.data?.data;
  const visible = (data?.items ?? []).map(toBookingRequest);
  const total = data?.total ?? 0;
  const pendingCount = filter === "pending" ? total : undefined;

  return (
    <div style={{ padding: "40px 48px 80px", overflowY: "auto", flex: 1 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontFamily: "DM Serif Display, var(--font-dm-serif), serif",
            fontSize: 36,
            fontWeight: 400,
            color: N.greenDk,
            lineHeight: 1.1,
          }}
        >
          Booking Requests
        </h1>
        <p style={{ marginTop: 8, fontSize: 14.5, color: N.inkMute }}>
          {pendingCount !== undefined ? `${pendingCount} pending` : `${total} total`}
        </p>
      </div>

      {/* Filter tabs */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 24,
          background: N.cardSoft,
          border: `1px solid ${N.border}`,
          borderRadius: 12,
          padding: 4,
          alignSelf: "flex-start",
          width: "fit-content",
        }}
      >
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setPage(1);
            }}
            style={{
              padding: "8px 18px",
              borderRadius: 9,
              fontSize: 13.5,
              fontWeight: filter === f ? 600 : 500,
              color: filter === f ? N.green : N.inkMute,
              background: filter === f ? N.card : "transparent",
              border: filter === f ? `1px solid ${N.border}` : "1px solid transparent",
              boxShadow: filter === f ? N.shadow : "none",
              cursor: "pointer",
              transition: "all .15s",
              textTransform: "capitalize",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {bookingsQuery.isLoading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: N.inkFaint, fontSize: 15 }}>
            Loading requests...
          </div>
        ) : bookingsQuery.isError ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: N.rose, fontSize: 15 }}>
            {bookingsQuery.error instanceof Error ? bookingsQuery.error.message : "Unable to load requests."}
          </div>
        ) : visible.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              color: N.inkFaint,
              fontSize: 15,
            }}
          >
            No {filter} requests
          </div>
        ) : (
          visible.map((r) => (
            <BookingRequestCard
              key={r.id}
              booking={r}
              isUpdating={updatingID === r.id}
              onApprove={() => updateMutation.mutate({ id: r.id, action: "approve" })}
              onDecline={() => updateMutation.mutate({ id: r.id, action: "decline" })}
            />
          ))
        )}
      </div>

      {data && data.total > data.limit && (
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 24 }}>
          <button
            style={btnLikePagination}
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </button>
          <button
            style={btnLikePagination}
            disabled={page * data.limit >= data.total}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

const btnLikePagination = {
  padding: "9px 16px",
  background: N.card,
  color: N.inkSoft,
  border: `1px solid ${N.border}`,
  borderRadius: 10,
  fontSize: 13.5,
  fontWeight: 600,
  cursor: "pointer",
};
