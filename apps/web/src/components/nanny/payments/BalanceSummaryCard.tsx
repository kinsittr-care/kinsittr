import { N } from "../tokens";
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
    { label: "Available balance", value: available ? formatCurrency(available.amount, available.currency) : "$0", color: N.green },
    { label: "Pending", value: pending ? formatCurrency(pending.amount, pending.currency) : "$0", color: N.amber },
    { label: "Next payout", value: nextPayout?.arrival_date ? formatShortDate(nextPayout.arrival_date) : "Not scheduled", color: N.greenDk },
  ];

  return (
    <div
      style={{
        background: N.greenLt,
        border: `1px solid ${N.greenMid}`,
        borderRadius: 18,
        padding: "24px 28px",
        boxShadow: N.shadow,
      }}
    >
      <h2
        style={{
          fontFamily: "DM Serif Display, var(--font-dm-serif), serif",
          fontSize: 20,
          fontWeight: 400,
          color: N.greenDk,
          marginBottom: 18,
        }}
      >
        Balance summary
      </h2>

      {showBalances ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {isLoading ? (
            <p style={{ margin: 0, padding: "12px 0", fontSize: 14, color: N.inkSoft }}>Loading payout balance...</p>
          ) : rows.map((r, i) => (
            <div
              key={r.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "13px 0",
                borderBottom: i < rows.length - 1 ? `1px solid ${N.greenMid}` : "none",
              }}
            >
              <span style={{ fontSize: 13.5, color: N.inkSoft }}>{r.label}</span>
              <span
                style={{
                  fontFamily: "DM Serif Display, var(--font-dm-serif), serif",
                  fontSize: 22,
                  color: r.color,
                  lineHeight: 1,
                }}
              >
                {r.value}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: "10px 0 2px" }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: N.inkSoft }}>
            {hasStripeAccount
              ? "Your balance will appear after Stripe finishes onboarding and bookings are completed."
              : "Connect Stripe to unlock payout balances."}
          </p>
          <div style={{ marginTop: 16, fontFamily: "DM Serif Display, var(--font-dm-serif), serif", fontSize: 34, color: N.green, lineHeight: 1 }}>
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
