import { btnGhostCls } from "./admin-styles";
import { cn } from "@/lib/utils";
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
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearchSubmit();
  };

  const inputCls = "min-w-0 rounded-[10px] border border-admin-border bg-admin-card px-[14px] py-[10px] text-admin-ink sm:min-w-[140px]";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-[900px] flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end"
    >
      <input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search reviews..." className={inputCls} />
      <select value={rating} onChange={(event) => onRatingChange(event.target.value)} className={inputCls} aria-label="Review rating">
        <option value="">All ratings</option>
        {[5, 4, 3, 2, 1].map((value) => (
          <option key={value} value={value}>{value} star</option>
        ))}
      </select>
      <input type="date" value={dateFrom} onChange={(event) => onDateFromChange(event.target.value)} className={inputCls} aria-label="Review date from" />
      <input type="date" value={dateTo} onChange={(event) => onDateToChange(event.target.value)} className={inputCls} aria-label="Review date to" />
      <input value={nannyId} onChange={(event) => onNannyIdChange(event.target.value)} placeholder="Nanny ID" className={inputCls} />
      <input value={parentId} onChange={(event) => onParentIdChange(event.target.value)} placeholder="Parent ID" className={inputCls} />
      <button type="submit" className={btnGhostCls}>Search</button>
      <div className="grid grid-cols-2 gap-2 lg:hidden">
        <select
          value={target}
          onChange={(event) => onTargetChange(event.target.value as ReviewTarget | "")}
          className={inputCls}
          aria-label="Review target"
        >
          {targetFilters.map((item) => (
            <option key={item.label} value={item.value}>{item.label}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(event) => onStatusChange(event.target.value as ReviewStatusFilter)}
          className={inputCls}
          aria-label="Review visibility"
        >
          {statusFilters.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
      </div>
      <div className="hidden flex-wrap justify-end gap-2 lg:flex">
        {targetFilters.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => onTargetChange(item.value)}
            className={cn(btnGhostCls, target === item.value && "border-admin-clay text-admin-clay")}
          >
            {item.label}
          </button>
        ))}
        {statusFilters.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onStatusChange(item.value)}
            className={cn(btnGhostCls, status === item.value && "border-admin-clay text-admin-clay")}
          >
            {item.label}
          </button>
        ))}
      </div>
    </form>
  );
}
