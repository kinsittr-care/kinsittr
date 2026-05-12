import { N } from "../tokens";

export default function ConnectedAccountCard() {
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <h2
          style={{
            fontFamily: "DM Serif Display, var(--font-dm-serif), serif",
            fontSize: 20,
            fontWeight: 400,
            color: N.greenDk,
          }}
        >
          Connected account
        </h2>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: N.green,
            background: N.greenLt,
            border: `1px solid ${N.greenMid}`,
            padding: "4px 10px",
            borderRadius: 999,
          }}
        >
          Active
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13.5, color: N.inkMute }}>Bank</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: N.greenDk }}>TD Canada Trust ···· 4821</span>
        </div>
        <div
          style={{
            height: 1,
            background: N.borderSoft,
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13.5, color: N.inkMute }}>Next payout</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: N.green }}>Apr 22, 2026</span>
        </div>
        <div
          style={{
            height: 1,
            background: N.borderSoft,
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13.5, color: N.inkMute }}>Schedule</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: N.greenDk }}>Weekly</span>
        </div>
      </div>
    </div>
  );
}
