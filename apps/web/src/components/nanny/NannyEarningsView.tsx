 "use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PayoutHistoryTable from "./earnings/PayoutHistoryTable";
import ConnectedAccountCard from "./earnings/ConnectedAccountCard";
import { formatCurrency } from "@/src/utils/format";
import {
  getNannyEarningsSummary,
  getNannyPayoutSettings,
  getNannyStripeStatus,
  listNannyEarnings,
  listNannyStripePayouts,
  nannyEarningsQueryKey,
  nannyEarningsSummaryQueryKey,
  nannyPayoutSettingsQueryKey,
  nannyStripePayoutsQueryKey,
  nannyStripeStatusQueryKey,
} from "@/src/utils/api/payments";

function EarningsStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="w-[min(200px,72vw)] shrink-0 md:w-auto md:shrink-0 bg-nanny-card border border-nanny-border rounded-[18px] p-5 min-h-[130px] flex flex-col shadow-(--nanny-shadow)">
      <p className="text-[11px] font-semibold tracking-widest uppercase text-nanny-ink-mute">{label}</p>
      <p className="mt-auto pt-3 font-display text-[40px] leading-none tracking-tight text-nanny-green">{value}</p>
      <p className="mt-2.5 text-[13px] text-nanny-ink-mute">{sub}</p>
    </div>
  );
}

const PAGE_SIZE = 10;

export default function NannyEarningsView() {
  const [page, setPage] = useState(1);
  const earningsParams = useMemo(() => ({ page, limit: PAGE_SIZE }), [page]);
  const summaryQuery = useQuery({
    queryKey: nannyEarningsSummaryQueryKey,
    queryFn: getNannyEarningsSummary,
  });
  const earningsQuery = useQuery({
    queryKey: nannyEarningsQueryKey(earningsParams),
    queryFn: () => listNannyEarnings(earningsParams),
  });
  const statusQuery = useQuery({
    queryKey: nannyStripeStatusQueryKey,
    queryFn: getNannyStripeStatus,
  });
  const payoutsQuery = useQuery({
    queryKey: nannyStripePayoutsQueryKey,
    queryFn: () => listNannyStripePayouts(),
    enabled: Boolean(statusQuery.data?.data?.onboarded),
  });
  const settingsQuery = useQuery({
    queryKey: nannyPayoutSettingsQueryKey,
    queryFn: getNannyPayoutSettings,
  });

  const summary = summaryQuery.data?.data;
  const earnings = earningsQuery.data?.data;
  const totalPages = Math.max(1, Math.ceil((earnings?.total ?? 0) / PAGE_SIZE));
  const error = summaryQuery.error || earningsQuery.error || statusQuery.error || payoutsQuery.error || settingsQuery.error;

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-6 pb-16 md:px-12 md:pt-10 md:pb-20">
      <div className="mb-7 md:mb-8">
        <h1 className="font-display text-[28px] md:text-[36px] font-normal text-nanny-green-dk leading-tight">
          Earnings
        </h1>
        <p className="mt-2 text-sm md:text-[14.5px] text-nanny-ink-mute">
          Completed paid bookings
        </p>
      </div>

      {error && (
        <p className="mb-4 text-sm text-nanny-rose">
          {error instanceof Error ? error.message : "Unable to load earnings."}
        </p>
      )}

      <div className="flex gap-3 overflow-x-auto pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] md:grid md:grid-cols-3 md:overflow-visible md:gap-4 mb-5">
        <EarningsStat
          label="This month"
          value={summaryQuery.isLoading ? "..." : formatCurrency(summary?.this_month_earnings ?? 0)}
          sub={`${summary?.this_month_bookings ?? 0} bookings`}
        />
        <EarningsStat
          label="Last month"
          value={summaryQuery.isLoading ? "..." : formatCurrency(summary?.last_month_earnings ?? 0)}
          sub={`${summary?.last_month_bookings ?? 0} bookings`}
        />
        <EarningsStat
          label="All time"
          value={summaryQuery.isLoading ? "..." : formatCurrency(summary?.all_time_earnings ?? 0)}
          sub={`${summary?.all_time_bookings ?? 0} bookings`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr] gap-4">
        <PayoutHistoryTable
          earnings={earnings?.items ?? []}
          isLoading={earningsQuery.isLoading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
        <ConnectedAccountCard
          status={statusQuery.data?.data}
          payouts={payoutsQuery.data?.data?.items ?? []}
          schedule={settingsQuery.data?.data?.schedule}
        />
      </div>
    </div>
  );
}
