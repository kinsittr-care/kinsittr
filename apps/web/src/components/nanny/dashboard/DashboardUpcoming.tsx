import type { Booking } from "@/src/types/api/api";
import { N } from "../tokens";
import NannyAvatar from "../NannyAvatar";
import NannyPill from "../NannyPill";

const sectionTitle = {
  fontFamily: "DM Serif Display, var(--font-dm-serif), serif",
  fontSize: 22,
  fontWeight: 400,
  color: N.greenDk,
  letterSpacing: "-.005em",
  marginBottom: 16,
};

function getInitials(name?: string) {
  return (name || "Parent")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatTimeRange(booking: Booking) {
  const [hour, minute] = booking.start_time.split(":").map(Number);
  const start = new Date();
  start.setHours(hour || 0, minute || 0, 0, 0);
  const end = new Date(start.getTime() + booking.duration * 60 * 60 * 1000);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

export default function DashboardUpcoming({
  bookings,
  isLoading,
  isError,
  errorMessage,
}: {
  bookings: Booking[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
}) {
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
        {isLoading && (
          <div style={{ padding: "20px 0", color: N.inkFaint, fontSize: 14 }}>
            Loading bookings...
          </div>
        )}

        {isError && (
          <div style={{ padding: "20px 0", color: N.rose, fontSize: 14 }}>
            {errorMessage}
          </div>
        )}

        {!isLoading && !isError && bookings.length === 0 && (
          <div style={{ padding: "20px 0", color: N.inkFaint, fontSize: 14 }}>
            No upcoming bookings yet.
          </div>
        )}

        {bookings.map((b, i) => (
          <div
            key={b.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 0",
              borderBottom: i < bookings.length - 1 ? `1px solid ${N.borderSoft}` : "none",
            }}
          >
            <NannyAvatar initials={getInitials(b.parent_display_name)} size={40} tone="cream" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: N.greenDk }}>{b.parent_display_name || "Parent"}</div>
              <div style={{ fontSize: 13, color: N.inkMute, marginTop: 3 }}>
                {formatDate(b.date)} · {formatTimeRange(b)}
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
                ${b.total_amount.toFixed(0)}
              </div>
              <div style={{ marginTop: 5 }}>
                <NannyPill tone={b.status === "cancelled" ? "neutral" : b.status}>{b.status.charAt(0).toUpperCase() + b.status.slice(1)}</NannyPill>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
