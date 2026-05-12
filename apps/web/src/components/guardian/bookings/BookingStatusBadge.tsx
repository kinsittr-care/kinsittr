import type { BookingStatus } from "@/src/types/api/api";
import { formatBookingStatus } from "./booking-helpers";

const statusStyles: Record<BookingStatus, React.CSSProperties> = {
  pending: {
    background: "#fff7df",
    color: "#8f6b00",
    border: "1px solid #eed787",
  },
  approved: {
    background: "var(--teal-lt)",
    color: "var(--teal)",
    border: "1px solid var(--teal-mid)",
  },
  declined: {
    background: "#f7eceb",
    color: "#a84b43",
    border: "1px solid #e7c7c3",
  },
  cancelled: {
    background: "#f0ede8",
    color: "var(--muted)",
    border: "1px solid var(--border)",
  },
};

export default function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      style={{
        fontSize: 11.5,
        padding: "3px 9px",
        borderRadius: 20,
        fontWeight: 500,
        ...statusStyles[status],
      }}
    >
      {formatBookingStatus(status)}
    </span>
  );
}
