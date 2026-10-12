"use client";

import type { ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
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

  const nextStepCopy = onboarded
    ? "Use Stripe Express to update payout details or review account status."
    : connected
      ? "Continue setup in Stripe to finish identity and bank verification."
      : "Start Stripe Express onboarding. You’ll leave KinSittr and return after setup.";

  return (
    <div className="grid gap-[18px] xl:grid-cols-2">
      <div className="bg-nanny-card border border-nanny-border rounded-[24px] p-6 shadow-[var(--nanny-shadow)] sm:p-8">
        <div className="flex gap-4">
          <div className="w-14 h-14 rounded-2xl bg-nanny-green-lt border border-nanny-green-mid flex items-center justify-center shrink-0">
            <svg width="24" height="24" viewBox="0 0 22 22" fill="none">
              <rect x="2" y="5" width="18" height="12" rx="3" stroke="var(--nanny-green)" strokeWidth="1.8" />
              <path d="M2 10h18" stroke="var(--nanny-green)" strokeWidth="1.8" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="text-[22px] font-bold text-nanny-green-dk">Stripe Connect</div>
            <div className="mt-1 text-[15px] text-nanny-ink-faint">Express account</div>
          </div>
        </div>

        <p className="mt-7 text-[17px] leading-8 text-nanny-ink">
          {statusCopy}
        </p>

        <div className="mt-6 flex flex-wrap gap-2.5">
          <StatusPill tone={statusTone}>{statusLabel}</StatusPill>
          {connected && !onboarded && <StatusPill tone="review">Action required in Stripe</StatusPill>}
          {onboarded && <StatusPill tone="connected">Payouts enabled</StatusPill>}
        </div>

        {connected && !onboarded && (requirements.length > 0 || status?.disabled_reason) && (
          <div className="mt-[14px] text-[13px] leading-[1.55] text-nanny-ink-faint">
            {status?.disabled_reason && <div>Stripe reason: {status.disabled_reason.replaceAll("_", " ")}</div>}
            {requirements.length > 0 && <div>Still needed: {requirements.slice(0, 3).map(formatRequirement).join(", ")}{requirements.length > 3 ? "..." : ""}</div>}
          </div>
        )}

        {(error || connectMutation.error) && (
          <div className="mt-3 text-[13px] text-[#b34b39]">
            {(error ?? connectMutation.error) instanceof Error
              ? (error ?? connectMutation.error)?.message
              : "Unable to load Stripe status."}
          </div>
        )}
      </div>

      <div className="bg-nanny-card-soft border border-nanny-border rounded-[24px] p-6 shadow-[var(--nanny-shadow)] sm:p-8">
        <div className="text-[13px] font-black tracking-[0.18em] uppercase text-nanny-ink-faint">
          Next step
        </div>
        <p className="mt-6 text-[18px] leading-8 text-nanny-ink">
          {nextStepCopy}
        </p>
        <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-1">
          <button
            className={cn(btnPrimaryCls, "w-full justify-center whitespace-nowrap text-center text-[15px] sm:text-[16px]")}
            disabled={connectMutation.isPending}
            onClick={() => connectMutation.mutate()}
          >
            <span>{connectMutation.isPending ? "Opening Stripe..." : onboarded ? "Manage Stripe" : connected ? "Continue setup" : "Connect Stripe"}</span>
            {!connectMutation.isPending && <ArrowUpRight className="size-5" aria-hidden="true" />}
          </button>
          <button
            type="button"
            className="w-full rounded-[12px] border border-nanny-border bg-nanny-card px-3.5 py-3 text-center text-[15px] font-bold text-nanny-green-dk cursor-pointer"
            onClick={onRefresh}
          >
            Refresh status
          </button>
        </div>
        <p className="mt-6 mb-0 text-[14px] leading-6 text-nanny-ink-faint">
          KinSittr never stores your SIN, bank account or tax identity details.
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
