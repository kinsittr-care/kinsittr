import type { PaymentStatus } from "@/src/types/api/api";

export type PaymentStateTone = "neutral" | "warning" | "success" | "danger";

export interface PaymentStateDisplay {
  label: string;
  tone: PaymentStateTone;
}

export function formatPaymentState(status?: PaymentStatus | ""): PaymentStateDisplay {
  switch (status) {
    case "failed":
      return { label: "Payment failed", tone: "danger" };
    case "processing":
      return { label: "Payment processing", tone: "warning" };
    case "succeeded":
      return { label: "Paid", tone: "success" };
    case "refunded":
      return { label: "Refunded", tone: "neutral" };
    case "cancelled":
      return { label: "Payment cancelled", tone: "neutral" };
    case "requires_action":
      return { label: "Action required", tone: "warning" };
    case "requires_confirmation":
    case "requires_payment_method":
      return { label: "Payment setup needed", tone: "warning" };
    default:
      return { label: "Not charged yet", tone: "neutral" };
  }
}
