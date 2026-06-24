"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { Booking } from "@/src/types/api/api";
import { getNannyBookingById, nannyBookingQueryKey } from "@/src/utils/api/bookings";
import {
  describeBookingTime,
  formatCurrency,
  formatLocation,
  formatShortDateCA,
} from "@/src/utils/format";
import NannyAvatar from "../NannyAvatar";
import NannyPill from "../NannyPill";
import type { PillTone } from "../NannyPill";

function initialsFor(name?: string) {
  return (name || "Parent")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "PA";
}

function statusTone(status: Booking["status"]): PillTone {
  if (status === "approved") return "approved";
  if (status === "completed") return "completed";
  if (status === "pending") return "pending";
  if (status === "declined") return "declined";
  return "neutral";
}

function paymentTone(status: Booking["payment_status"]): PillTone {
  if (status === "succeeded") return "paid";
  if (status === "failed" || status === "requires_payment_method") return "declined";
  if (status === "processing" || status === "requires_action" || status === "requires_confirmation") {
    return "pending";
  }
  return "neutral";
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ");
}

export default function NannyRequestDetailView({ bookingId }: { bookingId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: nannyBookingQueryKey(bookingId),
    queryFn: () => getNannyBookingById(bookingId),
  });
  const booking = data?.data as Booking | undefined;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 md:px-8 md:py-8">
      <div className="mx-auto grid max-w-[780px] gap-5">
        <div>
          <Link href="/nanny/requests" className="text-[13px] text-nanny-green underline">
            Back to requests
          </Link>
          <h1 className="font-display mt-5 mb-1 text-[30px] font-normal text-nanny-green-dk">
            Parent details
          </h1>
          <p className="m-0 text-[14px] text-nanny-ink-faint">
            Review the parent and booking details connected to this request.
          </p>
        </div>

        <section className="rounded-[22px] border border-nanny-border bg-nanny-card p-5 shadow-[var(--nanny-shadow)] sm:p-6">
          {isLoading ? (
            <p className="m-0 text-[14px] text-nanny-ink-faint">Loading parent details...</p>
          ) : error ? (
            <p className="m-0 text-[14px] text-nanny-rose">
              {error instanceof Error ? error.message : "Unable to load parent details."}
            </p>
          ) : !booking ? (
            <p className="m-0 text-[14px] text-nanny-ink-faint">Request details unavailable.</p>
          ) : (
            <div className="grid gap-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <NannyAvatar initials={initialsFor(booking.parent_display_name)} size={52} tone="cream" />
                  <div className="min-w-0">
                    <h2 className="m-0 truncate font-display text-[24px] text-nanny-green-dk">
                      {booking.parent_display_name || "Parent"}
                    </h2>
                    <p className="mt-1 mb-0 text-[13.5px] text-nanny-ink-faint">
                      {formatLocation(booking.parent_city, booking.parent_province, "Location not set")}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <NannyPill tone={statusTone(booking.status)}>{formatStatus(booking.status)}</NannyPill>
                  <NannyPill tone={paymentTone(booking.payment_status)}>
                    {booking.payment_status ? formatStatus(booking.payment_status) : "not charged"}
                  </NannyPill>
                </div>
              </div>

              <div className="grid gap-3 rounded-2xl border border-nanny-border-soft bg-nanny-card-soft p-4 text-[14px] text-nanny-ink-soft sm:grid-cols-2">
                <InfoItem label="When" value={describeBookingTime(booking)} />
                <InfoItem label="Duration" value={`${booking.duration} hours`} />
                <InfoItem label="Children" value={formatChildrenCount(booking.parent_num_children)} />
                <InfoItem label="Total" value={formatCurrency(booking.total_amount)} />
                <InfoItem label="Requested" value={formatShortDateCA(booking.created_at)} />
              </div>

              {booking.payment_failure_message && (
                <p className="m-0 rounded-2xl border border-nanny-rose/30 bg-nanny-rose-lt px-4 py-3 text-[13.5px] text-nanny-rose">
                  Payment issue: {booking.payment_failure_message}
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-[.08em] text-nanny-ink-faint">{label}</div>
      <div className="mt-1 text-nanny-ink-soft">{value}</div>
    </div>
  );
}

function formatChildrenCount(count?: number) {
  if (!count || count < 1) return "Not set";
  return count === 1 ? "1 child" : `${count} children`;
}
