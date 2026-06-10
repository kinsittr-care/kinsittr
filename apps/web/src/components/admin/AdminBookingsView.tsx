"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import AdminPageHeader from "./compositions/AdminPageHeader";
import AdminPagination from "./AdminPagination";
import { btnGhostCls } from "./compositions/admin-styles";
import { cn } from "@/lib/utils";
import AdminBookingsTable from "./compositions/AdminBookingsTable";
import type { ListAdminBookingsParams } from "@/src/types/api/admin";
import type { BookingStatus } from "@/src/types/api/api";
import {
  adminBookingsQueryKey,
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

export default function AdminBookingsView() {
  const router = useRouter();
  const [status, setStatus] = useState<BookingStatus | "">("");
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
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

  const bookingsQuery = useQuery({
    queryKey: adminBookingsQueryKey(params),
    queryFn: () => listAdminBookings(params),
  });
  const bookings = bookingsQuery.data?.data?.items ?? [];
  const total = bookingsQuery.data?.data?.total ?? 0;

  const actionError = bookingsQuery.error;

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
            }}
            className="flex w-full max-w-[760px] flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end"
          >
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search bookings..."
              className="min-w-0 rounded-[10px] border border-admin-border bg-admin-card px-[14px] py-[10px] text-admin-ink sm:min-w-[150px]"
            />
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <input
                type="date"
                value={dateFrom}
                onChange={(event) => {
                  setPage(1);
                  setDateFrom(event.target.value);
                }}
                className="min-w-0 rounded-[10px] border border-admin-border bg-admin-card px-[14px] py-[10px] text-admin-ink sm:min-w-[150px]"
                aria-label="Booking date from"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(event) => {
                  setPage(1);
                  setDateTo(event.target.value);
                }}
                className="min-w-0 rounded-[10px] border border-admin-border bg-admin-card px-[14px] py-[10px] text-admin-ink sm:min-w-[150px]"
                aria-label="Booking date to"
              />
            </div>
            <button type="submit" className={btnGhostCls}>Search</button>
            <select
              value={status}
              onChange={(event) => {
                setPage(1);
                setStatus(event.target.value as BookingStatus | "");
              }}
              className="rounded-[10px] border border-admin-border bg-admin-card px-[14px] py-[10px] text-admin-ink lg:hidden"
              aria-label="Booking status"
            >
              {statusFilters.map((item) => (
                <option key={item.label} value={item.value}>{item.label}</option>
              ))}
            </select>
            <div className="hidden flex-wrap justify-end gap-2 lg:flex">
              {statusFilters.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setPage(1);
                    setStatus(item.value);
                  }}
                  className={cn(btnGhostCls, status === item.value && "border-admin-clay text-admin-clay")}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </form>
        }
      />
      <div className="grid gap-[18px] px-4 py-5 md:px-10 md:py-6">
        <div className="flex flex-col gap-[14px]">
          {actionError && (
            <p className="text-admin-red text-[14px] m-0">
              {actionError instanceof Error ? actionError.message : "Unable to update admin bookings."}
            </p>
          )}
          <AdminBookingsTable
            bookings={bookings}
            isLoading={bookingsQuery.isLoading}
            selectedBookingId={null}
            onSelect={(bookingId) => router.push(`/admin/bookings/${bookingId}`)}
          />
          <AdminPagination page={page} total={total} limit={PAGE_SIZE} onPageChange={setPage} />
        </div>
      </div>
    </>
  );
}
