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

export default function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={cn("text-[11.5px] px-[9px] py-[3px] rounded-[20px] font-medium border", statusCls[status])}>
      {formatBookingStatus(status)}
    </span>
  );
}
