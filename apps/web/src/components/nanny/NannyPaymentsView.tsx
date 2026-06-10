"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import StripeStatusCard from "./payments/StripeStatusCard";
import PayoutScheduleCard from "./payments/PayoutScheduleCard";
import IdentityTaxCard from "./payments/IdentityTaxCard";
import BalanceSummaryCard from "./payments/BalanceSummaryCard";
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
    queryFn: () => listNannyStripePayouts(),
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
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[900px] mx-auto px-4 pt-6 pb-16 md:px-12 md:pt-10 md:pb-20">
      <div className="mb-7 md:mb-8">
        <h1 className="font-display text-[36px] font-normal text-nanny-green-dk leading-[1.1]">
          Payment Settings
        </h1>
        <p className="mt-2 text-[14.5px] text-nanny-ink-faint">
          Manage your banking, payout schedule, and tax information.
        </p>
      </div>

      <div className="flex flex-col gap-[18px]">
        <StripeStatusCard
          status={status}
          isLoading={statusQuery.isLoading || statusQuery.isFetching}
          error={statusQuery.error instanceof Error ? statusQuery.error : null}
          onRefresh={() => void statusQuery.refetch()}
        />

        <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] xl:grid xl:grid-cols-[1.2fr_1fr] xl:gap-[18px] xl:overflow-visible">
          <div className="w-[min(340px,82vw)] shrink-0 xl:w-auto xl:shrink">
            <PayoutScheduleCard
              disabled={!isOnboarded}
              hasStripeAccount={hasStripeAccount}
              settings={settingsQuery.data?.data}
            />
          </div>
          <div className="w-[min(300px,78vw)] shrink-0 xl:w-auto xl:shrink">
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
      </div>
      </div>
    </div>
  );
}
