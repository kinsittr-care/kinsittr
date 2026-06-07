import NannyCard from "../NannyCard";
import { SORT_OPTIONS } from "./findNannyHelpers";
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
    <main style={{ flex: 1, overflowY: "auto", padding: isMobile ? "20px 16px 32px" : "36px 36px 40px" }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
        {!isMobile && (
          <h1 className="font-display" style={{ fontWeight: 400, fontSize: 34 }}>
            Available nannies
          </h1>
        )}
        <div className="flex items-center gap-[8px]" style={{ marginLeft: isMobile ? 0 : "auto" }}>
          {isMobile && <MobileFilterButton activeFilterCount={activeFilterCount} onFilterOpen={onFilterOpen} />}
          <span style={{ fontSize: 13, color: "var(--muted)" }}>Sort:</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            style={{
              border: "1.5px solid var(--border)",
              borderRadius: 9,
              padding: "7px 28px 7px 10px",
              fontSize: 13,
              cursor: "pointer",
              background: "#fff",
              color: "var(--brand-text)",
              outline: "none",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 8px center",
            }}
          >
            {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <p style={{ color: "var(--faint)", fontSize: 14, marginBottom: isMobile ? 16 : 28 }}>
        {isLoading ? "Loading verified nannies..." : `${total} verified ${total === 1 ? "nanny" : "nannies"} in your area`}
      </p>

      <div className="flex flex-col gap-4">
        {isLoading && <ResultMessage>Loading nannies...</ResultMessage>}
        {!isLoading && hasError && (
          <ResultMessage>
            <p style={{ fontSize: 16, color: "#b24a3f" }}>{errorMessage}</p>
            <button className="btn-outline" style={{ marginTop: 12, padding: "10px 18px", fontSize: 13 }} onClick={onRetry}>
              Retry
            </button>
          </ResultMessage>
        )}
        {!isLoading && !hasError && isFetching && <p style={{ fontSize: 13, color: "var(--muted)" }}>Updating results...</p>}
        {!isLoading && !hasError && nannies.map((n, i) => <NannyCard key={n.id} nanny={n} onBook={onBook} delay={i * 40} />)}
        {!isLoading && !hasError && nannies.length === 0 && (
          <ResultMessage>
            <div style={{ fontSize: 40, marginBottom: 12 }}>No results</div>
            <p style={{ fontSize: 16 }}>No nannies match your filters</p>
            <p style={{ fontSize: 13, marginTop: 6 }}>Try adjusting your rate or specialties</p>
          </ResultMessage>
        )}
      </div>

      {!isLoading && !hasError && totalPages > 1 && (
        <div className="flex items-center justify-between" style={{ marginTop: 24, gap: 12 }}>
          <button className="btn-outline" style={{ padding: "10px 16px", fontSize: 13 }} onClick={() => onPageChange((current) => Math.max(1, current - 1))} disabled={page === 1}>
            Previous
          </button>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>
            Page {page} of {totalPages}
          </span>
          <button className="btn-outline" style={{ padding: "10px 16px", fontSize: 13 }} onClick={() => onPageChange((current) => Math.min(totalPages, current + 1))} disabled={page >= totalPages}>
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
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 14px",
        borderRadius: 9,
        border: "1.5px solid var(--border)",
        background: activeFilterCount > 0 ? "var(--teal-lt)" : "#fff",
        color: activeFilterCount > 0 ? "var(--teal)" : "var(--muted)",
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      Filters
      {activeFilterCount > 0 && (
        <span style={{ background: "var(--teal)", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {activeFilterCount}
        </span>
      )}
    </button>
  );
}

function ResultMessage({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--faint)" }}>
      {children}
    </div>
  );
}
