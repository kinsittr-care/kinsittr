"use client";

import { N } from "../tokens";
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
    <div
      style={{
        background: N.card,
        border: `1px solid ${N.border}`,
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: N.shadow,
      }}
    >
      <div style={{ padding: "18px 24px 14px", borderBottom: `1px solid ${N.borderSoft}` }}>
        <h2 style={{ fontFamily: "DM Serif Display, var(--font-dm-serif), serif", fontSize: 20, fontWeight: 400, color: N.greenDk }}>
          Earnings history
        </h2>
      </div>

      <div
        className="hidden md:grid"
        style={{
          gridTemplateColumns: colTemplate,
          padding: "12px 24px",
          borderBottom: `1px solid ${N.borderSoft}`,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: ".12em",
          textTransform: "uppercase",
          color: N.inkFaint,
        }}
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
        <div className="flex items-center justify-between gap-3 px-6 py-4" style={{ borderTop: `1px solid ${N.borderSoft}` }}>
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(Math.max(1, page - 1))}
            className="rounded-[10px] border border-nanny-border bg-nanny-card px-4 py-2 text-[13px] font-semibold text-nanny-ink-mute disabled:opacity-40"
          >
            Previous
          </button>
          <span style={{ color: N.inkMute, fontSize: 13 }}>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            className="rounded-[10px] border border-nanny-border bg-nanny-card px-4 py-2 text-[13px] font-semibold text-nanny-ink-mute disabled:opacity-40"
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
      className="nanny-payout-row grid grid-cols-1 gap-2 md:grid-cols-none md:gap-0"
      style={{
        gridTemplateColumns: colTemplate,
        alignItems: "center",
        padding: "15px 24px",
        borderBottom: showBorder ? `1px solid ${N.borderSoft}` : "none",
        transition: "background .15s",
      }}
    >
      <div style={{ fontSize: 14.5, fontWeight: 600, color: N.greenDk }}>{earning.parent_display_name}</div>
      <div style={{ fontSize: 14, color: N.inkMute }}>{earning.duration}h</div>
      <div style={{ fontSize: 13.5, color: N.inkMute }}>
        {formatDateOnlyShort(earning.date)} · {earning.start_time}
      </div>
      <div style={{ fontFamily: "DM Serif Display, var(--font-dm-serif), serif", fontSize: 18, color: N.green }}>
        {formatCurrency(earning.net_amount, earning.currency)}
      </div>
      <div>
        <NannyPill tone="paid">Paid</NannyPill>
      </div>
    </div>
  );
}

function EmptyRow({ message }: { message: string }) {
  return <div style={{ padding: "28px 24px", color: N.inkFaint, fontSize: 14 }}>{message}</div>;
}
