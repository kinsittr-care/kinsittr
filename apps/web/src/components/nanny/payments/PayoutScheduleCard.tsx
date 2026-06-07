"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { N } from "../tokens";
import { labelStyle } from "../nanny-styles";
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
    <div
      className="p-5 sm:p-7"
      style={{ background: N.card, border: `1px solid ${N.border}`, borderRadius: 18, boxShadow: N.shadow }}
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
        Payout schedule
      </h2>

      <label style={labelStyle}>Bank account</label>
      <div
        className="flex flex-wrap items-center justify-between gap-2"
        style={{
          padding: "12px 16px",
          background: N.cardSoft,
          border: `1px solid ${N.border}`,
          borderRadius: 10,
          marginBottom: 20,
          opacity: disabled ? 0.7 : 1,
        }}
      >
        <span style={{ fontSize: 14, color: N.greenDk, fontWeight: 500 }}>
          {disabled ? "Managed securely in Stripe" : "Connected through Stripe"}
        </span>
        <button
          disabled={disabled}
          style={{
            fontSize: 13,
            color: disabled ? N.inkFaint : N.green,
            background: "transparent",
            border: "none",
            cursor: disabled ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          Manage
        </button>
      </div>

      <label style={labelStyle}>Schedule</label>
      <div style={{ display: "flex", gap: 10 }}>
        {(["daily", "weekly"] as NannyPayoutSchedule[]).map((s) => (
          <button
            key={s}
            disabled={disabled || updateMutation.isPending}
            onClick={() => chooseSchedule(s)}
            style={{
              flex: 1,
              padding: "11px 0",
              borderRadius: 10,
              fontSize: 13.5,
              fontWeight: schedule === s ? 600 : 500,
              color: schedule === s ? N.green : N.inkMute,
              background: schedule === s ? N.greenLt : N.cardSoft,
              border: `1px solid ${schedule === s ? N.greenMid : N.border}`,
              cursor: disabled || updateMutation.isPending ? "not-allowed" : "pointer",
              opacity: disabled || updateMutation.isPending ? 0.55 : 1,
              transition: "all .15s",
              textTransform: "capitalize",
            }}
          >
            {s}
          </button>
        ))}
      </div>
      {disabled && <p style={{ margin: "12px 0 0", fontSize: 12.5, lineHeight: 1.5, color: N.inkFaint }}>{disabledCopy}</p>}
      {updateMutation.isError && (
        <p style={{ margin: "12px 0 0", fontSize: 12.5, lineHeight: 1.5, color: "#b34b39" }}>
          {updateMutation.error instanceof Error ? updateMutation.error.message : "Unable to update payout schedule."}
        </p>
      )}
    </div>
  );
}
