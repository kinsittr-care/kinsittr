import { cn } from "@/lib/utils";

type KeyTone = "clay" | "green" | "ink" | "amber";

export interface AnalyticsKeyMetric {
  label: string;
  value: string;
  tone?: KeyTone;
}

const keyToneCls: Record<KeyTone, string> = {
  clay:  "text-admin-clay",
  green: "text-admin-green",
  ink:   "text-admin-ink",
  amber: "text-admin-amber",
};

function KeyMetric({
  label,
  value,
  tone = "ink",
}: {
  label: string;
  value: string;
  tone?: KeyTone;
}) {
  return (
    <div className="flex justify-between items-center py-[14px] border-b border-admin-border-soft">
      <span className="text-[14px] text-admin-ink-mid">{label}</span>
      <span className={cn("text-[15px] font-semibold", keyToneCls[tone])}>{value}</span>
    </div>
  );
}

export default function AnalyticsKeyMetrics({
  metrics,
  isLoading,
}: {
  metrics: AnalyticsKeyMetric[];
  isLoading: boolean;
}) {
  return (
    <div className="bg-admin-card border border-admin-border rounded-2xl px-7 py-[26px] shadow-[var(--admin-shadow)]">
      <h2 className="font-display text-[22px] font-normal text-admin-ink tracking-[-0.005em]">Key metrics</h2>
      <div className="mt-[14px]">
        {metrics.map((metric) => (
          <KeyMetric
            key={metric.label}
            label={metric.label}
            value={isLoading ? "..." : metric.value}
            tone={metric.tone}
          />
        ))}
      </div>
    </div>
  );
}
