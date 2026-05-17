import { N } from "./tokens";
import StripeStatusCard from "./payments/StripeStatusCard";
import PayoutScheduleCard from "./payments/PayoutScheduleCard";
import IdentityTaxCard from "./payments/IdentityTaxCard";
import BalanceSummaryCard from "./payments/BalanceSummaryCard";
import { btnPrimary } from "./nanny-styles";

export default function NannyPaymentsView() {
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
          Payment Settings
        </h1>
        <p style={{ marginTop: 8, fontSize: 14.5, color: N.inkMute }}>
          Manage your banking, payout schedule, and tax information.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <StripeStatusCard />

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 18 }}>
          <PayoutScheduleCard />
          <BalanceSummaryCard />
        </div>

        <IdentityTaxCard />

        <div>
          <button style={btnPrimary}>Save changes</button>
        </div>
      </div>
    </div>
  );
}
