import { A } from "../tokens";

type KeyTone = "clay" | "green" | "ink" | "amber";

export interface AnalyticsKeyMetric {
  label: string;
  value: string;
  tone?: KeyTone;
}

const keyColors: Record<KeyTone, string> = {
  clay:  A.clay,
  green: A.green,
  ink:   A.ink,
  amber: A.amber,
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
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 0",
        borderBottom: `1px solid ${A.borderSoft}`,
      }}
    >
      <span style={{ fontSize: 14, color: A.inkMid }}>{label}</span>
      <span style={{ fontSize: 15, fontWeight: 600, color: keyColors[tone] }}>{value}</span>
    </div>
  );
}

const titleSerif = {
  fontFamily: "var(--font-dm-serif), serif",
  fontSize: 22,
  fontWeight: 400,
  color: "var(--admin-ink)",
  letterSpacing: "-.005em",
};

export default function AnalyticsKeyMetrics({
  metrics,
  isLoading,
}: {
  metrics: AnalyticsKeyMetric[];
  isLoading: boolean;
}) {
  return (
    <div
      style={{
        background: A.card,
        border: `1px solid ${A.border}`,
        borderRadius: 16,
        padding: "26px 28px",
        boxShadow: A.shadow,
      }}
    >
      <h2 style={titleSerif}>Key metrics</h2>
      <div style={{ marginTop: 14 }}>
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
