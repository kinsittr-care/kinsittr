import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { TinyCheckIcon } from "@/src/components/icons";
import { CITIES, labelCls, selectArrowStyle, selectCls, SPECIALTIES } from "./findNannyHelpers";

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
      <div className="mb-4">
        <label className={labelCls}>City</label>
        <select value={city} onChange={(e) => onCityChange(e.target.value)} className={selectCls} style={selectArrowStyle}>
          {CITIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="mb-[22px]">
        <label className={labelCls}>Hourly Rate</label>
        <div className="flex justify-between text-[13px] text-[var(--faint)] mb-[10px]">
          <span>$20/hr</span>
          <span className="font-semibold text-teal">${rate}/hr</span>
        </div>
        <input
          type="range"
          min={20}
          max={60}
          value={rate}
          onChange={(e) => onRateChange(+e.target.value)}
          className="dash-range w-full"
          style={{ "--val": pct } as React.CSSProperties}
        />
      </div>

      <div className="mb-7">
        <label className={labelCls}>Specialties</label>
        {SPECIALTIES.map((s) => {
          const checked = specs.includes(s);
          return (
            <label key={s} className="flex items-center gap-[10px] mb-[10px] cursor-pointer select-none">
              <div
                onClick={() => onSpecialtyToggle(s)}
                className={cn(
                  "w-[18px] h-[18px] rounded-[5px] shrink-0 flex items-center justify-center transition-all duration-[120ms]",
                  checked
                    ? "border-[1.5px] border-teal bg-teal"
                    : "border-[1.5px] border-brand-border bg-white",
                )}
              >
                {checked && <TinyCheckIcon color="#fff" width={10} height={10} />}
              </div>
              <span className="text-[14px]">{s}</span>
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
    <aside className="w-[272px] shrink-0 border-r border-brand-border px-[22px] py-8 overflow-y-auto bg-[var(--bg)] flex flex-col">
      <h2 className="font-display font-normal text-[24px] mb-7">
        Find a nanny
      </h2>
      {children}
    </aside>
  );
}

function VerifiedNanniesNote() {
  return (
    <div className="bg-[#f0ead8] border border-[#ddd0a8] rounded-xl px-4 py-[14px] mt-auto">
      <div className="flex items-center gap-[7px] mb-[6px]">
        <div className="w-5 h-5 rounded-full bg-teal flex items-center justify-center">
          <TinyCheckIcon color="#fff" width={10} height={10} />
        </div>
        <span className="font-semibold text-teal text-[13px]">All nannies verified</span>
      </div>
      <p className="text-[12px] text-[#776a50] leading-[1.6]">
        Background checked, reference verified, and interview screened by our team.
      </p>
    </div>
  );
}
