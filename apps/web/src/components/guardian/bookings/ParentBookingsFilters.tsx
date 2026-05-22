import type { CSSProperties } from "react";
import type { BookingStatus } from "@/src/types/api/api";
import SectionCard from "../profile/SectionCard";

const filterLabelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: "var(--muted)",
  display: "block",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const inputStyle: CSSProperties = {
  width: "100%",
  border: "1.5px solid var(--border)",
  borderRadius: 9,
  padding: "11px 14px",
  fontSize: 14,
  outline: "none",
  background: "var(--bg-warm)",
  color: "var(--brand-text)",
  fontFamily: "inherit",
};

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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
        <div>
          <label style={filterLabelStyle}>Status</label>
          <select value={status} onChange={(event) => onStatusChange(event.target.value as BookingStatus | "")} style={inputStyle}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label style={filterLabelStyle}>From</label>
          <input type="date" value={dateFrom} onChange={(event) => onDateFromChange(event.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={filterLabelStyle}>To</label>
          <input type="date" value={dateTo} onChange={(event) => onDateToChange(event.target.value)} style={inputStyle} />
        </div>
      </div>
    </SectionCard>
  );
}
