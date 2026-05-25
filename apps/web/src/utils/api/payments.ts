import type {
  SetupIntentData,
  StripeConnectData,
  StripeStatusData,
} from "@/src/types/api/payments";
import { apiRequest } from "./api";

export const nannyStripeStatusQueryKey = ["nanny", "stripe-status"] as const;

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

export async function createParentSetupIntent() {
  return apiRequest<SetupIntentData>(
    "/api/v1/parent/billing/setup-intent",
    { method: "POST" },
    { requiresAuth: true },
  );
}
