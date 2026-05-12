import { N } from "../tokens";

type Tone = "green" | "gold" | "rose" | "amber";

const toneColors: Record<Tone, string> = {
  green: N.green,
  gold:  N.gold,
  rose:  N.rose,
  amber: N.amber,
};

function StatCard({
  label,
  value,
  sub,
  tone = "green",
}: {
  label: string;
  value: string;
  sub: string;
  tone?: Tone;
}) {
  return (
    <div
      style={{
        background: N.card,
        border: `1px solid ${N.border}`,
        borderRadius: 18,
        padding: "22px 24px",
        minHeight: 138,
        boxShadow: N.shadow,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: ".1em",
          textTransform: "uppercase",
          color: N.inkMute,
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: "auto",
          fontFamily: "DM Serif Display, var(--font-dm-serif), serif",
          fontSize: 42,
          lineHeight: 1,
          color: toneColors[tone],
          letterSpacing: "-.01em",
          paddingTop: 16,
        }}
      >
        {value}
      </div>
      <div style={{ marginTop: 10, fontSize: 13, color: N.inkMute }}>{sub}</div>
    </div>
  );
}

export default function DashboardStatCards() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 18,
      }}
    >
      <StatCard label="Earnings this month" value="$1,840"  sub="↑ 12% vs last month"   tone="green" />
      <StatCard label="Bookings this month" value="11"      sub="3 upcoming"             tone="gold"  />
      <StatCard label="Your rating"         value="4.9 ★"   sub="Based on 47 reviews"    tone="gold"  />
      <StatCard label="Response rate"       value="98%"     sub="Within 2 hrs avg"       tone="green" />
    </div>
  );
}
