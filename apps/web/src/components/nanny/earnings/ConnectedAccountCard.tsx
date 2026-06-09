import { cn } from "@/lib/utils";
import type { NannyPayoutSchedule, StripePayoutData, StripeStatusData } from "@/src/types/api/payments";
import { formatShortDate } from "@/src/utils/format";

export default function ConnectedAccountCard({
  status,
  payouts,
  schedule,
}: {
  status: StripeStatusData | undefined;
  payouts: StripePayoutData[];
  schedule: NannyPayoutSchedule | undefined;
}) {
  const connected = Boolean(status?.account_id);
  const onboarded = Boolean(status?.onboarded);
  const nextPayout = payouts[0];
  const statusLabel = onboarded ? "Active" : connected ? "Setup incomplete" : "Not connected";

  return (
    <div className="bg-nanny-card border border-nanny-border rounded-[18px] px-[26px] py-6 shadow-[var(--nanny-shadow)]">
      <div className="flex items-center justify-between mb-[18px] gap-3">
        <h2 className="font-display text-[20px] font-normal text-nanny-green-dk">
          Connected account
        </h2>
        <span
          className={cn(
            "text-[12px] font-semibold px-[10px] py-1 rounded-full whitespace-nowrap border",
            onboarded
              ? "text-nanny-green bg-nanny-green-lt border-nanny-green-mid"
              : connected
                ? "text-nanny-amber bg-nanny-amber-lt border-nanny-border"
                : "text-nanny-ink-faint bg-nanny-card-soft border-nanny-border",
          )}
        >
          {statusLabel}
        </span>
      </div>

      <div className="flex flex-col gap-[14px]">
        <DetailRow label="Stripe" value={connected ? "Express account connected" : "Not connected"} />
        <Divider />
        <DetailRow label="Next payout" value={nextPayout?.arrival_date ? formatShortDate(nextPayout.arrival_date) : "Not scheduled"} highlight />
        <Divider />
        <DetailRow label="Schedule" value={schedule ?? "weekly"} capitalize />
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  highlight = false,
  capitalize = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div className="flex justify-between items-center gap-3">
      <span className="text-[13.5px] text-nanny-ink-faint">{label}</span>
      <span className={cn("text-[14px] font-semibold text-right", highlight ? "text-nanny-green" : "text-nanny-green-dk", capitalize && "capitalize")}>
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-nanny-border-soft" />;
}
