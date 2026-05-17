"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useDashboard } from "./DashboardContext";
import { useIsMobile } from "./useIsMobile";
import FilterDrawer from "../compositions/FilterDrawer";
import { listPublicNannies, publicNanniesQueryKey } from "@/src/utils/api/nanny";
import { DesktopFilterSidebar, FindNannyFilters } from "./find-nanny/FindNannyFilters";
import { FindNannyResults } from "./find-nanny/FindNannyResults";
import {
  mapPublicNannyToCard,
  mapSortOption,
  PAGE_SIZE,
  parseLocationFilter,
} from "./find-nanny/findNannyHelpers";

export default function FindNannyView() {
  const { setBookingNanny } = useDashboard();
  const isMobile = useIsMobile();
  const [city, setCity] = useState("All cities");
  const [rate, setRate] = useState(40);
  const [specs, setSpecs] = useState<string[]>([]);
  const [sort, setSort] = useState("Top rated");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [debouncedFilters, setDebouncedFilters] = useState({ city, rate, sort, specs, page });

  const pct = `${(((rate - 20) / (60 - 20)) * 100).toFixed(0)}%`;
  const activeFilterCount = specs.length + (city !== "All cities" ? 1 : 0) + (rate < 60 ? 1 : 0);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedFilters({ city, rate, sort, specs, page });
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [city, rate, sort, specs, page]);

  const normalizedSpecialties = useMemo(
    () => [...debouncedFilters.specs].sort((a, b) => a.localeCompare(b)),
    [debouncedFilters.specs],
  );
  const location = useMemo(() => parseLocationFilter(debouncedFilters.city), [debouncedFilters.city]);
  const queryParams = useMemo(
    () => ({
      page: debouncedFilters.page,
      limit: PAGE_SIZE,
      city: location.city,
      province: location.province,
      specialties: normalizedSpecialties,
      max_rate: debouncedFilters.rate,
      sort: mapSortOption(debouncedFilters.sort),
    }),
    [debouncedFilters.page, debouncedFilters.rate, debouncedFilters.sort, location.city, location.province, normalizedSpecialties],
  );

  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: publicNanniesQueryKey(queryParams),
    queryFn: () => listPublicNannies(queryParams),
    placeholderData: (previousData) => previousData,
  });

  const nannies = useMemo(() => (data?.data?.items ?? []).map(mapPublicNannyToCard), [data]);
  const total = data?.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const errorMessage = error instanceof Error ? error.message : "Unable to load nannies right now.";

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
  const handleSpecialtyToggle = (value: string) => {
    setSpecs((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
    setPage(1);
  };

  const filterControls = (
    <FindNannyFilters
      city={city}
      rate={rate}
      specs={specs}
      pct={pct}
      onCityChange={handleCityChange}
      onRateChange={handleRateChange}
      onSpecialtyToggle={handleSpecialtyToggle}
    />
  );

  return (
    <div className="flex h-full overflow-hidden" style={{ flex: 1 }}>
      {!isMobile && <DesktopFilterSidebar>{filterControls}</DesktopFilterSidebar>}

      <FindNannyResults
        activeFilterCount={activeFilterCount}
        error={error}
        errorMessage={errorMessage}
        isFetching={isFetching}
        isLoading={isLoading}
        isMobile={isMobile}
        nannies={nannies}
        page={page}
        sort={sort}
        total={total}
        totalPages={totalPages}
        onBook={setBookingNanny}
        onFilterOpen={() => setFilterOpen(true)}
        onPageChange={setPage}
        onRetry={() => void refetch()}
        onSortChange={handleSortChange}
      />

      <FilterDrawer open={filterOpen} onClose={() => setFilterOpen(false)} resultCount={isLoading ? 0 : total}>
        {filterControls}
      </FilterDrawer>
    </div>
  );
}
