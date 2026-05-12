import { N } from "../tokens";
import { btnPrimary } from "../nanny-styles";

export default function StripeStatusCard() {
  return (
    <div
      style={{
        background: N.card,
        border: `1px solid ${N.border}`,
        borderRadius: 18,
        padding: "24px 28px",
        boxShadow: N.shadow,
        display: "flex",
        alignItems: "center",
        gap: 20,
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: N.greenLt,
          border: `1px solid ${N.greenMid}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="2" y="5" width="18" height="12" rx="3" stroke={N.green} strokeWidth="1.6" />
          <path d="M2 10h18" stroke={N.green} strokeWidth="1.6" />
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: N.greenDk }}>Stripe Connect</div>
        <div style={{ marginTop: 4, fontSize: 13.5, color: N.inkMute }}>
          Your account is active. Payouts are processed weekly.
        </div>
      </div>
      <span
        style={{
          fontSize: 12.5,
          fontWeight: 600,
          color: N.green,
          background: N.greenLt,
          border: `1px solid ${N.greenMid}`,
          padding: "5px 12px",
          borderRadius: 999,
        }}
      >
        ✓ Connected
      </span>
      <button style={btnPrimary}>Manage account</button>
    </div>
  );
}
