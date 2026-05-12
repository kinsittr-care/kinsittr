"use client";

import { useState } from "react";
import { N } from "../tokens";
import { labelStyle } from "../nanny-styles";

type Schedule = "daily" | "weekly" | "manual";

export default function PayoutScheduleCard() {
  const [schedule, setSchedule] = useState<Schedule>("weekly");

  return (
    <div
      style={{
        background: N.card,
        border: `1px solid ${N.border}`,
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
        Payout schedule
      </h2>

      <label style={labelStyle}>Bank account</label>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          background: N.cardSoft,
          border: `1px solid ${N.border}`,
          borderRadius: 10,
          marginBottom: 20,
        }}
      >
        <span style={{ fontSize: 14, color: N.greenDk, fontWeight: 500 }}>TD Canada Trust ···· 4821</span>
        <button
          style={{
            fontSize: 13,
            color: N.green,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Change
        </button>
      </div>

      <label style={labelStyle}>Schedule</label>
      <div style={{ display: "flex", gap: 10 }}>
        {(["daily", "weekly", "manual"] as Schedule[]).map((s) => (
          <button
            key={s}
            onClick={() => setSchedule(s)}
            style={{
              flex: 1,
              padding: "11px 0",
              borderRadius: 10,
              fontSize: 13.5,
              fontWeight: schedule === s ? 600 : 500,
              color: schedule === s ? N.green : N.inkMute,
              background: schedule === s ? N.greenLt : N.cardSoft,
              border: `1px solid ${schedule === s ? N.greenMid : N.border}`,
              cursor: "pointer",
              transition: "all .15s",
              textTransform: "capitalize",
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
