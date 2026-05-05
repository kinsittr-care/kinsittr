"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "./DashboardContext";
import { useIsMobile } from "./useIsMobile";
import NannyCard from "./NannyCard";
import { TinyCheckIcon } from "@/src/components/icons";
import FilterDrawer from "../compositions/FilterDrawer";
import type { PublicNannyCard } from "@/src/types/api/api";
import { ApiRequestError } from "@/src/utils/api";
import { listPublicNannies } from "@/src/utils/nanny";
import type { Nanny } from "./types";

const CITIES = ["All cities", "Toronto, ON", "Vancouver, BC", "Calgary, AB", "Ottawa, ON", "Montreal, QC"];
const SPECIALTIES = ["Infant care", "Special needs", "Montessori", "CPR certified", "Bilingual"];
const SORT_OPTIONS = ["Top rated", "Price: low to high", "Price: high to low", "Most reviewed"];
const PAGE_SIZE = 12;

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 500, color: "var(--muted)",
  display: "block", marginBottom: 6,
  textTransform: "uppercase", letterSpacing: "0.06em",
};

const selectStyle: React.CSSProperties = {
  width: "100%", border: "1.5px solid var(--border)", borderRadius: 9,
  padding: "11px 14px", fontSize: 14, background: "var(--bg-warm)",
  color: "var(--brand-text)", cursor: "pointer", outline: "none",
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  paddingRight: 32,
};

function parseLocationFilter(value: string) {
  if (value === "All cities") {
    return { city: undefined, province: undefined };
  }

  const [city, province] = value.split(",").map((part) => part.trim());
  return { city, province };
}

