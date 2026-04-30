"use client";

import { useState } from "react";
import { useDashboard } from "./DashboardContext";
import { NANNIES } from "./data";
import NannyCard from "./NannyCard";
import { TinyCheckIcon } from "@/src/components/icons";

const CITIES = ["All cities", "Toronto, ON", "Vancouver, BC", "Calgary, AB", "Ottawa, ON", "Montreal, QC"];
const SPECIALTIES = ["Infant care", "Special needs", "Montessori", "CPR certified", "Bilingual"];
const SORT_OPTIONS = ["Top rated", "Price: low to high", "Price: high to low", "Most reviewed"];

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

export default function FindNannyView() {
  const { setBookingNanny } = useDashboard();
  const [city, setCity] = useState("All cities");
  const [rate, setRate] = useState(40);
  const [specs, setSpecs] = useState<string[]>([]);
  const [sort, setSort] = useState("Top rated");

  const pct = (((rate - 20) / (60 - 20)) * 100).toFixed(0) + "%";

  const toggleSpec = (s: string) =>
    setSpecs((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const filtered = NANNIES
    .filter((n) => {
      const cityMatch = city === "All cities" || n.city === city;
      const rateMatch = n.rate <= rate;
      const specMatch = specs.length === 0 || specs.some((s) => n.tags.includes(s));
      return cityMatch && rateMatch && specMatch;
    })
    .sort((a, b) => {
      if (sort === "Price: low to high") return a.rate - b.rate;
      if (sort === "Price: high to low") return b.rate - a.rate;
      if (sort === "Most reviewed") return b.reviews - a.reviews;
      return b.rating - a.rating;
    });

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
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
        <h2
          className="font-display"
          style={{ fontSize: 24, fontWeight: 400, marginBottom: 28 }}
        >
          Find a nanny
        </h2>

        {/* City */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>City</label>
          <select value={city} onChange={(e) => setCity(e.target.value)} style={selectStyle}>
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Rate slider */}
        <div style={{ marginBottom: 22 }}>
          <label style={labelStyle}>Hourly Rate</label>
          <div className="flex justify-between" style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>
            <span>$20/hr</span>
            <span style={{ fontWeight: 600, color: "var(--teal)" }}>${rate}/hr</span>
          </div>
          <input
            type="range"
            min={20}
            max={60}
            value={rate}
            onChange={(e) => setRate(+e.target.value)}
            className="dash-range"
            style={{ width: "100%", "--val": pct } as React.CSSProperties}
          />
        </div>

        {/* Specialties */}
        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>Specialties</label>
          {SPECIALTIES.map((s) => {
            const checked = specs.includes(s);
            return (
              <label
                key={s}
                className="flex items-center gap-[10px]"
                style={{ marginBottom: 10, cursor: "pointer", userSelect: "none" }}
              >
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

        {/* Verified badge */}
        <div
          style={{
            background: "#f0ead8", border: "1px solid #ddd0a8",
            borderRadius: 12, padding: "14px 16px", marginTop: "auto",
          }}
        >
          <div className="flex items-center gap-[7px]" style={{ marginBottom: 6 }}>
            <div
              style={{
                width: 20, height: 20, borderRadius: "50%",
                background: "var(--teal)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <TinyCheckIcon color="#fff" width={10} height={10} />
            </div>
            <span style={{ fontWeight: 600, color: "var(--teal)", fontSize: 13 }}>
              All nannies verified
            </span>
          </div>
          <p style={{ fontSize: 12, color: "#776a50", lineHeight: 1.6 }}>
            Background checked, reference verified, and interview screened by our team.
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflowY: "auto", padding: "36px 36px 40px" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
          <h1 className="font-display" style={{ fontWeight: 400, fontSize: 34 }}>
            Available nannies
          </h1>
          <div className="flex items-center gap-[10px]">
            <span style={{ fontSize: 13, color: "var(--muted)" }}>Sort by:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                border: "1.5px solid var(--border)", borderRadius: 9,
                padding: "7px 32px 7px 12px", fontSize: 13,
                cursor: "pointer", background: "#fff",
                color: "var(--brand-text)", outline: "none",
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 10px center",
              }}
            >
              {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <p style={{ color: "var(--faint)", fontSize: 14, marginBottom: 28 }}>
          {filtered.length} verified {filtered.length === 1 ? "nanny" : "nannies"} in your area
        </p>

        <div className="flex flex-col gap-4">
          {filtered.map((n, i) => (
            <NannyCard key={n.id} nanny={n} onBook={setBookingNanny} delay={i * 40} />
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <p style={{ fontSize: 16 }}>No nannies match your filters</p>
              <p style={{ fontSize: 13, marginTop: 6 }}>Try adjusting your rate or specialties</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
