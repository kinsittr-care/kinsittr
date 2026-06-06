import { N } from "../tokens";
import type { NannyPayoutSchedule, StripePayoutData, StripeStatusData } from "@/src/types/api/payments";
import { formatShortDate } from "@/src/utils/format";

export default function ConnectedAccountCard({
  status,
  payouts,
  schedule,
}: {
  status: StripeStatusData | undefined;
  payouts: StripePayoutData[];
  schedule: NannyPayoutSchedule | undefined;
}) {
  const connected = Boolean(status?.account_id);
  const onboarded = Boolean(status?.onboarded);
  const nextPayout = payouts[0];
  const statusLabel = onboarded ? "Active" : connected ? "Setup incomplete" : "Not connected";

  return (
    <div
      style={{
        background: N.card,
        border: `1px solid ${N.border}`,
        borderRadius: 18,
        padding: "24px 26px",
        boxShadow: N.shadow,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, gap: 12 }}>
        <h2 style={{ fontFamily: "DM Serif Display, var(--font-dm-serif), serif", fontSize: 20, fontWeight: 400, color: N.greenDk }}>
          Connected account
        </h2>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: onboarded ? N.green : connected ? N.amber : N.inkMute,
            background: onboarded ? N.greenLt : connected ? N.amberLt : N.cardSoft,
            border: `1px solid ${onboarded ? N.greenMid : N.border}`,
            padding: "4px 10px",
            borderRadius: 999,
            whiteSpace: "nowrap",
          }}
        >
          {statusLabel}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <DetailRow label="Stripe" value={connected ? "Express account connected" : "Not connected"} />
        <Divider />
        <DetailRow label="Next payout" value={nextPayout?.arrival_date ? formatShortDate(nextPayout.arrival_date) : "Not scheduled"} highlight />
        <Divider />
        <DetailRow label="Schedule" value={schedule ?? "weekly"} capitalize />
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  highlight = false,
  capitalize = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
      <span style={{ fontSize: 13.5, color: N.inkMute }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: highlight ? N.green : N.greenDk, textTransform: capitalize ? "capitalize" : "none", textAlign: "right" }}>
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: N.borderSoft }} />;
}
