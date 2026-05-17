import PayoutHistoryTable from "./earnings/PayoutHistoryTable";
import ConnectedAccountCard from "./earnings/ConnectedAccountCard";

function EarningsStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="w-[min(200px,72vw)] shrink-0 md:w-auto md:shrink-0 bg-nanny-card border border-nanny-border rounded-[18px] p-5 min-h-[130px] flex flex-col shadow-[var(--nanny-shadow)]">
      <p className="text-[11px] font-semibold tracking-widest uppercase text-nanny-ink-mute">{label}</p>
      <p className="mt-auto pt-3 font-display text-[40px] leading-none tracking-tight text-nanny-green">{value}</p>
      <p className="mt-2.5 text-[13px] text-nanny-ink-mute">{sub}</p>
    </div>
  );
}

export default function NannyEarningsView() {
  return (
    <div className="flex-1 overflow-y-auto px-4 pt-6 pb-16 md:px-12 md:pt-10 md:pb-20">
      <div className="mb-7 md:mb-8">
        <h1 className="font-display text-[28px] md:text-[36px] font-normal text-nanny-green-dk leading-tight">
          Earnings
        </h1>
        <p className="mt-2 text-sm md:text-[14.5px] text-nanny-ink-mute">April 2026 · Canada</p>
      </div>

      {/* Stat cards — horizontal scroll on mobile, 3-col grid on desktop */}
      <div className="flex gap-3 overflow-x-auto pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] md:grid md:grid-cols-3 md:overflow-visible md:gap-4 mb-5">
        <EarningsStat label="This month" value="$1,840" sub="11 bookings" />
        <EarningsStat label="Last month" value="$1,640" sub="9 bookings"  />
        <EarningsStat label="All time"   value="$9,280" sub="52 bookings" />
      </div>

      {/* Payout history + account — column on mobile, side-by-side on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr] gap-4">
        <PayoutHistoryTable />
        <ConnectedAccountCard />
      </div>
    </div>
  );
}
