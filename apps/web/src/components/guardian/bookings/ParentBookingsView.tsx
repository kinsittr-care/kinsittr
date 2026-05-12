"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { BookingStatus, ListBookingsParams } from "@/src/types/api/api";
import {
  cancelParentBooking,
  listParentBookings,
  parentBookingsQueryKey,
} from "@/src/utils/bookings";
import Avatar from "../dashboard/Avatar";
import SectionCard from "../profile/SectionCard";
import BookingDetailCard from "./BookingDetailCard";
import BookingStatusBadge from "./BookingStatusBadge";
import {
  describeBookingTime,
  formatBookingTotal,
  getBookingInitials,
} from "./booking-helpers";

const filterLabelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: "var(--muted)",
  display: "block",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1.5px solid var(--border)",
  borderRadius: 9,
  padding: "11px 14px",
  fontSize: 14,
  outline: "none",
  background: "var(--bg-warm)",
  color: "var(--brand-text)",
  fontFamily: "inherit",
};

interface ParentBookingsViewProps {
  compact?: boolean;
  showViewAllLink?: boolean;
}

export default function ParentBookingsView({
  compact = false,
  showViewAllLink = true,
}: ParentBookingsViewProps) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<BookingStatus | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

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

  const bookings = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;
  const currentPage = data?.data?.page ?? page;
  const currentLimit = data?.data?.limit ?? queryParams.limit ?? 10;
  const totalPages = Math.max(1, Math.ceil(total / currentLimit));
  const cancelError = cancelMutation.error instanceof Error
    ? cancelMutation.error.message
    : null;

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
    <div style={{ display: "grid", gap: 20 }}>
      {!compact && (
        <SectionCard title="Filters">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 14,
            }}
          >
            <div>
              <label style={filterLabelStyle}>Status</label>
              <select
                value={status}
                onChange={(event) => handleStatusChange(event.target.value as BookingStatus | "")}
                style={inputStyle}
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="declined">Declined</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label style={filterLabelStyle}>From</label>
              <input type="date" value={dateFrom} onChange={(event) => handleDateFromChange(event.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={filterLabelStyle}>To</label>
              <input type="date" value={dateTo} onChange={(event) => handleDateToChange(event.target.value)} style={inputStyle} />
            </div>
          </div>
        </SectionCard>
      )}

      <SectionCard
        title={compact ? "Booking History" : "Bookings"}
        titleAction={
          compact && showViewAllLink ? (
            <Link
              href="/parent/bookings"
              style={{
                fontSize: 13,
                color: "var(--brand-text)",
                textDecoration: "underline",
                whiteSpace: "nowrap",
              }}
            >
              View all
            </Link>
          ) : undefined
        }
      >
        {isLoading ? (
          <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>Loading bookings…</p>
        ) : error ? (
          <p style={{ color: "#b24a3f", fontSize: 14, margin: 0 }}>
            {error instanceof Error ? error.message : "Unable to load bookings."}
          </p>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: compact ? "left" : "center", padding: compact ? "8px 0" : "28px 0" }}>
            <p style={{ fontSize: 15, margin: 0, color: "var(--muted)" }}>No bookings match your filters.</p>
            {!compact && (
              <p style={{ fontSize: 13, marginTop: 8, color: "var(--faint)" }}>
                Try adjusting the status or date range.
              </p>
            )}
          </div>
        ) : (
          <>
            {isFetching && (
              <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 0 }}>Updating bookings…</p>
            )}
            {cancelError && (
              <p style={{ fontSize: 13, color: "#b24a3f", marginTop: 0 }}>{cancelError}</p>
            )}
            {bookings.map((booking, index) => (
              <div
                key={booking.id}
                className="flex flex-col md:flex-row md:items-center gap-4"
                style={{
                  padding: "14px 0",
                  borderBottom: index === bookings.length - 1 ? "none" : "1px solid var(--border)",
                }}
              >
                <div
                  className="flex items-center gap-[14px]"
                  style={{ flex: 1, cursor: !compact ? "pointer" : "default" }}
                  onClick={!compact ? () => setSelectedBookingId(booking.id) : undefined}
                >
                  <Avatar initials={getBookingInitials(booking.nanny_display_name)} size={40} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {booking.nanny_display_name ?? "Selected nanny"}
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--faint)", marginTop: 1 }}>
                      {describeBookingTime(booking)}
                    </div>
                  </div>
                </div>
                <div
                  className="flex flex-col md:flex-row md:items-center gap-3"
                  style={{ marginLeft: compact ? 0 : "auto" }}
                >
                  <div style={{ textAlign: compact ? "left" : "right" }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{formatBookingTotal(booking.total_amount)}</div>
                    <BookingStatusBadge status={booking.status} />
                  </div>
                  {!compact && (
                    <div className="flex gap-2">
                      <button
                        className="btn-outline"
                        style={{ padding: "8px 14px", fontSize: 13 }}
                        onClick={() => setSelectedBookingId(booking.id)}
                      >
                        View details
                      </button>
                      {booking.status === "pending" && (
                        <button
                          style={{
                            padding: "8px 14px",
                            fontSize: 13,
                            borderRadius: 10,
                            background: "#fff",
                            color: "#c0392b",
                            border: "1.5px solid #f0d0d0",
                            cursor: cancelMutation.isPending ? "not-allowed" : "pointer",
                            fontFamily: "inherit",
                          }}
                          disabled={cancelMutation.isPending}
                          onClick={() => cancelMutation.mutate(booking.id)}
                        >
                          {cancelMutation.isPending ? "Cancelling..." : "Cancel"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {!compact && totalPages > 1 ? (
              <div className="flex items-center justify-between" style={{ marginTop: 18, gap: 12 }}>
                <button
                  className="btn-outline"
                  style={{ padding: "10px 16px", fontSize: 13 }}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="btn-outline"
                  style={{ padding: "10px 16px", fontSize: 13 }}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </button>
              </div>
            ) : null}
          </>
        )}
      </SectionCard>

      {!compact && <BookingDetailCard bookingId={selectedBookingId} />}
    </div>
  );
}
