"use client";

import { useState } from "react";
import { N } from "./tokens";
import BookingRequestCard from "./requests/BookingRequestCard";
import type { BookingRequest } from "./requests/BookingRequestCard";

const REQUESTS: BookingRequest[] = [
  { id: 1, parent: "Jordan Lee",   initials: "JL", date: "Fri Apr 18",  time: "9:00–13:00",  hours: 4, amount: "$112", status: "pending",   children: "2 kids, ages 3 & 6" },
  { id: 2, parent: "Maya Patel",   initials: "MP", date: "Sat Apr 19",  time: "14:00–18:00", hours: 4, amount: "$96",  status: "approved",  children: "1 kid, age 2" },
  { id: 3, parent: "Chris Nguyen", initials: "CN", date: "Mon Apr 21",  time: "8:00–12:00",  hours: 4, amount: "$108", status: "pending",   children: "2 kids, ages 4 & 7" },
  { id: 4, parent: "Sara Kim",     initials: "SK", date: "Wed Apr 9",   time: "10:00–14:00", hours: 4, amount: "$100", status: "completed", children: "1 kid, age 5" },
  { id: 5, parent: "Tom Bradley",  initials: "TB", date: "Mon Apr 7",   time: "8:00–16:00",  hours: 8, amount: "$224", status: "declined",  children: "3 kids, ages 2, 5 & 8" },
];

type Filter = "all" | "pending" | "approved" | "completed";
const FILTERS: Filter[] = ["all", "pending", "approved", "completed"];

export default function NannyRequestsView() {
  const [filter, setFilter] = useState<Filter>("all");

  const visible = REQUESTS.filter((r) => filter === "all" || r.status === filter);

  return (
    <div style={{ padding: "40px 48px 80px" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontFamily: "DM Serif Display, var(--font-dm-serif), serif",
            fontSize: 36,
            fontWeight: 400,
            color: N.greenDk,
            lineHeight: 1.1,
          }}
        >
          Booking Requests
        </h1>
        <p style={{ marginTop: 8, fontSize: 14.5, color: N.inkMute }}>
          {REQUESTS.filter((r) => r.status === "pending").length} pending · {REQUESTS.length} total
        </p>
      </div>

      {/* Filter tabs */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 24,
          background: N.cardSoft,
          border: `1px solid ${N.border}`,
          borderRadius: 12,
          padding: 4,
          alignSelf: "flex-start",
          width: "fit-content",
        }}
      >
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "8px 18px",
              borderRadius: 9,
              fontSize: 13.5,
              fontWeight: filter === f ? 600 : 500,
              color: filter === f ? N.green : N.inkMute,
              background: filter === f ? N.card : "transparent",
              border: filter === f ? `1px solid ${N.border}` : "1px solid transparent",
              boxShadow: filter === f ? N.shadow : "none",
              cursor: "pointer",
              transition: "all .15s",
              textTransform: "capitalize",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {visible.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              color: N.inkFaint,
              fontSize: 15,
            }}
          >
            No {filter} requests
          </div>
        ) : (
          visible.map((r) => <BookingRequestCard key={r.id} booking={r} />)
        )}
      </div>
    </div>
  );
}
