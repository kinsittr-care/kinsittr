import { N } from "../tokens";
import NannyAvatar from "../NannyAvatar";
import NannyPill from "../NannyPill";

const upcoming = [
  { id: 1, parent: "Jordan Lee",    initials: "JL", date: "Fri Apr 18", time: "9:00 AM – 1:00 PM", amount: "$112", status: "approved" as const },
  { id: 2, parent: "Maya Patel",    initials: "MP", date: "Sat Apr 19", time: "2:00 PM – 6:00 PM", amount: "$96",  status: "approved" as const },
  { id: 3, parent: "Chris Nguyen",  initials: "CN", date: "Mon Apr 21", time: "8:00 AM – 12:00 PM",amount: "$108", status: "pending"  as const },
];

const sectionTitle = {
  fontFamily: "DM Serif Display, var(--font-dm-serif), serif",
  fontSize: 22,
  fontWeight: 400,
  color: N.greenDk,
  letterSpacing: "-.005em",
  marginBottom: 16,
};

export default function DashboardUpcoming() {
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
      <h2 style={sectionTitle}>Upcoming bookings</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {upcoming.map((b, i) => (
          <div
            key={b.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 0",
              borderBottom: i < upcoming.length - 1 ? `1px solid ${N.borderSoft}` : "none",
            }}
          >
            <NannyAvatar initials={b.initials} size={40} tone="cream" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: N.greenDk }}>{b.parent}</div>
              <div style={{ fontSize: 13, color: N.inkMute, marginTop: 3 }}>
                {b.date} · {b.time}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontFamily: "DM Serif Display, var(--font-dm-serif), serif",
                  fontSize: 18,
                  color: N.green,
                }}
              >
                {b.amount}
              </div>
              <div style={{ marginTop: 5 }}>
                <NannyPill tone={b.status}>{b.status.charAt(0).toUpperCase() + b.status.slice(1)}</NannyPill>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