function mapSortOption(value: string): "rating_desc" | "rate_asc" | "rate_desc" {
  if (value === "Price: low to high") return "rate_asc";
  if (value === "Price: high to low") return "rate_desc";
  return "rating_desc";
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function mapPublicNannyToCard(nanny: PublicNannyCard): Nanny {
  return {
    id: nanny.id,
    name: nanny.display_name,
    initials: getInitials(nanny.display_name),
    city: `${nanny.city}, ${nanny.province}`,
    rate: nanny.rate_per_hour,
    rating: nanny.rating_avg,
    reviews: nanny.rating_count,
    bio: nanny.bio,
    tags: [],
  };
}

export default function FindNannyView() {
  const { setBookingNanny } = useDashboard();
  const isMobile = useIsMobile();
  const [city, setCity] = useState("All cities");
  const [rate, setRate] = useState(40);
  const [specs, setSpecs] = useState<string[]>([]);
  const [sort, setSort] = useState("Top rated");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [nannies, setNannies] = useState<Nanny[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const pct = (((rate - 20) / (60 - 20)) * 100).toFixed(0) + "%";
  const activeFilterCount = specs.length + (city !== "All cities" ? 1 : 0) + (rate < 60 ? 1 : 0);

  const toggleSpec = (s: string) =>
    setSpecs((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  useEffect(() => {
    let cancelled = false;
    const location = parseLocationFilter(city);

    async function loadNannies() {
      setLoading(true);
      setError(null);

      try {
        const response = await listPublicNannies({
          page,
          limit: PAGE_SIZE,
          city: location.city,
          province: location.province,
          max_rate: rate,
          sort: mapSortOption(sort),
        });

        if (cancelled) return;

        const data = response.data;
        setNannies((data?.items ?? []).map(mapPublicNannyToCard));
        setTotal(data?.total ?? 0);
      } catch (err) {
        if (cancelled) return;

        setNannies([]);
        setTotal(0);
        setError(
          err instanceof ApiRequestError
            ? err.message
            : "Unable to load nannies right now.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadNannies();

    return () => {
      cancelled = true;
    };
  }, [city, page, rate, reloadKey, sort]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleCityChange = (value: string) => {
    setCity(value);
    setPage(1);
  };

  const handleRateChange = (value: number) => {
    setRate(value);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    setPage(1);
  };

  const filterControls = (
    <>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>City</label>
        <select value={city} onChange={(e) => handleCityChange(e.target.value)} style={selectStyle}>
          {CITIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: 22 }}>
        <label style={labelStyle}>Hourly Rate</label>
        <div className="flex justify-between" style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>
          <span>$20/hr</span>
          <span style={{ fontWeight: 600, color: "var(--teal)" }}>${rate}/hr</span>
        </div>
        <input
          type="range" min={20} max={60} value={rate}
          onChange={(e) => handleRateChange(+e.target.value)}
          className="dash-range"
          style={{ width: "100%", "--val": pct } as React.CSSProperties}
        />
      </div>

      <div style={{ marginBottom: 28 }}>
        <label style={labelStyle}>Specialties</label>
        {SPECIALTIES.map((s) => {
          const checked = specs.includes(s);
          return (
            <label key={s} className="flex items-center gap-[10px]" style={{ marginBottom: 10, cursor: "pointer", userSelect: "none" }}>
              <div
                onClick={() => toggleSpec(s)}
                style={{
                  width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                  border: `1.5px solid ${checked ? "var(--teal)" : "var(--border)"}`,
                  background: checked ? "var(--teal)" : "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all .12s",
                }}
              >
                {checked && <TinyCheckIcon color="#fff" width={10} height={10} />}
              </div>
              <span style={{ fontSize: 14 }}>{s}</span>
            </label>
          );
        })}
      </div>

      <div style={{ background: "#f0ead8", border: "1px solid #ddd0a8", borderRadius: 12, padding: "14px 16px", marginTop: "auto" }}>
        <div className="flex items-center gap-[7px]" style={{ marginBottom: 6 }}>
          <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TinyCheckIcon color="#fff" width={10} height={10} />
          </div>
          <span style={{ fontWeight: 600, color: "var(--teal)", fontSize: 13 }}>All nannies verified</span>
        </div>
        <p style={{ fontSize: 12, color: "#776a50", lineHeight: 1.6 }}>
          Background checked, reference verified, and interview screened by our team.
        </p>
      </div>
    </>
  );

  return (
    <div className="flex h-full overflow-hidden" style={{ flex: 1 }}>
      {/* Desktop sidebar */}
      {!isMobile && (
        <aside
          style={{
            width: 272, flexShrink: 0,
            borderRight: "1px solid var(--border)",
            padding: "32px 22px",
            overflowY: "auto",
            background: "var(--bg)",
            display: "flex", flexDirection: "column",
          }}
        >
          <h2 className="font-display" style={{ fontSize: 24, fontWeight: 400, marginBottom: 28 }}>
            Find a nanny
          </h2>
          {filterControls}
        </aside>
      )}

      {/* Main content */}
      <main style={{ flex: 1, overflowY: "auto", padding: isMobile ? "20px 16px 32px" : "36px 36px 40px" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
          {!isMobile && (
            <h1 className="font-display" style={{ fontWeight: 400, fontSize: 34 }}>
              Available nannies
            </h1>
          )}
          <div className="flex items-center gap-[8px]" style={{ marginLeft: isMobile ? 0 : "auto" }}>
            {isMobile && (
              <button
                onClick={() => setFilterOpen(true)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 14px", borderRadius: 9, border: "1.5px solid var(--border)",
                  background: activeFilterCount > 0 ? "var(--teal-lt)" : "#fff",
                  color: activeFilterCount > 0 ? "var(--teal)" : "var(--muted)",
                  fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
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
            )}
            <span style={{ fontSize: 13, color: "var(--muted)" }}>Sort:</span>
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              style={{
                border: "1.5px solid var(--border)", borderRadius: 9,
                padding: "7px 28px 7px 10px", fontSize: 13,
                cursor: "pointer", background: "#fff",
                color: "var(--brand-text)", outline: "none",
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
          {loading
            ? "Loading verified nannies…"
            : `${total} verified ${total === 1 ? "nanny" : "nannies"} in your area`}
        </p>

        <div className="flex flex-col gap-4">
          {loading && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
              <p style={{ fontSize: 16 }}>Loading nannies…</p>
            </div>
          )}
          {!loading && error && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
              <p style={{ fontSize: 16, color: "#b24a3f" }}>{error}</p>
              <button
                className="btn-outline"
                style={{ marginTop: 12, padding: "10px 18px", fontSize: 13 }}
                onClick={() => setReloadKey((current) => current + 1)}
              >
                Retry
              </button>
            </div>
          )}
          {!loading && !error && nannies.map((n, i) => (
            <NannyCard key={n.id} nanny={n} onBook={setBookingNanny} delay={i * 40} />
          ))}
          {!loading && !error && nannies.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <p style={{ fontSize: 16 }}>No nannies match your filters</p>
              <p style={{ fontSize: 13, marginTop: 6 }}>Try adjusting your rate or specialties</p>
            </div>
          )}
        </div>

        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between" style={{ marginTop: 24, gap: 12 }}>
            <button
              className="btn-outline"
              style={{ padding: "10px 16px", fontSize: 13 }}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>
              Page {page} of {totalPages}
            </span>
            <button
              className="btn-outline"
              style={{ padding: "10px 16px", fontSize: 13 }}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        )}
      </main>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        resultCount={loading ? 0 : total}
      >
        {filterControls}
      </FilterDrawer>
    </div>
  );
}
