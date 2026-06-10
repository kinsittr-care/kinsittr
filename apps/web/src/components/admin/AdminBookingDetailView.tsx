"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import AdminPageHeader from "./compositions/AdminPageHeader";
import AdminBookingDetailPanel from "./compositions/AdminBookingDetailPanel";
import AdminReasonDialog, { type AdminReasonDialogState } from "./AdminReasonDialog";
import { btnGhostCls } from "./compositions/admin-styles";
import type { ListAdminBookingActionsParams } from "@/src/types/api/admin";
import {
  adminBookingActionsQueryKey,
  adminBookingQueryKey,
  cancelAdminBooking,
  completeAdminBooking,
  getAdminBooking,
  listAdminBookingActions,
} from "@/src/utils/api/admin/bookings";

export default function AdminBookingDetailView({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [reasonAction, setReasonAction] = useState<AdminReasonDialogState | null>(null);
  const actionParams = useMemo<ListAdminBookingActionsParams>(() => ({ page: 1, limit: 20 }), []);

  const detailQuery = useQuery({
    queryKey: adminBookingQueryKey(bookingId),
    queryFn: () => getAdminBooking(bookingId),
  });
  const actionsQuery = useQuery({
    queryKey: adminBookingActionsQueryKey(bookingId, actionParams),
    queryFn: () => listAdminBookingActions(bookingId, actionParams),
  });

  const invalidateBooking = async () => {
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
    onSuccess: invalidateBooking,
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      completeAdminBooking(id, { reason }),
    onSuccess: invalidateBooking,
  });

  const booking = detailQuery.data?.data ?? null;
  const actions = actionsQuery.data?.data?.items ?? [];
  const actionError = detailQuery.error || actionsQuery.error || cancelMutation.error || completeMutation.error;
  const selectedIsBusy =
    booking &&
    ((cancelMutation.isPending && cancelMutation.variables?.id === booking.id) ||
      (completeMutation.isPending && completeMutation.variables?.id === booking.id));

  return (
    <>
      <AdminPageHeader
        title="Booking details"
        subtitle="Booking status, payment state, participants, and admin action history."
        right={
          <button type="button" className={btnGhostCls} onClick={() => router.push("/admin/bookings")}>
            Back to all bookings
          </button>
        }
      />
      <div className="px-4 py-5 md:px-10 md:py-6">
        {actionError && (
          <p className="mb-4 text-[14px] text-admin-red">
            {actionError instanceof Error ? actionError.message : "Unable to load booking details."}
          </p>
        )}
        {detailQuery.isLoading ? (
          <div className="rounded-2xl border border-admin-border bg-admin-card p-6 text-admin-ink-soft shadow-[var(--admin-shadow)]">
            Loading booking details...
          </div>
        ) : booking ? (
          <AdminBookingDetailPanel
            booking={booking}
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
                  cancelMutation.mutate({ id: booking.id, reason });
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
                  completeMutation.mutate({ id: booking.id, reason });
                  setReasonAction(null);
                },
              });
            }}
          />
        ) : (
          <div className="rounded-2xl border border-admin-border bg-admin-card p-6 text-admin-ink-soft shadow-[var(--admin-shadow)]">
            Booking not found.
          </div>
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
