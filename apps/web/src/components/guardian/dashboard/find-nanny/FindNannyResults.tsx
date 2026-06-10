import { cn } from "@/lib/utils";
import NannyCard from "../NannyCard";
import { selectCls, SORT_OPTIONS } from "./findNannyHelpers";
import type { Nanny } from "../types";

interface FindNannyResultsProps {
  activeFilterCount: number;
  error: unknown;
  errorMessage: string;
  isFetching: boolean;
  isLoading: boolean;
  isMobile: boolean;
  nannies: Nanny[];
  page: number;
  sort: string;
  total: number;
  totalPages: number;
  onBook: (nanny: Nanny) => void;
  onFilterOpen: () => void;
  onPageChange: (updater: (current: number) => number) => void;
  onRetry: () => void;
  onSortChange: (value: string) => void;
}

export function FindNannyResults({
  activeFilterCount,
  error,
  errorMessage,
  isFetching,
  isLoading,
  isMobile,
  nannies,
  page,
  sort,
  total,
  totalPages,
  onBook,
  onFilterOpen,
  onPageChange,
  onRetry,
  onSortChange,
}: FindNannyResultsProps) {
  const hasError = Boolean(error);

  return (
    <main
      className="flex-1 overflow-y-auto"
      style={{ padding: isMobile ? "20px 16px 32px" : "36px 36px 40px" }}
    >
      <div className="flex items-center justify-between mb-[6px]">
        {!isMobile && (
          <h1 className="font-display font-normal text-[34px]">
            Available nannies
          </h1>
        )}
        <div className={cn("flex items-center gap-2", !isMobile && "ml-auto")}>
          {isMobile && <MobileFilterButton activeFilterCount={activeFilterCount} onFilterOpen={onFilterOpen} />}
          <span className="text-[13px] text-[var(--faint)]">Sort:</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className={cn(selectCls, "w-auto bg-white py-[7px] pl-[10px] text-[13px]")}
          >
            {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <p className={cn("text-brand-faint text-[14px]", isMobile ? "mb-4" : "mb-7")}>
        {isLoading ? "Loading verified nannies..." : `${total} verified ${total === 1 ? "nanny" : "nannies"} in your area`}
      </p>

      <div className="flex flex-col gap-4">
        {isLoading && <ResultMessage>Loading nannies...</ResultMessage>}
        {!isLoading && hasError && (
          <ResultMessage>
            <p className="text-[16px] text-[#b24a3f]">{errorMessage}</p>
            <button className="btn-outline mt-3 px-[18px] py-[10px] text-[13px]" onClick={onRetry}>
              Retry
            </button>
          </ResultMessage>
        )}
        {!isLoading && !hasError && isFetching && <p className="text-[13px] text-brand-faint">Updating results...</p>}
        {!isLoading && !hasError && nannies.map((n, i) => <NannyCard key={n.id} nanny={n} onBook={onBook} delay={i * 40} />)}
        {!isLoading && !hasError && nannies.length === 0 && (
          <ResultMessage>
            <div className="text-[40px] mb-3">No results</div>
            <p className="text-[16px]">No nannies match your filters</p>
            <p className="text-[13px] mt-[6px]">Try adjusting your rate or specialties</p>
          </ResultMessage>
        )}
      </div>

      {!isLoading && !hasError && totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 gap-3">
          <button className="btn-outline px-4 py-[10px] text-[13px]" onClick={() => onPageChange((current) => Math.max(1, current - 1))} disabled={page === 1}>
            Previous
          </button>
          <span className="text-[13px] text-(--faint">
            Page {page} of {totalPages}
          </span>
          <button className="btn-outline px-4 py-[10px] text-[13px]" onClick={() => onPageChange((current) => Math.min(totalPages, current + 1))} disabled={page >= totalPages}>
            Next
          </button>
        </div>
      )}
    </main>
  );
}

function MobileFilterButton({
  activeFilterCount,
  onFilterOpen,
}: {
  activeFilterCount: number;
  onFilterOpen: () => void;
}) {
  return (
    <button
      onClick={onFilterOpen}
      className={cn(
        "flex items-center gap-[6px] px-[14px] py-2 rounded-[9px] border-[1.5px] border-brand-border text-[13px] font-medium cursor-pointer font-[inherit]",
        activeFilterCount > 0 ? "bg-teal-lt text-teal" : "bg-white text-brand-faint",
      )}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      Filters
      {activeFilterCount > 0 && (
        <span className="bg-teal text-white rounded-full w-[18px] h-[18px] text-[11px] font-bold flex items-center justify-center">
          {activeFilterCount}
        </span>
      )}
    </button>
  );
}

function ResultMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-center px-5 py-[60px] text-brand-faint">
      {children}
    </div>
  );
}
