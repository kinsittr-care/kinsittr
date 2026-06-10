import type { Booking } from "@/src/types/api/api";
import { formatCurrency, formatTimeRange, formatWeekdayDateOnly } from "@/src/utils/format";
import { N } from "../tokens";
import NannyAvatar from "../NannyAvatar";
import NannyPill from "../NannyPill";

function getInitials(name?: string) {
  return (name || "Parent")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
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
    <div className="bg-nanny-card border border-nanny-border rounded-[18px] px-[26px] py-6 shadow-[var(--nanny-shadow)]">
      <h2 className="font-display text-[22px] font-normal text-nanny-green-dk tracking-[-0.005em] mb-4">
        Upcoming bookings
      </h2>
      <div className="flex flex-col">
        {isLoading && (
          <div className="py-5 text-nanny-ink-faint text-sm">
            Loading bookings...
          </div>
        )}

        {isError && (
          <div className="py-5 text-nanny-rose text-sm">
            {errorMessage}
          </div>
        )}

        {!isLoading && !isError && bookings.length === 0 && (
          <div className="py-5 text-nanny-ink-faint text-sm">
            No upcoming bookings yet.
          </div>
        )}

        {bookings.map((b, i) => (
          <div
            key={b.id}
            className="flex items-center gap-3.5 py-3.5"
            style={{ borderBottom: i < bookings.length - 1 ? `1px solid ${N.borderSoft}` : "none" }}
          >
            <NannyAvatar initials={getInitials(b.parent_display_name)} size={40} tone="cream" />
            <div className="flex-1 min-w-0">
              <div className="text-[14.5px] font-semibold text-nanny-green-dk">{b.parent_display_name || "Parent"}</div>
              <div className="text-[13px] text-nanny-ink-faint mt-[3px]">
                {formatWeekdayDateOnly(b.date)} · {formatTimeRange(b.start_time, b.duration)}
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-lg text-nanny-green">
                {formatCurrency(b.total_amount)}
              </div>
              <div className="mt-[5px]">
                <NannyPill tone={b.status === "cancelled" ? "neutral" : b.status}>{b.status.charAt(0).toUpperCase() + b.status.slice(1)}</NannyPill>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
