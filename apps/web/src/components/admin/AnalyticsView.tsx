"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminPageHeader from "./AdminPageHeader";
import AnalyticsMetricTiles from "./analytics/AnalyticsMetricTiles";
import AnalyticsCityBars from "./analytics/AnalyticsCityBars";
import AnalyticsKeyMetrics from "./analytics/AnalyticsKeyMetrics";
import { btnGhost } from "./admin-styles";
import { A } from "./tokens";
import type { AdminAnalyticsBucket, AdminAnalyticsData, AdminAnalyticsParams } from "@/src/types/api/admin";
import { adminAnalyticsQueryKey, getAdminAnalytics } from "@/src/utils/api/admin/analytics";
import { formatCurrency, formatDateParam, formatNumber, formatShortDate } from "@/src/utils/format";

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
  const activeRange = rangeConfig[range];
  const params = useMemo<AdminAnalyticsParams>(() => {
    const now = new Date();
    return {
      date_from: formatDateParam(subtractDays(now, activeRange.days)),
      date_to: formatDateParam(now),
      bucket: activeRange.bucket,
      city_limit: 10,
      top_nannies_limit: 5,
    };
  }, [activeRange]);

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
          <div style={{ display: "flex", gap: 10 }}>
            {(Object.keys(rangeConfig) as RangeKey[]).map((key) => (
              <button
                key={key}
                style={{
                  ...btnGhost,
                  background: range === key ? A.cardWarm : btnGhost.background,
                  borderColor: range === key ? A.clay : btnGhost.borderColor,
                  color: range === key ? A.clay : btnGhost.color,
                }}
                onClick={() => setRange(key)}
              >
                {rangeConfig[key].label}
              </button>
            ))}
            <button style={btnGhost} onClick={() => analyticsQuery.refetch()}>
              Refresh
            </button>
          </div>
        }
      />
      <div
        style={{
          padding: "24px 40px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {analyticsQuery.isError && (
          <div
            style={{
              background: "#fff4ea",
              border: "1px solid #f0c8a8",
              borderRadius: 14,
              color: "#9a5528",
              padding: "12px 14px",
              fontSize: 13,
            }}
          >
            {analyticsQuery.error instanceof Error
              ? analyticsQuery.error.message
              : "Unable to load analytics."}
          </div>
        )}
        <AnalyticsMetricTiles metrics={analyticsMetrics(analytics)} isLoading={analyticsQuery.isLoading} />
        <div style={{ display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 18 }}>
          <AnalyticsCityBars cities={analytics?.bookings_by_city ?? []} isLoading={analyticsQuery.isLoading} />
          <AnalyticsKeyMetrics metrics={keyMetrics(analytics)} isLoading={analyticsQuery.isLoading} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 16, padding: "26px 28px", boxShadow: A.shadow }}>
            <h2 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 22, fontWeight: 400, color: A.ink, letterSpacing: "-.005em" }}>
              Revenue trend
            </h2>
            <div style={{ marginTop: 22, display: "flex", alignItems: "end", gap: 10, minHeight: 150 }}>
              {analyticsQuery.isLoading && <p style={{ margin: 0, color: A.inkSoft, fontSize: 14 }}>Loading trend data...</p>}
              {!analyticsQuery.isLoading && latestSeries.length === 0 && (
                <p style={{ margin: 0, color: A.inkSoft, fontSize: 14 }}>No revenue trend data yet.</p>
              )}
              {!analyticsQuery.isLoading &&
                latestSeries.map((item) => (
                  <div key={item.period} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "end", gap: 8 }}>
                    <div
                      title={`${formatShortDate(item.period)} · ${formatCurrency(item.revenue)}`}
                      style={{
                        minHeight: 8,
                        height: `${maxRevenue > 0 ? Math.max((item.revenue / maxRevenue) * 120, 8) : 8}px`,
                        borderRadius: "10px 10px 4px 4px",
                        background: A.green,
                      }}
                    />
                    <span style={{ color: A.inkSoft, fontSize: 11, textAlign: "center" }}>
                      {formatShortDate(item.period).split(",")[0]}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 16, padding: "26px 28px", boxShadow: A.shadow }}>
            <h2 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 22, fontWeight: 400, color: A.ink, letterSpacing: "-.005em" }}>
              Top nannies
            </h2>
            <div style={{ marginTop: 14 }}>
              {analyticsQuery.isLoading && <p style={{ margin: 0, color: A.inkSoft, fontSize: 14 }}>Loading top nannies...</p>}
              {!analyticsQuery.isLoading && (analytics?.top_nannies ?? []).length === 0 && (
                <p style={{ margin: 0, color: A.inkSoft, fontSize: 14 }}>No top nanny data yet.</p>
              )}
              {!analyticsQuery.isLoading &&
                (analytics?.top_nannies ?? []).map((nanny) => (
                  <div
                    key={nanny.nanny_profile_id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 16,
                      padding: "14px 0",
                      borderBottom: `1px solid ${A.borderSoft}`,
                    }}
                  >
                    <div>
                      <div style={{ color: A.ink, fontSize: 14.5, fontWeight: 600 }}>{nanny.display_name}</div>
                      <div style={{ color: A.inkSoft, fontSize: 12.5, marginTop: 3 }}>
                        {[nanny.city, nanny.province].filter(Boolean).join(", ")} · {nanny.completed_count} bookings · {nanny.rating_avg.toFixed(1)} rating
                      </div>
                    </div>
                    <div style={{ color: A.clay, fontWeight: 700, fontSize: 14 }}>{formatCurrency(nanny.revenue)}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
