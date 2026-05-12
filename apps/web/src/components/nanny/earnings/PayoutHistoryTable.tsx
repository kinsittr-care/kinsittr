"use client";

import { N } from "../tokens";
import NannyPill from "../NannyPill";

const payouts = [
  { id: 1, parent: "Jordan Lee",   hours: 4,  date: "Apr 12, 2026", amount: "$112", status: "paid"      as const },
  { id: 2, parent: "Sara Kim",     hours: 4,  date: "Apr 9, 2026",  amount: "$100", status: "paid"      as const },
  { id: 3, parent: "Tom Bradley",  hours: 8,  date: "Apr 7, 2026",  amount: "$224", status: "paid"      as const },
  { id: 4, parent: "Maya Patel",   hours: 5,  date: "Apr 4, 2026",  amount: "$120", status: "pending"   as const },
  { id: 5, parent: "Chris Nguyen", hours: 4,  date: "Mar 28, 2026", amount: "$108", status: "paid"      as const },
];

const colTemplate = "1.8fr 0.7fr 1.3fr 1fr 0.8fr";

export default function PayoutHistoryTable() {
  return (
    <div
      style={{
        background: N.card,
        border: `1px solid ${N.border}`,
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: N.shadow,
      }}
    >
      <div
        style={{
          padding: "18px 24px 14px",
          borderBottom: `1px solid ${N.borderSoft}`,
        }}
      >
        <h2
          style={{
            fontFamily: "DM Serif Display, var(--font-dm-serif), serif",
            fontSize: 20,
            fontWeight: 400,
            color: N.greenDk,
          }}
        >
          Payout history
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: colTemplate,
          padding: "12px 24px",
          borderBottom: `1px solid ${N.borderSoft}`,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: ".12em",
          textTransform: "uppercase",
          color: N.inkFaint,
        }}
      >
        <div>Parent</div>
        <div>Hours</div>
        <div>Date</div>
        <div>Amount</div>
        <div>Status</div>
      </div>

      {payouts.map((p, i) => (
        <div
          key={p.id}
          className="nanny-payout-row"
          style={{
            display: "grid",
            gridTemplateColumns: colTemplate,
            alignItems: "center",
            padding: "15px 24px",
            borderBottom: i < payouts.length - 1 ? `1px solid ${N.borderSoft}` : "none",
            transition: "background .15s",
          }}
        >
          <div style={{ fontSize: 14.5, fontWeight: 600, color: N.greenDk }}>{p.parent}</div>
          <div style={{ fontSize: 14, color: N.inkMute }}>{p.hours}h</div>
          <div style={{ fontSize: 13.5, color: N.inkMute }}>{p.date}</div>
          <div style={{ fontFamily: "DM Serif Display, var(--font-dm-serif), serif", fontSize: 18, color: N.green }}>
            {p.amount}
          </div>
          <div>
            <NannyPill tone={p.status}>{p.status.charAt(0).toUpperCase() + p.status.slice(1)}</NannyPill>
          </div>
        </div>
      ))}
    </div>
  );
}
