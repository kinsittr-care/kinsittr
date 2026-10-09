import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/src/types/api/api";
import { formatBookingStatus } from "./booking-helpers";

const statusCls: Record<BookingStatus, string> = {
  pending:   "bg-[#fff7df] text-[#8f6b00] border-[#eed787]",
  approved:  "bg-teal-lt text-teal border-teal-mid",
  declined:  "bg-[#f7eceb] text-[#a84b43] border-[#e7c7c3]",
  cancelled: "bg-[#f0ede8] text-brand-faint border-brand-border",
  completed: "bg-[#edf3ec] text-[#557a50] border-[#cbdcc7]",
};

export default function BookingStatusBadge({ status, className }: { status: BookingStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-semibold leading-none", statusCls[status], className)}>
      {formatBookingStatus(status)}
    </span>
  );
}
