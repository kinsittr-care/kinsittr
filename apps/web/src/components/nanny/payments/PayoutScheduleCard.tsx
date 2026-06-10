"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { labelCls } from "../nanny-styles";
import type { NannyPayoutSettingsData, NannyPayoutSchedule } from "@/src/types/api/payments";
import { nannyPayoutSettingsQueryKey, updateNannyPayoutSettings } from "@/src/utils/api/payments";

export default function PayoutScheduleCard({
  disabled,
  hasStripeAccount,
  settings,
}: {
  disabled: boolean;
  hasStripeAccount: boolean;
  settings: NannyPayoutSettingsData | undefined;
}) {
  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: updateNannyPayoutSettings,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: nannyPayoutSettingsQueryKey });
    },
  });
  const schedule = updateMutation.isPending ? updateMutation.variables.schedule : settings?.schedule ?? "weekly";
  const disabledCopy = hasStripeAccount
    ? "Finish Stripe setup before changing payout preferences."
    : "Connect Stripe before choosing a payout schedule.";

  function chooseSchedule(nextSchedule: NannyPayoutSchedule) {
    updateMutation.mutate({ schedule: nextSchedule });
  }

  return (
    <div className="p-5 sm:p-7 bg-nanny-card border border-nanny-border rounded-[18px] shadow-[var(--nanny-shadow)]">
      <h2 className="font-display text-[20px] font-normal text-nanny-green-dk mb-[18px]">
        Payout schedule
      </h2>

      <label className={labelCls}>Bank account</label>
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-nanny-card-soft border border-nanny-border rounded-[10px] mb-5",
          disabled && "opacity-70",
        )}
      >
        <span className="text-[14px] text-nanny-green-dk font-medium">
          {disabled ? "Managed securely in Stripe" : "Connected through Stripe"}
        </span>
        <button
          disabled={disabled}
          className={cn(
            "text-[13px] bg-transparent border-none font-semibold",
            disabled ? "text-nanny-ink-faint cursor-not-allowed" : "text-nanny-green cursor-pointer",
          )}
        >
          Manage
        </button>
      </div>

      <label className={labelCls}>Schedule</label>
      <div className="flex gap-[10px]">
        {(["daily", "weekly"] as NannyPayoutSchedule[]).map((s) => (
          <button
            key={s}
            disabled={disabled || updateMutation.isPending}
            onClick={() => chooseSchedule(s)}
            className={cn(
              "flex-1 py-[11px] rounded-[10px] text-[13.5px] capitalize transition-all duration-150",
              schedule === s
                ? "font-semibold text-nanny-green bg-nanny-green-lt border border-nanny-green-mid"
                : "font-medium text-nanny-ink-faint bg-nanny-card-soft border border-nanny-border",
              (disabled || updateMutation.isPending) ? "cursor-not-allowed opacity-55" : "cursor-pointer",
            )}
          >
            {s}
          </button>
        ))}
      </div>
      {disabled && <p className="mt-3 mb-0 text-[12.5px] leading-[1.5] text-nanny-ink-faint">{disabledCopy}</p>}
      {updateMutation.isError && (
        <p className="mt-3 mb-0 text-[12.5px] leading-[1.5] text-[#b34b39]">
          {updateMutation.error instanceof Error ? updateMutation.error.message : "Unable to update payout schedule."}
        </p>
      )}
    </div>
  );
}
