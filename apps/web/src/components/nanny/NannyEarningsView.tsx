import { N } from "./tokens";
import PayoutHistoryTable from "./earnings/PayoutHistoryTable";
import ConnectedAccountCard from "./earnings/ConnectedAccountCard";

function EarningsStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div
      style={{
        background: N.card,
        border: `1px solid ${N.border}`,
        borderRadius: 18,
        padding: "22px 24px",
        minHeight: 130,
        boxShadow: N.shadow,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: N.inkMute }}>
        {label}
      </div>
      <div
        style={{
          marginTop: "auto",
          paddingTop: 14,
          fontFamily: "DM Serif Display, var(--font-dm-serif), serif",
          fontSize: 40,
          lineHeight: 1,
          color: N.green,
          letterSpacing: "-.01em",
        }}
      >
        {value}
      </div>
      <div style={{ marginTop: 10, fontSize: 13, color: N.inkMute }}>{sub}</div>
    </div>
  );
}

export default function NannyEarningsView() {
  return (
    <div style={{ padding: "40px 48px 80px", overflowY: "auto", flex: 1 }}>
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontFamily: "DM Serif Display, var(--font-dm-serif), serif",
            fontSize: 36,
            fontWeight: 400,
            color: N.greenDk,
            lineHeight: 1.1,
          }}
        >
          Earnings
        </h1>
        <p style={{ marginTop: 8, fontSize: 14.5, color: N.inkMute }}>April 2026 · Canada</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginBottom: 24 }}>
        <EarningsStat label="This month"  value="$1,840" sub="11 bookings"   />
        <EarningsStat label="Last month"  value="$1,640" sub="9 bookings"    />
        <EarningsStat label="All time"    value="$9,280" sub="52 bookings"   />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 18 }}>
        <PayoutHistoryTable />
        <ConnectedAccountCard />
      </div>
    </div>
  );
}
