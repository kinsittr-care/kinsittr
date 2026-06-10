import { cn } from "@/lib/utils";

type MetricTone = "clay" | "green" | "plum" | "amber";

export interface AnalyticsMetricTile {
  label: string;
  value: string;
  sub: React.ReactNode;
  tone?: MetricTone;
}

const metricToneCls: Record<MetricTone, string> = {
  clay:  "text-admin-clay",
  green: "text-admin-green",
  plum:  "text-admin-plum",
  amber: "text-admin-amber",
};

function MetricCard({
  label,
  value,
  sub,
  tone = "clay",
}: {
  label: string;
  value: string;
  sub: React.ReactNode;
  tone?: MetricTone;
}) {
  return (
    <div className="min-w-[220px] bg-admin-card border border-admin-border rounded-2xl px-5 py-5 shadow-[var(--admin-shadow)] sm:px-6 sm:py-[22px]">
      <div className="text-[11px] font-semibold tracking-[.16em] uppercase text-admin-ink-soft">
        {label}
      </div>
      <div className={cn("mt-[14px] font-display text-[36px] leading-none tracking-[-0.01em] sm:text-[44px]", metricToneCls[tone])}>
        {value}
      </div>
      <div className="mt-[14px] text-[13px] text-admin-ink-soft">{sub}</div>
    </div>
  );
}

export default function AnalyticsMetricTiles({
  metrics,
  isLoading,
}: {
  metrics: AnalyticsMetricTile[];
  isLoading: boolean;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] xl:grid xl:grid-cols-4 xl:overflow-visible xl:gap-[18px]">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.label}
          label={metric.label}
          value={isLoading ? "..." : metric.value}
          sub={isLoading ? "Loading analytics..." : metric.sub}
          tone={metric.tone}
        />
      ))}
    </div>
  );
}
