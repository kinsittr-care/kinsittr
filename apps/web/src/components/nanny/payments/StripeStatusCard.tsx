"use client";

import type { ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { N } from "../tokens";
import { btnPrimary } from "../nanny-styles";
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
    <div
      className="flex flex-col gap-5 p-6 sm:p-7 lg:flex-row lg:items-center"
      style={{ background: N.card, border: `1px solid ${N.border}`, borderRadius: 18, boxShadow: N.shadow }}
    >
      <div className="flex flex-1 gap-4">
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: N.greenLt,
            border: `1px solid ${N.greenMid}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="2" y="5" width="18" height="12" rx="3" stroke={N.green} strokeWidth="1.6" />
            <path d="M2 10h18" stroke={N.green} strokeWidth="1.6" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: N.greenDk }}>Stripe Connect</div>
          <div style={{ marginTop: 4, fontSize: 13.5, color: N.inkMute, lineHeight: 1.55 }}>
            {statusCopy}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusPill tone={statusTone}>{statusLabel}</StatusPill>
            {connected && !onboarded && <StatusPill tone="review">Action required in Stripe</StatusPill>}
            {onboarded && <StatusPill tone="connected">Payouts enabled</StatusPill>}
          </div>
          {connected && !onboarded && (requirements.length > 0 || status?.disabled_reason) && (
            <div style={{ marginTop: 10, fontSize: 12.5, lineHeight: 1.55, color: N.inkFaint }}>
              {status?.disabled_reason && <div>Stripe reason: {status.disabled_reason.replaceAll("_", " ")}</div>}
              {requirements.length > 0 && <div>Still needed: {requirements.slice(0, 3).map(formatRequirement).join(", ")}{requirements.length > 3 ? "..." : ""}</div>}
            </div>
          )}
          {(error || connectMutation.error) && (
            <div style={{ marginTop: 8, fontSize: 12.5, color: "#b34b39" }}>
              {(error ?? connectMutation.error) instanceof Error
                ? (error ?? connectMutation.error)?.message
                : "Unable to load Stripe status."}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border p-4 lg:w-[300px]" style={{ borderColor: N.border, background: N.cardSoft }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: N.inkFaint }}>
          Next step
        </div>
        <p style={{ marginTop: 8, marginBottom: 14, fontSize: 13.5, lineHeight: 1.55, color: N.inkMute }}>
          {onboarded
            ? "Use Stripe Express to update payout details or review account status."
            : connected
              ? "Continue setup in Stripe to finish identity and bank verification."
              : "Start Stripe Express onboarding. You’ll leave KinSittr and return after setup."}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
          <button
            style={btnPrimary}
            disabled={connectMutation.isPending}
            onClick={() => connectMutation.mutate()}
          >
            {connectMutation.isPending ? "Opening Stripe..." : onboarded ? "Manage Stripe" : connected ? "Continue setup" : "Connect Stripe"}
          </button>
          <button
            type="button"
            style={{
              padding: "10px 14px",
              background: "transparent",
              border: `1px solid ${N.border}`,
              borderRadius: 10,
              fontSize: 13.5,
              color: N.greenDk,
              fontWeight: 600,
              cursor: "pointer",
            }}
            onClick={onRefresh}
          >
            Refresh status
          </button>
        </div>
        <p style={{ marginTop: 10, marginBottom: 0, fontSize: 12.5, lineHeight: 1.5, color: N.inkFaint }}>
          KinSittr does not store your SIN, bank account, or tax identity details.
        </p>
      </div>
    </div>
  );
}

function formatRequirement(value: string) {
  return value.replaceAll("_", " ").replaceAll(".", " ");
}

function StatusPill({ tone, children }: { tone: "connected" | "needs_setup" | "not_connected" | "review"; children: ReactNode }) {
  const styles = {
    connected: { color: N.green, background: N.greenLt, borderColor: N.greenMid },
    needs_setup: { color: N.amber, background: N.amberLt, borderColor: N.border },
    not_connected: { color: N.inkMute, background: N.cardSoft, borderColor: N.border },
    review: { color: N.greenDk, background: N.cardSoft, borderColor: N.border },
  }[tone];

  return (
    <span
      style={{
        fontSize: 12.5,
        fontWeight: 700,
        color: styles.color,
        background: styles.background,
        border: `1px solid ${styles.borderColor}`,
        padding: "5px 10px",
        borderRadius: 999,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
