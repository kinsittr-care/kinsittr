"use client";

import NannyPill from "../NannyPill";
import type { NannyEarningData } from "@/src/types/api/payments";
import { formatCurrency, formatDateOnlyShort } from "@/src/utils/format";

export default function PayoutHistoryTable({
  earnings,
  isLoading,
  page,
  totalPages,
  onPageChange,
}: {
  earnings: NannyEarningData[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="bg-nanny-card border border-nanny-border rounded-[18px] overflow-hidden shadow-[var(--nanny-shadow)]">
      <div className="px-6 pt-[18px] pb-[14px] border-b border-nanny-border-soft">
        <h2 className="font-display text-[20px] font-normal text-nanny-green-dk">
          Earnings history
        </h2>
      </div>

      <div
        className="hidden xl:grid xl:grid-cols-[1.8fr_0.7fr_1.3fr_1fr_0.8fr] px-6 py-3 border-b border-nanny-border-soft text-[11px] font-semibold tracking-[.12em] uppercase text-nanny-ink-faint"
      >
        <div>Parent</div>
        <div>Hours</div>
        <div>Date</div>
        <div>Amount</div>
        <div>Status</div>
      </div>

      {isLoading ? (
        <EmptyRow message="Loading earnings..." />
      ) : earnings.length === 0 ? (
        <EmptyRow message="No completed paid bookings yet." />
      ) : (
        <div className="flex flex-col gap-3 p-3 xl:block xl:p-0">
          {earnings.map((earning, i) => (
            <EarningRow key={earning.booking_id} earning={earning} showBorder={i < earnings.length - 1} />
          ))}
        </div>
      )}

      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-nanny-border-soft">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(Math.max(1, page - 1))}
            className="rounded-[10px] border border-nanny-border bg-nanny-card px-4 py-2 text-[13px] font-semibold text-nanny-ink-faint disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-[13px] text-nanny-ink-faint">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            className="rounded-[10px] border border-nanny-border bg-nanny-card px-4 py-2 text-[13px] font-semibold text-nanny-ink-faint disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function EarningRow({ earning, showBorder }: { earning: NannyEarningData; showBorder: boolean }) {
  return (
    <div
      className="nanny-payout-row grid grid-cols-1 gap-3 rounded-2xl border border-nanny-border-soft bg-nanny-card-soft px-4 py-4 transition-[background] duration-150 xl:grid-cols-[1.8fr_0.7fr_1.3fr_1fr_0.8fr] xl:gap-0 xl:items-center xl:rounded-none xl:border-0 xl:bg-transparent xl:px-6 xl:py-[15px]"
      style={{
        borderBottom: showBorder ? "1px solid var(--nanny-border-soft)" : "none",
      }}
    >
      <div className="text-[14.5px] font-semibold text-nanny-green-dk">
        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[.08em] text-nanny-ink-faint xl:hidden">Parent</span>
        {earning.parent_display_name}
      </div>
      <div className="text-[14px] text-nanny-ink-faint">
        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[.08em] xl:hidden">Hours</span>
        {earning.duration}h
      </div>
      <div className="text-[13.5px] text-nanny-ink-faint">
        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[.08em] xl:hidden">Date</span>
        {formatDateOnlyShort(earning.date)} · {earning.start_time}
      </div>
      <div className="font-display text-[18px] text-nanny-green">
        <span className="mb-1 block font-sans text-[11px] font-semibold uppercase tracking-[.08em] text-nanny-ink-faint xl:hidden">Amount</span>
        {formatCurrency(earning.net_amount, earning.currency)}
      </div>
      <div className="flex items-center justify-between gap-3 xl:block">
        <span className="text-[11px] font-semibold uppercase tracking-[.08em] text-nanny-ink-faint xl:hidden">Status</span>
        <NannyPill tone="paid">Paid</NannyPill>
      </div>
    </div>
  );
}

function EmptyRow({ message }: { message: string }) {
  return <div className="px-6 py-7 text-nanny-ink-faint text-[14px]">{message}</div>;
}
