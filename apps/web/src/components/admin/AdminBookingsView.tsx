import type { CSSProperties } from "react";
import { A } from "./tokens";
import AdminPageHeader from "./AdminPageHeader";
import AdminPill from "./AdminPill";
import type { PillTone } from "./AdminPill";
import { btnGhost } from "./admin-styles";

const BOOKINGS = [
  { id: "BK-001", nanny: "Sarah Okonkwo",         parent: "David Chen",      date: "Apr 12, 2026", hours: 8, total: 224,  status: "Confirmed" },
  { id: "BK-002", nanny: "Marie-Claire Beaumont", parent: "Lisa Thompson",   date: "Apr 14, 2026", hours: 5, total: 160,  status: "Pending"   },
  { id: "BK-003", nanny: "Priya Sharma",          parent: "Ahmed Al-Rashid", date: "Apr 10, 2026", hours: 4, total: 100,  status: "Completed" },
  { id: "BK-004", nanny: "Aisha Mensah",          parent: "Rachel Green",    date: "Apr 8, 2026",  hours: 8, total: 240,  status: "Completed" },
  { id: "BK-005", nanny: "Jennifer Walsh",        parent: "Sofia Ramirez",   date: "Apr 7, 2026",  hours: 6, total: 162,  status: "Completed" },
];

const statusTone = (s: string): PillTone =>
  ({ Confirmed: "green", Pending: "amber", Completed: "completed" } as Record<string, PillTone>)[s] ?? "neutral";

const colTemplate = ".8fr 1.6fr 1.4fr 1.1fr .7fr .9fr 1fr";

const thStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: colTemplate,
  padding: "14px 24px",
  borderBottom: `1px solid ${A.divider}`,
  background: A.cardWarm,
  fontSize: 11.5,
  fontWeight: 600,
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: A.inkSoft,
};

export default function AdminBookingsView() {
  return (
    <>
      <AdminPageHeader
        title="Bookings"
        subtitle="138 active bookings · 64 this week"
        right={
          <div style={{ display: "flex", gap: 10 }}>
            <button style={btnGhost}>This month</button>
            <button style={btnGhost}>Export</button>
          </div>
        }
      />
      <div style={{ padding: "24px 40px 40px" }}>
        <div
          style={{
            background: A.card,
            border: `1px solid ${A.border}`,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: A.shadow,
          }}
        >
          <div style={thStyle}>
            <div>ID</div>
            <div>Nanny</div>
            <div>Parent</div>
            <div>Date</div>
            <div>Hours</div>
            <div>Total</div>
            <div>Status</div>
          </div>

          {BOOKINGS.map((b, i) => (
            <div
              key={b.id}
              className="admin-table-row"
              style={{
                display: "grid",
                gridTemplateColumns: colTemplate,
                alignItems: "center",
                padding: "18px 24px",
                gap: 12,
                borderBottom: i < BOOKINGS.length - 1 ? `1px solid ${A.borderSoft}` : "none",
                transition: "background .15s",
              }}
            >
              <div style={{ fontFamily: "monospace", fontSize: 13, color: A.inkSoft, letterSpacing: ".02em" }}>
                {b.id}
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: A.ink }}>{b.nanny}</div>
              <div style={{ fontSize: 14, color: A.inkMid }}>{b.parent}</div>
              <div style={{ fontSize: 13.5, color: A.inkSoft }}>{b.date}</div>
              <div style={{ fontSize: 14.5, color: A.ink, fontWeight: 500 }}>{b.hours}h</div>
              <div style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 18, color: A.clay }}>
                ${b.total}
              </div>
              <div>
                <AdminPill tone={statusTone(b.status)}>{b.status}</AdminPill>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
