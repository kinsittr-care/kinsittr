import type { CSSProperties } from "react";
import AdminPill, { type PillTone } from "./AdminPill";
import { A } from "../tokens";
import type { AdminBooking } from "@/src/types/api/admin";
import { formatCurrency, formatDateOnlyShort, formatPaymentState } from "@/src/utils/format";

const colTemplate = ".95fr 1.45fr 1.25fr .95fr .6fr .8fr .95fr .95fr";

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

export function bookingStatusTone(status: AdminBooking["status"]): PillTone {
  if (status === "approved") return "green";
  if (status === "pending") return "amber";
  if (status === "completed") return "completed";
  if (status === "cancelled" || status === "declined") return "red";
  return "neutral";
}

export default function AdminBookingsTable({
  bookings,
  isLoading,
  selectedBookingId,
  onSelect,
}: {
  bookings: AdminBooking[];
  isLoading: boolean;
  selectedBookingId: string | null;
  onSelect: (bookingId: string) => void;
}) {
  return (
    <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 16, overflow: "hidden", boxShadow: A.shadow }}>
      <div style={thStyle}>
        <div>ID</div>
        <div>Nanny</div>
        <div>Parent</div>
        <div>Date</div>
        <div>Hours</div>
        <div>Total</div>
        <div>Status</div>
        <div>Payment</div>
      </div>

      {isLoading ? (
        <div style={{ padding: 24, color: A.inkSoft }}>Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div style={{ padding: 24, color: A.inkSoft }}>No bookings found.</div>
      ) : (
        bookings.map((booking, i) => (
          <button
            key={booking.id}
            className="admin-table-row"
            onClick={() => onSelect(booking.id)}
            style={{
              all: "unset",
              display: "grid",
              gridTemplateColumns: colTemplate,
              alignItems: "center",
              padding: "18px 24px",
              gap: 12,
              borderBottom: i < bookings.length - 1 ? `1px solid ${A.borderSoft}` : "none",
              background: selectedBookingId === booking.id ? A.cardWarm : "transparent",
              cursor: "pointer",
              transition: "background .15s",
            }}
          >
            <div style={{ fontFamily: "monospace", fontSize: 12, color: A.inkSoft, letterSpacing: ".02em" }}>
              {booking.id.slice(0, 8)}
            </div>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: A.ink }}>{booking.nanny_display_name}</div>
            <div style={{ fontSize: 14, color: A.inkMid }}>{booking.parent_display_name}</div>
            <div style={{ fontSize: 13.5, color: A.inkSoft }}>{formatDateOnlyShort(booking.date)}</div>
            <div style={{ fontSize: 14.5, color: A.ink, fontWeight: 500 }}>{booking.duration}h</div>
            <div style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 18, color: A.clay }}>
              {formatCurrency(booking.total_amount)}
            </div>
            <div>
              <AdminPill tone={bookingStatusTone(booking.status)}>{booking.status}</AdminPill>
            </div>
            <div>
              {(() => {
                const payment = formatPaymentState(booking.payment_status);
                const tone = payment.tone === "danger" ? "red" : payment.tone === "success" ? "green" : payment.tone === "warning" ? "amber" : "neutral";
                return <AdminPill tone={tone}>{payment.label}</AdminPill>;
              })()}
            </div>
          </button>
        ))
      )}
    </div>
  );
}
