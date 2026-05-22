import type { Booking } from "@/src/types/api/api";
import { formatCurrency } from "@/src/utils/format";
import { cn } from "@/lib/utils";

type Tone = "green" | "gold" | "rose" | "amber";

const toneClass: Record<Tone, string> = {
  green: "text-nanny-green",
  gold:  "text-[var(--nanny-gold)]",
  rose:  "text-nanny-rose",
  amber: "text-nanny-amber",
};

function StatCard({
  label,
  value,
  sub,
  tone = "green",
}: {
  label: string;
  value: string;
  sub: string;
  tone?: Tone;
}) {
  return (
    <div className="w-[min(220px,72vw)] shrink-0 md:w-auto md:shrink-0 bg-nanny-card border border-nanny-border rounded-[18px] p-5 min-h-[130px] flex flex-col shadow-[var(--nanny-shadow)]">
      <p className="text-[11px] font-semibold tracking-widest uppercase text-nanny-ink-mute">
        {label}
      </p>
      <p className={cn("mt-auto pt-3 font-display text-[42px] leading-none tracking-tight", toneClass[tone])}>
        {value}
      </p>
      <p className="mt-2.5 text-[13px] text-nanny-ink-mute">{sub}</p>
    </div>
  );
}

export default function DashboardStatCards({
  bookings,
  isLoading,
}: {
  bookings: Booking[];
  isLoading: boolean;
}) {
  const approvedCount = bookings.filter((b) => b.status === "approved").length;
  const pendingCount  = bookings.filter((b) => b.status === "pending").length;
  const estimatedEarnings = bookings
    .filter((b) => b.status === "approved")
    .reduce((sum, b) => sum + b.total_amount, 0);

  return (
    /* Mobile: horizontal scroll strip. Desktop: 4-col grid */
    <div className="flex gap-3 overflow-x-auto pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] md:grid md:grid-cols-4 md:overflow-visible md:gap-4">
      <StatCard
        label="Approved value"
        value={isLoading ? "..." : formatCurrency(estimatedEarnings)}
        sub={`${approvedCount} approved bookings`}
        tone="green"
      />
      <StatCard
        label="Pending requests"
        value={isLoading ? "..." : String(pendingCount)}
        sub="Awaiting your response"
        tone="amber"
      />
      <StatCard label="Your rating"     value="4.9"  sub="Profile rating coming soon" tone="gold" />
      <StatCard label="Response rate"   value="98%"  sub="Manual metric for now"      tone="green" />
    </div>
  );
}
