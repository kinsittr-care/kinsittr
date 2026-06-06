import type {
  PaymentMethodData,
  PaymentMethodListData,
  NannyPayoutSettingsData,
  SetupIntentData,
  StripeBalanceData,
  StripeConnectData,
  StripePayoutListData,
  StripeStatusData,
  UpdateNannyPayoutSettingsPayload,
} from "@/src/types/api/payments";
import { apiRequest } from "./api";

export const nannyStripeStatusQueryKey = ["nanny", "stripe-status"] as const;
export const nannyStripeBalanceQueryKey = ["nanny", "stripe-balance"] as const;
export const nannyStripePayoutsQueryKey = ["nanny", "stripe-payouts"] as const;
export const nannyPayoutSettingsQueryKey = ["nanny", "payout-settings"] as const;
export const parentPaymentMethodsQueryKey = ["parent", "payment-methods"] as const;

export async function getNannyStripeStatus() {
  return apiRequest<StripeStatusData>("/api/v1/nanny/payments/status", undefined, {
    requiresAuth: true,
  });
}

export async function createNannyStripeConnectLink() {
  return apiRequest<StripeConnectData>(
    "/api/v1/nanny/payments/connect",
    { method: "POST" },
    { requiresAuth: true },
  );
}

export async function getNannyStripeBalance() {
  return apiRequest<StripeBalanceData>("/api/v1/nanny/payments/balance", undefined, {
    requiresAuth: true,
  });
}

export async function listNannyStripePayouts() {
  return apiRequest<StripePayoutListData>("/api/v1/nanny/payments/payouts", undefined, {
    requiresAuth: true,
  });
}

export async function getNannyPayoutSettings() {
  return apiRequest<NannyPayoutSettingsData>("/api/v1/nanny/payments/payout-settings", undefined, {
    requiresAuth: true,
  });
}

export async function updateNannyPayoutSettings(payload: UpdateNannyPayoutSettingsPayload) {
  return apiRequest<NannyPayoutSettingsData>(
    "/api/v1/nanny/payments/payout-settings",
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
    { requiresAuth: true },
  );
}

export async function createParentSetupIntent() {
  return apiRequest<SetupIntentData>(
    "/api/v1/parent/billing/setup-intent",
    { method: "POST" },
    { requiresAuth: true },
  );
}

export async function listParentPaymentMethods() {
  return apiRequest<PaymentMethodListData>(
    "/api/v1/parent/billing/payment-methods",
    undefined,
    { requiresAuth: true },
  );
}

export async function setDefaultParentPaymentMethod(paymentMethodId: string) {
  return apiRequest<PaymentMethodData>(
    `/api/v1/parent/billing/payment-methods/${paymentMethodId}`,
    {
      method: "PUT",
      body: JSON.stringify({ set_default: true }),
    },
    { requiresAuth: true },
  );
}

export async function deleteParentPaymentMethod(paymentMethodId: string) {
  return apiRequest<null>(
    `/api/v1/parent/billing/payment-methods/${paymentMethodId}`,
    { method: "DELETE" },
    { requiresAuth: true },
  );
}
