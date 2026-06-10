"use client";

import NannyPill from "../NannyPill";
import type { NannyEarningData } from "@/src/types/api/payments";
import { formatCurrency, formatDateOnlyShort } from "@/src/utils/format";

const colTemplate = "1.8fr 0.7fr 1.3fr 1fr 0.8fr";

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
        className="hidden md:grid px-6 py-3 border-b border-nanny-border-soft text-[11px] font-semibold tracking-[.12em] uppercase text-nanny-ink-faint"
        style={{ gridTemplateColumns: colTemplate }}
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
        earnings.map((earning, i) => <EarningRow key={earning.booking_id} earning={earning} showBorder={i < earnings.length - 1} />)
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
      className="nanny-payout-row grid grid-cols-1 gap-2 md:grid-cols-none md:gap-0 items-center px-6 py-[15px] transition-[background] duration-150"
      style={{
        gridTemplateColumns: colTemplate,
        borderBottom: showBorder ? "1px solid var(--nanny-border-soft)" : "none",
      }}
    >
      <div className="text-[14.5px] font-semibold text-nanny-green-dk">{earning.parent_display_name}</div>
      <div className="text-[14px] text-nanny-ink-faint">{earning.duration}h</div>
      <div className="text-[13.5px] text-nanny-ink-faint">
        {formatDateOnlyShort(earning.date)} · {earning.start_time}
      </div>
      <div className="font-display text-[18px] text-nanny-green">
        {formatCurrency(earning.net_amount, earning.currency)}
      </div>
      <div>
        <NannyPill tone="paid">Paid</NannyPill>
      </div>
    </div>
  );
}

function EmptyRow({ message }: { message: string }) {
  return <div className="px-6 py-7 text-nanny-ink-faint text-[14px]">{message}</div>;
}
