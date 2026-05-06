import Avatar from "../dashboard/Avatar";
import SectionCard from "./SectionCard";

const BOOKINGS = [
  { nanny: "Sarah Okonkwo", initials: "SO", date: "Apr 10, 2026", hours: "6h", total: "$168", status: "Completed" },
  { nanny: "Marie-Claire Beaumont", initials: "MB", date: "Mar 28, 2026", hours: "4h", total: "$128", status: "Completed" },
  { nanny: "Aisha Mensah", initials: "AM", date: "May 3, 2026", hours: "8h", total: "$240", status: "Upcoming" },
];

export default function BookingHistorySection() {
  return (
    <SectionCard title="Booking History">
      {BOOKINGS.map((booking, index) => (
        <div
          key={`${booking.nanny}-${index}`}
          className="flex items-center gap-[14px]"
          style={{ padding: "14px 0", borderBottom: "1px solid var(--border)" }}
        >
          <Avatar initials={booking.initials} size={40} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{booking.nanny}</div>
            <div style={{ fontSize: 12.5, color: "var(--faint)", marginTop: 1 }}>
              {booking.date} · {booking.hours}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{booking.total}</div>
            <span
              style={{
                fontSize: 11.5,
                padding: "3px 9px",
                borderRadius: 20,
                fontWeight: 500,
                background: booking.status === "Upcoming" ? "var(--teal-lt)" : "#f0ede8",
                color: booking.status === "Upcoming" ? "var(--teal)" : "var(--muted)",
                border: `1px solid ${booking.status === "Upcoming" ? "var(--teal-mid)" : "var(--border)"}`,
              }}
            >
              {booking.status}
            </span>
          </div>
        </div>
      ))}
      <button
        style={{
          marginTop: 10,
          fontSize: 13,
          color: "var(--muted)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        View all bookings →
      </button>
    </SectionCard>
  );
}
