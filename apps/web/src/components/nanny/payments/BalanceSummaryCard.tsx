import { N } from "../tokens";

const rows = [
  { label: "Available balance",  value: "$612",     color: N.green },
  { label: "Pending",            value: "$208",     color: N.amber },
  { label: "Next payout",        value: "Apr 22",   color: N.greenDk },
];

export default function BalanceSummaryCard() {
  return (
    <div
      style={{
        background: N.greenLt,
        border: `1px solid ${N.greenMid}`,
        borderRadius: 18,
        padding: "24px 28px",
        boxShadow: N.shadow,
      }}
    >
      <h2
        style={{
          fontFamily: "DM Serif Display, var(--font-dm-serif), serif",
          fontSize: 20,
          fontWeight: 400,
          color: N.greenDk,
          marginBottom: 18,
        }}
      >
        Balance summary
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {rows.map((r, i) => (
          <div
            key={r.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "13px 0",
              borderBottom: i < rows.length - 1 ? `1px solid ${N.greenMid}` : "none",
            }}
          >
            <span style={{ fontSize: 13.5, color: N.inkSoft }}>{r.label}</span>
            <span
              style={{
                fontFamily: "DM Serif Display, var(--font-dm-serif), serif",
                fontSize: 22,
                color: r.color,
                lineHeight: 1,
              }}
            >
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
