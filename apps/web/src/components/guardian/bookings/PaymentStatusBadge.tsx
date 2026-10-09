import { cn } from "@/lib/utils";
import type { PaymentStatus } from "@/src/types/api/api";
import { formatPaymentState, type PaymentStateTone } from "@/src/utils/format";

const toneCls: Record<PaymentStateTone, string> = {
  neutral: "bg-[#f0ede8] text-black border-brand-border",
  warning: "bg-[#fff7df] text-[#8f6b00] border-[#eed787]",
  success: "bg-[#edf3ec] text-[#557a50] border-[#cbdcc7]",
  danger:  "bg-[#f7eceb] text-[#a84b43] border-[#e7c7c3]",
};

export default function PaymentStatusBadge({ status, className }: { status?: PaymentStatus | ""; className?: string }) {
  const state = formatPaymentState(status);

  return (
    <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-semibold leading-none", toneCls[state.tone], className)}>
      {state.label}
    </span>
  );
}
