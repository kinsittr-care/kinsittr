import AdminPill, { type PillTone } from "./AdminPill";
import type { AdminBooking } from "@/src/types/api/admin";
import { formatCurrency, formatDateOnlyShort, formatPaymentState } from "@/src/utils/format";

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
    <div className="overflow-hidden rounded-2xl border border-admin-border bg-admin-card shadow-[var(--admin-shadow)]">
      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-admin-divider bg-admin-card-warm text-[11.5px] font-semibold uppercase tracking-[.14em] text-admin-ink-soft">
            <tr>
              <th className="px-6 py-[14px]">ID</th>
              <th className="px-6 py-[14px]">Nanny</th>
              <th className="px-6 py-[14px]">Parent</th>
              <th className="px-6 py-[14px]">Date</th>
              <th className="px-6 py-[14px]">Hours</th>
              <th className="px-6 py-[14px]">Total</th>
              <th className="px-6 py-[14px]">Status</th>
              <th className="px-6 py-[14px]">Payment</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td className="p-6 text-admin-ink-soft" colSpan={8}>Loading bookings...</td></tr>
            ) : bookings.length === 0 ? (
              <tr><td className="p-6 text-admin-ink-soft" colSpan={8}>No bookings found.</td></tr>
            ) : (
              bookings.map((booking, index) => (
                <BookingTableRow
                  key={booking.id}
                  booking={booking}
                  selected={selectedBookingId === booking.id}
                  showBorder={index < bookings.length - 1}
                  onSelect={onSelect}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="xl:hidden">
        {isLoading ? (
          <div className="p-6 text-admin-ink-soft">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="p-6 text-admin-ink-soft">No bookings found.</div>
        ) : (
          bookings.map((booking, index) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              selected={selectedBookingId === booking.id}
              showBorder={index < bookings.length - 1}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}

function PaymentPill({ booking }: { booking: AdminBooking }) {
  const payment = formatPaymentState(booking.payment_status);
  const tone =
    payment.tone === "danger"
      ? "red"
      : payment.tone === "success"
        ? "green"
        : payment.tone === "warning"
          ? "amber"
          : "neutral";

  return <AdminPill tone={tone}>{payment.label}</AdminPill>;
}

function BookingTableRow({
  booking,
  selected,
  showBorder,
  onSelect,
}: {
  booking: AdminBooking;
  selected: boolean;
  showBorder: boolean;
  onSelect: (bookingId: string) => void;
}) {
  return (
    <tr
      className="admin-table-row cursor-pointer transition-colors duration-150"
      style={{
        background: selected ? "var(--admin-card-warm)" : "transparent",
        borderBottom: showBorder ? "1px solid var(--admin-border-soft)" : "none",
      }}
      onClick={() => onSelect(booking.id)}
    >
      <td className="px-6 py-4 font-mono text-[12px] tracking-[.02em] text-admin-ink-soft">{booking.id.slice(0, 8)}</td>
      <td className="px-6 py-4 text-[14.5px] font-semibold text-admin-ink">{booking.nanny_display_name}</td>
      <td className="px-6 py-4 text-[14px] text-admin-ink-mid">{booking.parent_display_name}</td>
      <td className="px-6 py-4 text-[13.5px] text-admin-ink-soft">{formatDateOnlyShort(booking.date)}</td>
      <td className="px-6 py-4 text-[14.5px] font-medium text-admin-ink">{booking.duration}h</td>
      <td className="px-6 py-4 font-display text-[18px] text-admin-clay">{formatCurrency(booking.total_amount)}</td>
      <td className="px-6 py-4"><AdminPill tone={bookingStatusTone(booking.status)}>{booking.status}</AdminPill></td>
      <td className="px-6 py-4"><PaymentPill booking={booking} /></td>
    </tr>
  );
}

function BookingCard({
  booking,
  selected,
  showBorder,
  onSelect,
}: {
  booking: AdminBooking;
  selected: boolean;
  showBorder: boolean;
  onSelect: (bookingId: string) => void;
}) {
  return (
    <button
      type="button"
      className="admin-table-row block w-full cursor-pointer px-4 py-4 text-left transition-colors duration-150 sm:px-6"
      style={{
        background: selected ? "var(--admin-card-warm)" : "transparent",
        borderBottom: showBorder ? "1px solid var(--admin-border-soft)" : "none",
      }}
      onClick={() => onSelect(booking.id)}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-mono text-[12px] tracking-[.02em] text-admin-ink-soft">#{booking.id.slice(0, 8)}</div>
          <div className="mt-1 truncate text-[15px] font-semibold text-admin-ink">{booking.nanny_display_name}</div>
          <div className="truncate text-[12.5px] text-admin-ink-soft">Parent: {booking.parent_display_name}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <AdminPill tone={bookingStatusTone(booking.status)}>{booking.status}</AdminPill>
          <PaymentPill booking={booking} />
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-[13.5px] text-admin-ink-mid sm:grid-cols-4">
        <Meta label="Date" value={formatDateOnlyShort(booking.date)} />
        <Meta label="Hours" value={`${booking.duration}h`} />
        <Meta label="Total" value={formatCurrency(booking.total_amount)} />
        <Meta label="Status" value={booking.status} />
      </div>
    </button>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-[.08em] text-admin-ink-soft">{label}</div>
      <div className="mt-1 text-admin-ink-mid">{value}</div>
    </div>
  );
}
