"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { N } from "./tokens";
import StripeStatusCard from "./payments/StripeStatusCard";
import PayoutScheduleCard from "./payments/PayoutScheduleCard";
import IdentityTaxCard from "./payments/IdentityTaxCard";
import BalanceSummaryCard from "./payments/BalanceSummaryCard";
import { btnPrimary } from "./nanny-styles";
import {
  getNannyPayoutSettings,
  getNannyStripeBalance,
  getNannyStripeStatus,
  listNannyStripePayouts,
  nannyPayoutSettingsQueryKey,
  nannyStripeBalanceQueryKey,
  nannyStripePayoutsQueryKey,
  nannyStripeStatusQueryKey,
} from "@/src/utils/api/payments";

export default function NannyPaymentsView() {
  const statusQuery = useQuery({
    queryKey: nannyStripeStatusQueryKey,
    queryFn: getNannyStripeStatus,
  });
  const status = statusQuery.data?.data;
  const hasStripeAccount = Boolean(status?.account_id);
  const isOnboarded = Boolean(status?.onboarded);
  const balanceQuery = useQuery({
    queryKey: nannyStripeBalanceQueryKey,
    queryFn: getNannyStripeBalance,
    enabled: isOnboarded,
  });
  const payoutsQuery = useQuery({
    queryKey: nannyStripePayoutsQueryKey,
    queryFn: listNannyStripePayouts,
    enabled: isOnboarded,
  });
  const settingsQuery = useQuery({
    queryKey: nannyPayoutSettingsQueryKey,
    queryFn: getNannyPayoutSettings,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("stripe")) {
      void statusQuery.refetch();
    }
  }, [statusQuery]);

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-6 pb-16 md:px-12 md:pt-10 md:pb-20">
      <div className="mb-7 md:mb-8">
        <h1
          style={{
            fontFamily: "DM Serif Display, var(--font-dm-serif), serif",
            fontSize: 36,
            fontWeight: 400,
            color: N.greenDk,
            lineHeight: 1.1,
          }}
        >
          Payment Settings
        </h1>
        <p style={{ marginTop: 8, fontSize: 14.5, color: N.inkMute }}>
          Manage your banking, payout schedule, and tax information.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <StripeStatusCard
          status={status}
          isLoading={statusQuery.isLoading || statusQuery.isFetching}
          error={statusQuery.error instanceof Error ? statusQuery.error : null}
          onRefresh={() => void statusQuery.refetch()}
        />

        <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] md:grid md:grid-cols-[1.2fr_1fr] md:gap-[18px] md:overflow-visible">
          <div className="w-[min(340px,82vw)] shrink-0 md:w-auto md:shrink">
            <PayoutScheduleCard
              disabled={!isOnboarded}
              hasStripeAccount={hasStripeAccount}
              settings={settingsQuery.data?.data}
            />
          </div>
          <div className="w-[min(300px,78vw)] shrink-0 md:w-auto md:shrink">
            <BalanceSummaryCard
              balance={balanceQuery.data?.data}
              payouts={payoutsQuery.data?.data?.items ?? []}
              hasStripeAccount={hasStripeAccount}
              isOnboarded={isOnboarded}
              isLoading={balanceQuery.isLoading || payoutsQuery.isLoading}
            />
          </div>
        </div>

        <IdentityTaxCard hasStripeAccount={hasStripeAccount} isOnboarded={isOnboarded} />

        <div>
          <button style={{ ...btnPrimary, opacity: isOnboarded ? 1 : 0.55, cursor: isOnboarded ? "pointer" : "not-allowed" }} disabled={!isOnboarded}>
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
