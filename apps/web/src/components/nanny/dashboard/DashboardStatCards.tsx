import type { Booking } from "@/src/types/api/api";
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

export default function DashboardStatCards({
  bookings,
  isLoading,
}: {
  bookings: Booking[];
  isLoading: boolean;
}) {
  const approvedCount = bookings.filter((booking) => booking.status === "approved").length;
  const pendingCount = bookings.filter((booking) => booking.status === "pending").length;
  const estimatedEarnings = bookings
    .filter((booking) => booking.status === "approved")
    .reduce((sum, booking) => sum + booking.total_amount, 0);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 18,
      }}
    >
      <StatCard
        label="Approved value"
        value={isLoading ? "..." : `$${estimatedEarnings.toFixed(0)}`}
        sub={`${approvedCount} approved bookings`}
        tone="green"
      />
      <StatCard
        label="Pending requests"
        value={isLoading ? "..." : String(pendingCount)}
        sub="Awaiting your response"
        tone="amber"
      />
      <StatCard label="Your rating" value="4.9" sub="Profile rating coming soon" tone="gold" />
      <StatCard label="Response rate" value="98%" sub="Manual metric for now" tone="green" />
    </div>
  );
}
