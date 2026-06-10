import type { StripeBalanceData, StripePayoutData } from "@/src/types/api/payments";
import { formatCurrency } from "@/src/utils/format";

export default function BalanceSummaryCard({
  balance,
  payouts,
  hasStripeAccount,
  isOnboarded,
  isLoading,
}: {
  balance: StripeBalanceData | undefined;
  payouts: StripePayoutData[];
  hasStripeAccount: boolean;
  isOnboarded: boolean;
  isLoading: boolean;
}) {
  const showBalances = hasStripeAccount && isOnboarded;
  const available = balance?.available[0];
  const pending = balance?.pending[0];
  const nextPayout = payouts[0];
  const rows = [
    { label: "Available balance", value: available ? formatCurrency(available.amount, available.currency) : "$0", color: "var(--nanny-green)" },
    { label: "Pending", value: pending ? formatCurrency(pending.amount, pending.currency) : "$0", color: "var(--nanny-amber)" },
    { label: "Next payout", value: nextPayout?.arrival_date ? formatShortDate(nextPayout.arrival_date) : "Not scheduled", color: "var(--nanny-green-dk)" },
  ];

  return (
    <div className="bg-nanny-green-lt border border-nanny-green-mid rounded-[18px] px-7 py-6 shadow-[var(--nanny-shadow)]">
      <h2 className="font-display text-[20px] font-normal text-nanny-green-dk mb-[18px]">
        Balance summary
      </h2>

      {showBalances ? (
        <div className="flex flex-col">
          {isLoading ? (
            <p className="m-0 py-3 text-[14px] text-nanny-ink-soft">Loading payout balance...</p>
          ) : rows.map((r, i) => (
            <div
              key={r.label}
              className="flex justify-between items-center py-[13px]"
              style={{ borderBottom: i < rows.length - 1 ? "1px solid var(--nanny-green-mid)" : "none" }}
            >
              <span className="text-[13.5px] text-nanny-ink-soft">{r.label}</span>
              <span className="font-display text-[22px] leading-none" style={{ color: r.color }}>
                {r.value}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="pt-[10px] pb-[2px]">
          <p className="m-0 text-[14px] leading-[1.6] text-nanny-ink-soft">
            {hasStripeAccount
              ? "Your balance will appear after Stripe finishes onboarding and bookings are completed."
              : "Connect Stripe to unlock payout balances."}
          </p>
          <div className="mt-4 font-display text-[34px] text-nanny-green leading-none">
            $0
          </div>
        </div>
      )}
    </div>
  );
}

function formatShortDate(value: string) {
  if (!value) return "Not scheduled";
  return new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric" }).format(new Date(value));
}
