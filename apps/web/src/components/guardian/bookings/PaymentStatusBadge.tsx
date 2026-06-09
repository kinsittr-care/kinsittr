import { cn } from "@/lib/utils";
import type { PaymentStatus } from "@/src/types/api/api";
import { formatPaymentState, type PaymentStateTone } from "@/src/utils/format";

const toneCls: Record<PaymentStateTone, string> = {
  neutral: "bg-[#f0ede8] text-black border-brand-border",
  warning: "bg-[#fff7df] text-[#8f6b00] border-[#eed787]",
  success: "bg-[#edf3ec] text-[#557a50] border-[#cbdcc7]",
  danger:  "bg-[#f7eceb] text-[#a84b43] border-[#e7c7c3]",
};

export default function PaymentStatusBadge({ status }: { status?: PaymentStatus | "" }) {
  const state = formatPaymentState(status);

  return (
    <span className={cn("text-[11.5px] px-[9px] py-[3px] rounded-[20px] font-medium border", toneCls[state.tone])}>
      {state.label}
    </span>
  );
}
