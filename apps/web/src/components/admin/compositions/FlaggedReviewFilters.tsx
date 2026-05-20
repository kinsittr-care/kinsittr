import type { CSSProperties, FormEvent } from "react";
import { btnGhost } from "./admin-styles";
import { A } from "../tokens";
import type { ReviewTarget } from "@/src/types/api/admin";

type ReviewStatusFilter = "flagged" | "visible" | "hidden" | "all";

const targetFilters: Array<{ label: string; value: ReviewTarget | "" }> = [
  { label: "All targets", value: "" },
  { label: "Nanny reviews", value: "nanny" },
  { label: "Parent reviews", value: "parent" },
];

const statusFilters: Array<{ label: string; value: ReviewStatusFilter }> = [
  { label: "Flagged", value: "flagged" },
  { label: "Visible", value: "visible" },
  { label: "Hidden", value: "hidden" },
  { label: "All", value: "all" },
];

const filterInputStyle: CSSProperties = {
  padding: "10px 14px",
  background: A.card,
  border: `1px solid ${A.border}`,
  borderRadius: 10,
  color: A.ink,
  minWidth: 140,
};

type FlaggedReviewFiltersProps = {
  dateFrom: string;
  dateTo: string;
  nannyId: string;
  parentId: string;
  rating: string;
  search: string;
  status: ReviewStatusFilter;
  target: ReviewTarget | "";
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onNannyIdChange: (value: string) => void;
  onParentIdChange: (value: string) => void;
  onRatingChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onStatusChange: (value: ReviewStatusFilter) => void;
  onTargetChange: (value: ReviewTarget | "") => void;
};

export type { ReviewStatusFilter };

export default function FlaggedReviewFilters({
  dateFrom,
  dateTo,
  nannyId,
  parentId,
  rating,
  search,
  status,
  target,
  onDateFromChange,
  onDateToChange,
  onNannyIdChange,
  onParentIdChange,
  onRatingChange,
  onSearchChange,
  onSearchSubmit,
  onStatusChange,
  onTargetChange,
}: FlaggedReviewFiltersProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearchSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end", maxWidth: 900 }}
    >
      <input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search reviews..." style={filterInputStyle} />
      <select value={rating} onChange={(event) => onRatingChange(event.target.value)} style={filterInputStyle} aria-label="Review rating">
        <option value="">All ratings</option>
        {[5, 4, 3, 2, 1].map((value) => (
          <option key={value} value={value}>{value} star</option>
        ))}
      </select>
      <input type="date" value={dateFrom} onChange={(event) => onDateFromChange(event.target.value)} style={filterInputStyle} aria-label="Review date from" />
      <input type="date" value={dateTo} onChange={(event) => onDateToChange(event.target.value)} style={filterInputStyle} aria-label="Review date to" />
      <input value={nannyId} onChange={(event) => onNannyIdChange(event.target.value)} placeholder="Nanny ID" style={filterInputStyle} />
      <input value={parentId} onChange={(event) => onParentIdChange(event.target.value)} placeholder="Parent ID" style={filterInputStyle} />
      <button type="submit" style={btnGhost}>Search</button>
      {targetFilters.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => onTargetChange(item.value)}
          style={{ ...btnGhost, borderColor: target === item.value ? A.clay : A.border, color: target === item.value ? A.clay : A.inkMid }}
        >
          {item.label}
        </button>
      ))}
      {statusFilters.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onStatusChange(item.value)}
          style={{ ...btnGhost, borderColor: status === item.value ? A.clay : A.border, color: status === item.value ? A.clay : A.inkMid }}
        >
          {item.label}
        </button>
      ))}
    </form>
  );
}
