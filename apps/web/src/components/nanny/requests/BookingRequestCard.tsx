import { N } from "../tokens";
import NannyAvatar from "../NannyAvatar";
import NannyPill from "../NannyPill";
import type { PillTone } from "../NannyPill";
import { btnAccept, btnDecline, btnGhost } from "../nanny-styles";

export type BookingRequest = {
  id: string;
  parent: string;
  initials: string;
  date: string;
  time: string;
  hours: number;
  amount: string;
  status: PillTone;
  children: string;
};

export default function BookingRequestCard({
  booking,
  onApprove,
  onDecline,
  isUpdating = false,
  isHighlighted = false,
}: {
  booking: BookingRequest;
  onApprove?: () => void;
  onDecline?: () => void;
  isUpdating?: boolean;
  isHighlighted?: boolean;
}) {
  const isPending = booking.status === "pending";

  return (
    <div
      style={{
        background: N.card,
        border: isHighlighted ? `2px solid ${N.green}` : `1px solid ${N.border}`,
        borderRadius: 18,
        padding: "22px 24px",
        boxShadow: isHighlighted ? "0 0 0 4px rgba(45,90,61,.08)" : N.shadow,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <NannyAvatar initials={booking.initials} size={52} tone="cream" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span
              style={{
                fontFamily: "DM Serif Display, var(--font-dm-serif), serif",
                fontSize: 20,
                color: N.greenDk,
              }}
            >
              {booking.parent}
            </span>
            <NannyPill tone={booking.status}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </NannyPill>
          </div>
          <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 18, fontSize: 13.5, color: N.inkMute }}>
            <span>📅 {booking.date}</span>
            <span>🕐 {booking.time}</span>
            <span>👶 {booking.children}</span>
            <span>{booking.hours}h</span>
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div
            style={{
              fontFamily: "DM Serif Display, var(--font-dm-serif), serif",
              fontSize: 24,
              color: N.green,
              lineHeight: 1,
            }}
          >
            {booking.amount}
          </div>
          <div style={{ fontSize: 12.5, color: N.inkFaint, marginTop: 4 }}>CAD</div>
        </div>
      </div>

      {isPending && (
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button style={btnAccept} onClick={onApprove} disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Accept"}
          </button>
          <button style={btnDecline} onClick={onDecline} disabled={isUpdating}>
            Decline
          </button>
          <button style={btnGhost}>Message parent</button>
        </div>
      )}
      {!isPending && (
        <div style={{ marginTop: 16 }}>
          <button style={btnGhost}>View details</button>
        </div>
      )}
    </div>
  );
}
