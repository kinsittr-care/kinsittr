"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminPageHeader from "./compositions/AdminPageHeader";
import AnalyticsMetricTiles from "./analytics/AnalyticsMetricTiles";
import AnalyticsCityBars from "./analytics/AnalyticsCityBars";
import AnalyticsKeyMetrics from "./analytics/AnalyticsKeyMetrics";
import { btnGhostCls } from "./compositions/admin-styles";
import { cn } from "@/lib/utils";
import type { AdminAnalyticsBucket, AdminAnalyticsData, AdminAnalyticsParams } from "@/src/types/api/admin";
import { adminAnalyticsQueryKey, getAdminAnalytics } from "@/src/utils/api/admin/analytics";
import { formatCurrency, formatDateParam, formatLocation, formatNumber, formatShortDate } from "@/src/utils/format";

type RangeKey = "30d" | "90d" | "year";

const rangeConfig: Record<RangeKey, { label: string; days: number; bucket: AdminAnalyticsBucket }> = {
  "30d": { label: "Last 30 days", days: 30, bucket: "day" },
  "90d": { label: "Last 90 days", days: 90, bucket: "week" },
  year: { label: "Last year", days: 365, bucket: "month" },
};

function subtractDays(value: Date, days: number) {
  const next = new Date(value);
  next.setDate(next.getDate() - days);
  return next;
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function analyticsMetrics(data?: AdminAnalyticsData) {
  return [
    {
      label: "Total Revenue",
      value: formatCurrency(data?.total_revenue ?? 0),
      sub: "Completed booking revenue",
      tone: "clay" as const,
    },
    {
      label: "Platform Fee",
      value: formatCurrency(data?.platform_fee ?? 0),
      sub: `${formatPercent(data?.platform_fee_rate ?? 0)} take rate`,
      tone: "green" as const,
    },
    {
      label: "Active Bookings",
      value: formatNumber(data?.active_bookings ?? 0),
      sub: `${formatNumber(data?.bookings_this_week ?? 0)} this week`,
      tone: "plum" as const,
    },
    {
      label: "Verified Nannies",
      value: formatNumber(data?.verified_nannies ?? 0),
      sub: `${formatNumber(data?.pending_nannies ?? 0)} pending review`,
      tone: "amber" as const,
    },
  ];
}

function keyMetrics(data?: AdminAnalyticsData) {
  const completedBookings = data?.time_series.reduce((sum, item) => sum + item.bookings_count, 0) ?? 0;
  const newParents = data?.registration_trends.reduce((sum, item) => sum + item.parent_count, 0) ?? 0;
  const newNannies = data?.registration_trends.reduce((sum, item) => sum + item.nanny_count, 0) ?? 0;

  return [
    { label: "Avg. booking value", value: formatCurrency(data?.average_booking_value ?? 0), tone: "clay" as const },
    { label: "Completed bookings", value: formatNumber(completedBookings), tone: "green" as const },
    { label: "New parent signups", value: formatNumber(newParents), tone: "ink" as const },
    { label: "New nanny signups", value: formatNumber(newNannies), tone: "amber" as const },
  ];
}

export default function AnalyticsView() {
  const [range, setRange] = useState<RangeKey>("30d");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [bucket, setBucket] = useState<AdminAnalyticsBucket | "">("");
  const activeRange = rangeConfig[range];
  const params = useMemo<AdminAnalyticsParams>(() => {
    const now = new Date();
    const fallbackFrom = formatDateParam(subtractDays(now, activeRange.days));
    const fallbackTo = formatDateParam(now);
    return {
      date_from: dateFrom || fallbackFrom,
      date_to: dateTo || fallbackTo,
      bucket: bucket || activeRange.bucket,
      city_limit: 10,
      top_nannies_limit: 5,
    };
  }, [activeRange, bucket, dateFrom, dateTo]);

  const analyticsQuery = useQuery({
    queryKey: adminAnalyticsQueryKey(params),
    queryFn: () => getAdminAnalytics(params),
  });
  const analytics = analyticsQuery.data?.data;
  const latestSeries = analytics?.time_series.slice(-8) ?? [];
  const maxRevenue = Math.max(...latestSeries.map((item) => item.revenue), 0);

  return (
    <>
      <AdminPageHeader
        title="Analytics"
        subtitle={`${formatShortDate(params.date_from ?? "")} - ${formatShortDate(params.date_to ?? "")} · Canada`}
        right={
          <div className="flex gap-[10px] flex-wrap justify-end">
            {(Object.keys(rangeConfig) as RangeKey[]).map((key) => (
              <button
                key={key}
                className={cn(btnGhostCls, range === key && "bg-admin-card-warm border-admin-clay text-admin-clay")}
                onClick={() => {
                  setRange(key);
                  setDateFrom("");
                  setDateTo("");
                  setBucket("");
                }}
              >
                {rangeConfig[key].label}
              </button>
            ))}
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="px-3 py-[10px] bg-admin-card border border-admin-border rounded-[10px] text-admin-ink"
              aria-label="Analytics date from"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="px-3 py-[10px] bg-admin-card border border-admin-border rounded-[10px] text-admin-ink"
              aria-label="Analytics date to"
            />
            <select
              value={bucket}
              onChange={(event) => setBucket(event.target.value as AdminAnalyticsBucket | "")}
              className="px-3 py-[10px] bg-admin-card border border-admin-border rounded-[10px] text-admin-ink"
              aria-label="Analytics bucket"
            >
              <option value="">Auto bucket</option>
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </select>
            <button className={btnGhostCls} onClick={() => analyticsQuery.refetch()}>
              Refresh
            </button>
          </div>
        }
      />
      <div className="px-10 pt-6 pb-10 flex flex-col gap-[18px]">
        {analyticsQuery.isError && (
          <div className="bg-[#fff4ea] border border-[#f0c8a8] rounded-[14px] text-[#9a5528] px-[14px] py-3 text-[13px]">
            {analyticsQuery.error instanceof Error
              ? analyticsQuery.error.message
              : "Unable to load analytics."}
          </div>
        )}
        <AnalyticsMetricTiles metrics={analyticsMetrics(analytics)} isLoading={analyticsQuery.isLoading} />
        <div className="grid gap-[18px]" style={{ gridTemplateColumns: "1.05fr 1fr" }}>
          <AnalyticsCityBars cities={analytics?.bookings_by_city ?? []} isLoading={analyticsQuery.isLoading} />
          <AnalyticsKeyMetrics metrics={keyMetrics(analytics)} isLoading={analyticsQuery.isLoading} />
        </div>
        <div className="grid grid-cols-2 gap-[18px]">
          <div className="bg-admin-card border border-admin-border rounded-2xl px-7 py-[26px] shadow-[var(--admin-shadow)]">
            <h2 className="font-display text-[22px] font-normal text-admin-ink tracking-[-0.005em]">
              Revenue trend
            </h2>
            <div className="mt-[22px] flex items-end gap-[10px] min-h-[150px]">
              {analyticsQuery.isLoading && <p className="m-0 text-admin-ink-soft text-[14px]">Loading trend data...</p>}
              {!analyticsQuery.isLoading && latestSeries.length === 0 && (
                <p className="m-0 text-admin-ink-soft text-[14px]">No revenue trend data yet.</p>
              )}
              {!analyticsQuery.isLoading &&
                latestSeries.map((item) => (
                  <div key={item.period} className="flex-1 flex flex-col justify-end gap-2">
                    <div
                      title={`${formatShortDate(item.period)} · ${formatCurrency(item.revenue)}`}
                      className="min-h-2 rounded-[10px_10px_4px_4px] bg-admin-green"
                      style={{ height: `${maxRevenue > 0 ? Math.max((item.revenue / maxRevenue) * 120, 8) : 8}px` }}
                    />
                    <span className="text-admin-ink-soft text-[11px] text-center">
                      {formatShortDate(item.period).split(",")[0]}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-admin-card border border-admin-border rounded-2xl px-7 py-[26px] shadow-[var(--admin-shadow)]">
            <h2 className="font-display text-[22px] font-normal text-admin-ink tracking-[-0.005em]">
              Top nannies
            </h2>
            <div className="mt-[14px]">
              {analyticsQuery.isLoading && <p className="m-0 text-admin-ink-soft text-[14px]">Loading top nannies...</p>}
              {!analyticsQuery.isLoading && (analytics?.top_nannies ?? []).length === 0 && (
                <p className="m-0 text-admin-ink-soft text-[14px]">No top nanny data yet.</p>
              )}
              {!analyticsQuery.isLoading &&
                (analytics?.top_nannies ?? []).map((nanny) => (
                  <div
                    key={nanny.nanny_profile_id}
                    className="flex justify-between gap-4 py-[14px] border-b border-admin-border-soft"
                  >
                    <div>
                      <div className="text-admin-ink text-[14.5px] font-semibold">{nanny.display_name}</div>
                      <div className="text-admin-ink-soft text-[12.5px] mt-[3px]">
                        {formatLocation(nanny.city, nanny.province, "Location not set")} · {nanny.completed_count} bookings · {nanny.rating_avg.toFixed(1)} rating
                      </div>
                    </div>
                    <div className="text-admin-clay font-bold text-[14px]">{formatCurrency(nanny.revenue)}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
        <div className="bg-admin-card border border-admin-border rounded-2xl px-7 py-6 shadow-[var(--admin-shadow)]">
          <h2 className="font-display text-[22px] font-normal text-admin-ink m-0">
            Registration trends
          </h2>
          <div className="mt-4 grid gap-[10px]">
            {analyticsQuery.isLoading && <p className="m-0 text-admin-ink-soft text-[14px]">Loading registration trends...</p>}
            {!analyticsQuery.isLoading && (analytics?.registration_trends ?? []).length === 0 && (
              <p className="m-0 text-admin-ink-soft text-[14px]">No registration trend data yet.</p>
            )}
            {!analyticsQuery.isLoading &&
              (analytics?.registration_trends ?? []).slice(-8).map((item) => (
                <div key={item.period} className="grid grid-cols-[120px_1fr_1fr] gap-3 items-center">
                  <span className="text-admin-ink-soft text-[12.5px]">{formatShortDate(item.period)}</span>
                  <TrendBar label="Parents" value={item.parent_count} color="var(--admin-clay)" />
                  <TrendBar label="Nannies" value={item.nanny_count} color="var(--admin-amber)" />
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}

function TrendBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-admin-ink-mid text-[12px]">
        <span>{label}</span>
        <strong>{formatNumber(value)}</strong>
      </div>
      <div className="mt-[5px] h-2 rounded-full bg-admin-card-warm overflow-hidden">
        <div className="h-full" style={{ width: `${Math.min(value * 8, 100)}%`, background: color }} />
      </div>
    </div>
  );
}
