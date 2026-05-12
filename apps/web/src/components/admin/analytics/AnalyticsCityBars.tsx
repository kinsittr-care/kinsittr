import { A } from "../tokens";

const cities = [
  { city: "Toronto",   count: 58 },
  { city: "Vancouver", count: 31 },
  { city: "Calgary",   count: 24 },
  { city: "Ottawa",    count: 16 },
  { city: "Montreal",  count: 9  },
];

function CityBar({ city, count, max }: { city: string; count: number; max: number }) {
  const pct = Math.round((count / max) * 100);
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
        <span style={{ fontSize: 14.5, color: A.ink, fontWeight: 500 }}>{city}</span>
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

export default function AnalyticsCityBars() {
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
        {cities.map((c) => (
          <CityBar key={c.city} city={c.city} count={c.count} max={cities[0].count} />
        ))}
      </div>
    </div>
  );
}
