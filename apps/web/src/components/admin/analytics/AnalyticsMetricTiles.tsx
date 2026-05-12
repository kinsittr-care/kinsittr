import { A } from "../tokens";

type MetricTone = "clay" | "green" | "plum" | "amber";

const metricColors: Record<MetricTone, string> = {
  clay:  A.clay,
  green: A.green,
  plum:  A.plum,
  amber: A.amber,
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
    <div
      style={{
        background: A.card,
        border: `1px solid ${A.border}`,
        borderRadius: 16,
        padding: "22px 24px",
        boxShadow: A.shadow,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: ".16em",
          textTransform: "uppercase",
          color: A.inkSoft,
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 14,
          fontFamily: "var(--font-dm-serif), serif",
          fontSize: 44,
          lineHeight: 1,
          color: metricColors[tone],
          letterSpacing: "-.01em",
        }}
      >
        {value}
      </div>
      <div style={{ marginTop: 14, fontSize: 13, color: A.inkSoft }}>{sub}</div>
    </div>
  );
}

export default function AnalyticsMetricTiles() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 18,
      }}
    >
      <MetricCard
        label="Total Revenue"
        value="$24,820"
        sub={<span style={{ color: A.green, fontWeight: 600 }}>↑ 22% vs Mar</span>}
        tone="clay"
      />
      <MetricCard label="Platform Fee"     value="$2,482" sub="10% take rate"    tone="green" />
      <MetricCard label="Active Bookings"  value="138"    sub="64 this week"     tone="plum"  />
      <MetricCard label="Verified Nannies" value="42"     sub="5 pending review" tone="amber" />
    </div>
  );
}
