"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { A } from "./tokens";
import AdminPageHeader from "./compositions/AdminPageHeader";
import AdminPagination from "./AdminPagination";
import AdminReasonDialog, { type AdminReasonDialogState } from "./AdminReasonDialog";
import { btnGhost } from "./compositions/admin-styles";
import AdminBookingDetailPanel from "./compositions/AdminBookingDetailPanel";
import AdminBookingsTable from "./compositions/AdminBookingsTable";
import type { ListAdminBookingActionsParams, ListAdminBookingsParams } from "@/src/types/api/admin";
import type { BookingStatus } from "@/src/types/api/api";
import {
  adminBookingActionsQueryKey,
  adminBookingQueryKey,
  adminBookingsQueryKey,
  cancelAdminBooking,
  completeAdminBooking,
  getAdminBooking,
  listAdminBookingActions,
  listAdminBookings,
} from "@/src/utils/api/admin/bookings";

const PAGE_SIZE = 20;

const statusFilters: Array<{ label: string; value: BookingStatus | "" }> = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Declined", value: "declined" },
];

const filterInputStyle: CSSProperties = {
  padding: "10px 14px",
  background: A.card,
  border: `1px solid ${A.border}`,
  borderRadius: 10,
  color: A.ink,
  minWidth: 150,
};

export default function AdminBookingsView() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<BookingStatus | "">("");
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [reasonAction, setReasonAction] = useState<AdminReasonDialogState | null>(null);
  const params = useMemo<ListAdminBookingsParams>(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: submittedSearch || undefined,
      status: status || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }),
    [dateFrom, dateTo, page, status, submittedSearch],
  );
  const actionParams = useMemo<ListAdminBookingActionsParams>(() => ({ page: 1, limit: 20 }), []);

  const bookingsQuery = useQuery({
    queryKey: adminBookingsQueryKey(params),
    queryFn: () => listAdminBookings(params),
  });
  const bookings = bookingsQuery.data?.data?.items ?? [];
  const total = bookingsQuery.data?.data?.total ?? 0;
  const fallbackSelected = bookings.find((booking) => booking.id === selectedBookingId);

  const detailQuery = useQuery({
    queryKey: selectedBookingId ? adminBookingQueryKey(selectedBookingId) : ["admin", "booking", "none"],
    queryFn: () => getAdminBooking(selectedBookingId as string),
    enabled: Boolean(selectedBookingId),
  });
  const selectedBooking = detailQuery.data?.data ?? fallbackSelected ?? null;

  const actionsQuery = useQuery({
    queryKey: selectedBookingId
      ? adminBookingActionsQueryKey(selectedBookingId, actionParams)
      : ["admin", "booking-actions", "none"],
    queryFn: () => listAdminBookingActions(selectedBookingId as string, actionParams),
    enabled: Boolean(selectedBookingId),
  });
  const actions = actionsQuery.data?.data?.items ?? [];

  const invalidateBooking = async (bookingId: string) => {
    await queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
    await queryClient.invalidateQueries({ queryKey: adminBookingQueryKey(bookingId) });
    await queryClient.invalidateQueries({ queryKey: ["admin", "booking-actions", bookingId] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "conversations"] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "nanny"] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "parent"] });
  };

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      cancelAdminBooking(id, { reason }),
    onSuccess: async (_data, variables) => invalidateBooking(variables.id),
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      completeAdminBooking(id, { reason }),
    onSuccess: async (_data, variables) => invalidateBooking(variables.id),
  });

  const actionError =
    bookingsQuery.error || detailQuery.error || actionsQuery.error || cancelMutation.error || completeMutation.error;
  const selectedIsBusy =
    selectedBooking &&
    ((cancelMutation.isPending && cancelMutation.variables?.id === selectedBooking.id) ||
      (completeMutation.isPending && completeMutation.variables?.id === selectedBooking.id));

  return (
    <>
      <AdminPageHeader
        title="Bookings"
        subtitle={`${total} bookings found`}
        right={
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setPage(1);
              setSubmittedSearch(search.trim());
              setSelectedBookingId(null);
            }}
            style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end", maxWidth: 760 }}
          >
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search bookings..."
              style={filterInputStyle}
            />
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => {
                setPage(1);
                setDateFrom(event.target.value);
                setSelectedBookingId(null);
              }}
              style={filterInputStyle}
              aria-label="Booking date from"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(event) => {
                setPage(1);
                setDateTo(event.target.value);
                setSelectedBookingId(null);
              }}
              style={filterInputStyle}
              aria-label="Booking date to"
            />
            <button type="submit" style={btnGhost}>Search</button>
            {statusFilters.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setPage(1);
                  setStatus(item.value);
                  setSelectedBookingId(null);
                }}
                style={{
                  ...btnGhost,
                  borderColor: status === item.value ? A.clay : A.border,
                  color: status === item.value ? A.clay : A.inkMid,
                }}
              >
                {item.label}
              </button>
            ))}
          </form>
        }
      />
      <div style={{ padding: "24px 40px 40px", display: "grid", gridTemplateColumns: selectedBooking ? "1fr 360px" : "1fr", gap: 18 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {actionError && (
            <p style={{ color: A.red, fontSize: 14, margin: 0 }}>
              {actionError instanceof Error ? actionError.message : "Unable to update admin bookings."}
            </p>
          )}
          <AdminBookingsTable
            bookings={bookings}
            isLoading={bookingsQuery.isLoading}
            selectedBookingId={selectedBookingId}
            onSelect={setSelectedBookingId}
          />
          <AdminPagination page={page} total={total} limit={PAGE_SIZE} onPageChange={setPage} />
        </div>

        {selectedBooking && (
          <AdminBookingDetailPanel
            booking={selectedBooking}
            actions={actions}
            isLoadingActions={actionsQuery.isLoading}
            isBusy={Boolean(selectedIsBusy)}
            onCancel={() => {
              setReasonAction({
                title: "Cancel booking",
                description: "This will force-cancel the booking and notify the participants. A reason is required for the admin audit trail.",
                submitLabel: "Cancel booking",
                tone: "danger",
                onSubmit: (reason) => {
                  cancelMutation.mutate({ id: selectedBooking.id, reason });
                  setReasonAction(null);
                },
              });
            }}
            onComplete={() => {
              setReasonAction({
                title: "Complete booking",
                description: "This will mark the booking as completed. A reason is required for the admin audit trail.",
                submitLabel: "Mark complete",
                tone: "approve",
                onSubmit: (reason) => {
                  completeMutation.mutate({ id: selectedBooking.id, reason });
                  setReasonAction(null);
                },
              });
            }}
          />
        )}
      </div>
      <AdminReasonDialog
        action={reasonAction}
        isSubmitting={cancelMutation.isPending || completeMutation.isPending}
        onClose={() => setReasonAction(null)}
      />
    </>
  );
}
