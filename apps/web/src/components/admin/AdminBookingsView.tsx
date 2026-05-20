"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { A } from "./tokens";
import AdminPageHeader from "./AdminPageHeader";
import AdminPagination from "./AdminPagination";
import AdminPill from "./AdminPill";
import type { PillTone } from "./AdminPill";
import { btnDanger, btnGhost, btnApprove } from "./admin-styles";
import type {
  AdminBooking,
  ListAdminBookingActionsParams,
  ListAdminBookingsParams,
} from "@/src/types/api/admin";
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
import { formatDateOnlyShort, formatShortDateTime } from "@/src/utils/format";

const colTemplate = ".95fr 1.55fr 1.35fr 1.05fr .7fr .9fr 1fr";
const PAGE_SIZE = 20;

const statusFilters: Array<{ label: string; value: BookingStatus | "" }> = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Declined", value: "declined" },
];

const thStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: colTemplate,
  padding: "14px 24px",
  borderBottom: `1px solid ${A.divider}`,
  background: A.cardWarm,
  fontSize: 11.5,
  fontWeight: 600,
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: A.inkSoft,
};

function statusTone(status: BookingStatus): PillTone {
  if (status === "approved") return "green";
  if (status === "pending") return "amber";
  if (status === "completed") return "completed";
  if (status === "cancelled" || status === "declined") return "red";
  return "neutral";
}

function canCancel(booking: AdminBooking) {
  return booking.status === "pending" || booking.status === "approved";
}

function canComplete(booking: AdminBooking) {
  return booking.status === "approved";
}

