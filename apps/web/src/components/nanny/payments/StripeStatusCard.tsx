"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { N } from "../tokens";
import { btnPrimary } from "../nanny-styles";
import {
  createNannyStripeConnectLink,
  getNannyStripeStatus,
  nannyStripeStatusQueryKey,
} from "@/src/utils/api/payments";

export default function StripeStatusCard() {
  const queryClient = useQueryClient();
  const statusQuery = useQuery({
    queryKey: nannyStripeStatusQueryKey,
    queryFn: getNannyStripeStatus,
  });
  const connectMutation = useMutation({
    mutationFn: createNannyStripeConnectLink,
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: nannyStripeStatusQueryKey });
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    },
  });
  const status = statusQuery.data?.data;
  const connected = Boolean(status?.account_id);
  const onboarded = Boolean(status?.onboarded);

  return (
    <div
      style={{
        background: N.card,
        border: `1px solid ${N.border}`,
        borderRadius: 18,
        padding: "24px 28px",
        boxShadow: N.shadow,
        display: "flex",
        alignItems: "center",
        gap: 20,
        flexWrap: "wrap",
      }}
    >
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
        <div style={{ marginTop: 4, fontSize: 13.5, color: N.inkMute }}>
          {statusQuery.isLoading
            ? "Checking your Stripe onboarding status..."
            : onboarded
              ? "Your account is active. Payouts are processed weekly."
              : connected
                ? "Finish onboarding to receive payouts after completed bookings."
                : "Connect Stripe to receive secure booking payouts."}
        </div>
        {(statusQuery.error || connectMutation.error) && (
          <div style={{ marginTop: 6, fontSize: 12.5, color: "#b34b39" }}>
            {(statusQuery.error ?? connectMutation.error) instanceof Error
              ? (statusQuery.error ?? connectMutation.error)?.message
              : "Unable to load Stripe status."}
          </div>
        )}
      </div>
      <span
        style={{
          fontSize: 12.5,
          fontWeight: 600,
          color: N.green,
          background: N.greenLt,
          border: `1px solid ${N.greenMid}`,
          padding: "5px 12px",
          borderRadius: 999,
        }}
      >
        {onboarded ? "✓ Connected" : connected ? "Setup needed" : "Not connected"}
      </span>
      <button
        style={btnPrimary}
        disabled={connectMutation.isPending}
        onClick={() => connectMutation.mutate()}
      >
        {connectMutation.isPending ? "Opening Stripe..." : onboarded ? "Manage account" : "Connect Stripe"}
      </button>
    </div>
  );
}
