import type { BookingStatus } from "@/src/types/api/api";
import SectionCard from "../profile/SectionCard";

const labelCls = "text-[12px] font-medium text-[var(--faint)] block mb-[6px] uppercase tracking-[0.06em]";
const inputCls = "w-full border-[1.5px] border-brand-border rounded-[9px] px-[14px] py-[11px] text-[14px] outline-none bg-[var(--bg-warm)] text-[var(--brand-text)] [font-family:inherit]";

type ParentBookingsFiltersProps = {
  dateFrom: string;
  dateTo: string;
  status: BookingStatus | "";
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onStatusChange: (value: BookingStatus | "") => void;
};

export default function ParentBookingsFilters({
  dateFrom,
  dateTo,
  status,
  onDateFromChange,
  onDateToChange,
  onStatusChange,
}: ParentBookingsFiltersProps) {
  return (
    <SectionCard title="Filters">
      <div className="grid gap-[14px]" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        <div>
          <label className={labelCls}>Status</label>
          <select value={status} onChange={(event) => onStatusChange(event.target.value as BookingStatus | "")} className={inputCls}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>From</label>
          <input type="date" value={dateFrom} onChange={(event) => onDateFromChange(event.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>To</label>
          <input type="date" value={dateTo} onChange={(event) => onDateToChange(event.target.value)} className={inputCls} />
        </div>
      </div>
    </SectionCard>
  );
}
