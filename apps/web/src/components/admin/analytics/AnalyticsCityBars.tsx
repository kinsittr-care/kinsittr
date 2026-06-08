import { A } from "../tokens";
import { formatLocationPart } from "@/src/utils/format";

function CityBar({ city, count, max }: { city: string; count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 14.5, color: A.ink, fontWeight: 500 }}>{formatLocationPart(city) || "Unknown"}</span>
        <span style={{ fontSize: 13.5, color: A.inkSoft }}>{count} bookings</span>
      </div>
      <div
        style={{
          height: 6,
          background: A.borderSoft,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: A.clay,
            borderRadius: 3,
          }}
        />
      </div>
    </div>
  );
}

const titleSerif = {
  fontFamily: "var(--font-dm-serif), serif",
  fontSize: 22,
  fontWeight: 400,
  color: "var(--admin-ink)",
  letterSpacing: "-.005em",
};

export default function AnalyticsCityBars({
  cities,
  isLoading,
}: {
  cities: Array<{ city: string; count: number }>;
  isLoading: boolean;
}) {
  const max = cities[0]?.count ?? 0;

  return (
    <div
      style={{
        background: A.card,
        border: `1px solid ${A.border}`,
        borderRadius: 16,
        padding: "26px 28px",
        boxShadow: A.shadow,
      }}
    >
      <h2 style={titleSerif}>Bookings by city</h2>
      <div
        style={{
          marginTop: 22,
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {isLoading && <p style={{ margin: 0, color: A.inkSoft, fontSize: 14 }}>Loading city data...</p>}
        {!isLoading && cities.length === 0 && (
          <p style={{ margin: 0, color: A.inkSoft, fontSize: 14 }}>No city booking data yet.</p>
        )}
        {!isLoading &&
          cities.map((c) => (
            <CityBar key={c.city} city={c.city} count={c.count} max={max} />
          ))}
      </div>
    </div>
  );
}
