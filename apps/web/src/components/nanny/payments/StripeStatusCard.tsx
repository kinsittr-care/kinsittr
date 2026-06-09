"use client";

import type { ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { btnPrimaryCls } from "../nanny-styles";
import {
  createNannyStripeConnectLink,
  nannyStripeStatusQueryKey,
} from "@/src/utils/api/payments";
import type { StripeStatusData } from "@/src/types/api/payments";

interface StripeStatusCardProps {
  status: StripeStatusData | undefined;
  isLoading: boolean;
  error: Error | null;
  onRefresh: () => void;
}

export default function StripeStatusCard({ status, isLoading, error, onRefresh }: StripeStatusCardProps) {
  const queryClient = useQueryClient();
  const connectMutation = useMutation({
    mutationFn: createNannyStripeConnectLink,
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: nannyStripeStatusQueryKey });
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    },
  });
  const connected = Boolean(status?.account_id);
  const onboarded = Boolean(status?.onboarded);
  const statusTone = onboarded ? "connected" : connected ? "needs_setup" : "not_connected";
  const statusLabel = onboarded ? "Connected" : connected ? "Setup incomplete" : "Not connected";
  const requirements = status?.requirements_currently_due ?? [];
  const statusCopy = isLoading
    ? "Checking your Stripe setup..."
    : onboarded
      ? "Your Stripe account is ready. KinSittr can send payouts after completed bookings."
      : connected
        ? "Stripe still needs identity, tax, or bank details before payouts can be enabled."
        : "Parents pay through KinSittr. Stripe sends payouts to your bank after completed bookings.";

  return (
    <div className="flex flex-col gap-5 p-6 sm:p-7 lg:flex-row lg:items-center bg-nanny-card border border-nanny-border rounded-[18px] shadow-[var(--nanny-shadow)]">
      <div className="flex flex-1 gap-4">
        <div className="w-12 h-12 rounded-xl bg-nanny-green-lt border border-nanny-green-mid flex items-center justify-center shrink-0">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="2" y="5" width="18" height="12" rx="3" stroke="var(--nanny-green)" strokeWidth="1.6" />
            <path d="M2 10h18" stroke="var(--nanny-green)" strokeWidth="1.6" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-semibold text-nanny-green-dk">Stripe Connect</div>
          <div className="mt-1 text-[13.5px] text-nanny-ink-faint leading-[1.55]">
            {statusCopy}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusPill tone={statusTone}>{statusLabel}</StatusPill>
            {connected && !onboarded && <StatusPill tone="review">Action required in Stripe</StatusPill>}
            {onboarded && <StatusPill tone="connected">Payouts enabled</StatusPill>}
          </div>
          {connected && !onboarded && (requirements.length > 0 || status?.disabled_reason) && (
            <div className="mt-[10px] text-[12.5px] leading-[1.55] text-nanny-ink-faint">
              {status?.disabled_reason && <div>Stripe reason: {status.disabled_reason.replaceAll("_", " ")}</div>}
              {requirements.length > 0 && <div>Still needed: {requirements.slice(0, 3).map(formatRequirement).join(", ")}{requirements.length > 3 ? "..." : ""}</div>}
            </div>
          )}
          {(error || connectMutation.error) && (
            <div className="mt-2 text-[12.5px] text-[#b34b39]">
              {(error ?? connectMutation.error) instanceof Error
                ? (error ?? connectMutation.error)?.message
                : "Unable to load Stripe status."}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-nanny-border bg-nanny-card-soft p-4 lg:w-[300px]">
        <div className="text-[12px] font-bold tracking-[0.08em] uppercase text-nanny-ink-faint">
          Next step
        </div>
        <p className="mt-2 mb-[14px] text-[13.5px] leading-[1.55] text-nanny-ink-faint">
          {onboarded
            ? "Use Stripe Express to update payout details or review account status."
            : connected
              ? "Continue setup in Stripe to finish identity and bank verification."
              : "Start Stripe Express onboarding. You’ll leave KinSittr and return after setup."}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
          <button
            className={btnPrimaryCls}
            disabled={connectMutation.isPending}
            onClick={() => connectMutation.mutate()}
          >
            {connectMutation.isPending ? "Opening Stripe..." : onboarded ? "Manage Stripe" : connected ? "Continue setup" : "Connect Stripe"}
          </button>
          <button
            type="button"
            className="px-[14px] py-[10px] bg-transparent border border-nanny-border rounded-[10px] text-[13.5px] text-nanny-green-dk font-semibold cursor-pointer"
            onClick={onRefresh}
          >
            Refresh status
          </button>
        </div>
        <p className="mt-[10px] mb-0 text-[12.5px] leading-[1.5] text-nanny-ink-faint">
          KinSittr does not store your SIN, bank account, or tax identity details.
        </p>
      </div>
    </div>
  );
}

function formatRequirement(value: string) {
  return value.replaceAll("_", " ").replaceAll(".", " ");
}

const pillToneCls: Record<"connected" | "needs_setup" | "not_connected" | "review", string> = {
  connected: "text-nanny-green bg-nanny-green-lt border-nanny-green-mid",
  needs_setup: "text-nanny-amber bg-nanny-amber-lt border-nanny-border",
  not_connected: "text-nanny-ink-faint bg-nanny-card-soft border-nanny-border",
  review: "text-nanny-green-dk bg-nanny-card-soft border-nanny-border",
};

function StatusPill({ tone, children }: { tone: "connected" | "needs_setup" | "not_connected" | "review"; children: ReactNode }) {
  return (
    <span className={cn("text-[12.5px] font-bold border px-[10px] py-[5px] rounded-full whitespace-nowrap", pillToneCls[tone])}>
      {children}
    </span>
  );
}
