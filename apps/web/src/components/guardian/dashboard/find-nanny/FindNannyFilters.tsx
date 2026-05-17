import type { ReactNode } from "react";
import { TinyCheckIcon } from "@/src/components/icons";
import { CITIES, labelStyle, selectStyle, SPECIALTIES } from "./findNannyHelpers";

interface FindNannyFiltersProps {
  city: string;
  rate: number;
  specs: string[];
  pct: string;
  onCityChange: (value: string) => void;
  onRateChange: (value: number) => void;
  onSpecialtyToggle: (value: string) => void;
}

export function FindNannyFilters({
  city,
  rate,
  specs,
  pct,
  onCityChange,
  onRateChange,
  onSpecialtyToggle,
}: FindNannyFiltersProps) {
  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>City</label>
        <select value={city} onChange={(e) => onCityChange(e.target.value)} style={selectStyle}>
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
          type="range"
          min={20}
          max={60}
          value={rate}
          onChange={(e) => onRateChange(+e.target.value)}
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
                onClick={() => onSpecialtyToggle(s)}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 5,
                  flexShrink: 0,
                  border: `1.5px solid ${checked ? "var(--teal)" : "var(--border)"}`,
                  background: checked ? "var(--teal)" : "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
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

      <VerifiedNanniesNote />
    </>
  );
}

export function DesktopFilterSidebar({ children }: { children: ReactNode }) {
  return (
    <aside
      style={{
        width: 272,
        flexShrink: 0,
        borderRight: "1px solid var(--border)",
        padding: "32px 22px",
        overflowY: "auto",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h2 className="font-display" style={{ fontSize: 24, fontWeight: 400, marginBottom: 28 }}>
        Find a nanny
      </h2>
      {children}
    </aside>
  );
}

function VerifiedNanniesNote() {
  return (
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
  );
}