export default function AdminBookingsView() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<BookingStatus | "">("");
  const [page, setPage] = useState(1);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const params = useMemo<ListAdminBookingsParams>(
    () => ({ page, limit: PAGE_SIZE, status: status || undefined }),
    [page, status],
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

  const askReason = (action: string) => window.prompt(`Reason to ${action} this booking?`)?.trim();
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
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {statusFilters.map((item) => (
              <button
                key={item.label}
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
          </div>
        }
      />
      <div style={{ padding: "24px 40px 40px", display: "grid", gridTemplateColumns: selectedBooking ? "1fr 360px" : "1fr", gap: 18 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {actionError && (
            <p style={{ color: A.red, fontSize: 14, margin: 0 }}>
              {actionError instanceof Error ? actionError.message : "Unable to update admin bookings."}
            </p>
          )}
          <div
            style={{
              background: A.card,
              border: `1px solid ${A.border}`,
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: A.shadow,
            }}
          >
            <div style={thStyle}>
              <div>ID</div>
              <div>Nanny</div>
              <div>Parent</div>
              <div>Date</div>
              <div>Hours</div>
              <div>Total</div>
              <div>Status</div>
            </div>

            {bookingsQuery.isLoading ? (
              <div style={{ padding: 24, color: A.inkSoft }}>Loading bookings...</div>
            ) : bookings.length === 0 ? (
              <div style={{ padding: 24, color: A.inkSoft }}>No bookings found.</div>
            ) : (
              bookings.map((booking, i) => (
                <button
                  key={booking.id}
                  className="admin-table-row"
                  onClick={() => setSelectedBookingId(booking.id)}
                  style={{
                    all: "unset",
                    display: "grid",
                    gridTemplateColumns: colTemplate,
                    alignItems: "center",
                    padding: "18px 24px",
                    gap: 12,
                    borderBottom: i < bookings.length - 1 ? `1px solid ${A.borderSoft}` : "none",
                    background: selectedBookingId === booking.id ? A.cardWarm : "transparent",
                    cursor: "pointer",
                    transition: "background .15s",
                  }}
                >
                  <div style={{ fontFamily: "monospace", fontSize: 12, color: A.inkSoft, letterSpacing: ".02em" }}>
                    {booking.id.slice(0, 8)}
                  </div>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: A.ink }}>{booking.nanny_display_name}</div>
                  <div style={{ fontSize: 14, color: A.inkMid }}>{booking.parent_display_name}</div>
                  <div style={{ fontSize: 13.5, color: A.inkSoft }}>{formatDateOnlyShort(booking.date)}</div>
                  <div style={{ fontSize: 14.5, color: A.ink, fontWeight: 500 }}>{booking.duration}h</div>
                  <div style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 18, color: A.clay }}>
                    ${booking.total_amount}
                  </div>
                  <div>
                    <AdminPill tone={statusTone(booking.status)}>{booking.status}</AdminPill>
                  </div>
                </button>
              ))
            )}
          </div>
          <AdminPagination page={page} total={total} limit={PAGE_SIZE} onPageChange={setPage} />
        </div>

        {selectedBooking && (
          <aside
            style={{
              background: A.card,
              border: `1px solid ${A.border}`,
              borderRadius: 16,
              boxShadow: A.shadow,
              padding: 22,
              alignSelf: "start",
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: A.inkSoft, fontFamily: "monospace" }}>
                {selectedBooking.id}
              </div>
              <h2 style={{ margin: "8px 0 0", fontFamily: "var(--font-dm-serif), serif", fontSize: 24, color: A.ink }}>
                Booking details
              </h2>
              <div style={{ marginTop: 10 }}>
                <AdminPill tone={statusTone(selectedBooking.status)}>{selectedBooking.status}</AdminPill>
              </div>
            </div>

            <div style={{ display: "grid", gap: 10, fontSize: 14, color: A.inkMid }}>
              <div><strong style={{ color: A.ink }}>Parent:</strong> {selectedBooking.parent_display_name}</div>
              <div><strong style={{ color: A.ink }}>Nanny:</strong> {selectedBooking.nanny_display_name}</div>
              <div><strong style={{ color: A.ink }}>Date:</strong> {formatDateOnlyShort(selectedBooking.date)} at {selectedBooking.start_time}</div>
              <div><strong style={{ color: A.ink }}>Duration:</strong> {selectedBooking.duration} hours</div>
              <div><strong style={{ color: A.ink }}>Total:</strong> ${selectedBooking.total_amount}</div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                disabled={!canCancel(selectedBooking) || Boolean(selectedIsBusy)}
                onClick={() => {
                  const reason = askReason("cancel");
                  if (reason) cancelMutation.mutate({ id: selectedBooking.id, reason });
                }}
                style={{ ...btnDanger, opacity: canCancel(selectedBooking) && !selectedIsBusy ? 1 : 0.55 }}
              >
                Cancel
              </button>
              <button
                disabled={!canComplete(selectedBooking) || Boolean(selectedIsBusy)}
                onClick={() => {
                  const reason = askReason("complete");
                  if (reason) completeMutation.mutate({ id: selectedBooking.id, reason });
                }}
                style={{ ...btnApprove, opacity: canComplete(selectedBooking) && !selectedIsBusy ? 1 : 0.55 }}
              >
                Mark complete
              </button>
            </div>

            <div>
              <h3 style={{ margin: "0 0 10px", fontSize: 13, letterSpacing: ".12em", textTransform: "uppercase", color: A.inkSoft }}>
                Action history
              </h3>
              {actionsQuery.isLoading ? (
                <p style={{ margin: 0, color: A.inkSoft, fontSize: 14 }}>Loading actions...</p>
              ) : actions.length === 0 ? (
                <p style={{ margin: 0, color: A.inkSoft, fontSize: 14 }}>No admin actions yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {actions.map((action) => (
                    <div key={action.id} style={{ borderTop: `1px solid ${A.borderSoft}`, paddingTop: 10 }}>
                      <div style={{ fontSize: 13.5, color: A.ink, fontWeight: 600 }}>{action.action}</div>
                      <div style={{ fontSize: 12.5, color: A.inkSoft, marginTop: 3 }}>
                        {action.previous_status} {"->"} {action.new_status} · {formatShortDateTime(action.created_at)}
                      </div>
                      <div style={{ fontSize: 13, color: A.inkMid, marginTop: 5 }}>{action.reason}</div>
                      {action.admin_email && (
                        <div style={{ fontSize: 12, color: A.inkSoft, marginTop: 4 }}>{action.admin_email}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </>
  );
}
