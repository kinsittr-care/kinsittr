import { formatLocationPart } from "@/src/utils/format";

function CityBar({ city, count, max }: { city: string; count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-[14.5px] text-admin-ink font-medium">{formatLocationPart(city) || "Unknown"}</span>
        <span className="text-[13.5px] text-admin-ink-soft">{count} bookings</span>
      </div>
      <div className="h-[6px] bg-admin-border-soft rounded-[3px] overflow-hidden">
        <div className="h-full bg-admin-clay rounded-[3px]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AnalyticsCityBars({
  cities,
  isLoading,
}: {
  cities: Array<{ city: string; count: number }>;
  isLoading: boolean;
}) {
  const max = cities[0]?.count ?? 0;

  return (
    <div className="bg-admin-card border border-admin-border rounded-2xl px-5 py-5 shadow-[var(--admin-shadow)] sm:px-7 sm:py-[26px]">
      <h2 className="font-display text-[22px] font-normal text-admin-ink tracking-[-0.005em]">Bookings by city</h2>
      <div className="mt-[22px] flex flex-col gap-[18px]">
        {isLoading && <p className="m-0 text-admin-ink-soft text-[14px]">Loading city data...</p>}
        {!isLoading && cities.length === 0 && (
          <p className="m-0 text-admin-ink-soft text-[14px]">No city booking data yet.</p>
        )}
        {!isLoading &&
          cities.map((c) => (
            <CityBar key={c.city} city={c.city} count={c.count} max={max} />
          ))}
      </div>
    </div>
  );
}
