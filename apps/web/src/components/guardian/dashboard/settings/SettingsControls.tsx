import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-[#fdfaf5] border border-brand-border rounded-2xl p-6 mb-5 shadow-[0_2px_12px_rgba(40,30,20,.07)]">
      <h3 className="text-[11.5px] font-semibold text-brand-faint uppercase tracking-[0.1em] mb-[18px]">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function ToggleRow({
  label,
  sub,
  on,
  onToggle,
  last = false,
}: {
  label: string;
  sub: string;
  on: boolean;
  onToggle: () => void;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-1 py-[13px]",
        !last && "border-b border-brand-border",
      )}
    >
      <div>
        <div className="text-[14px] font-medium mb-[2px]">{label}</div>
        <div className="text-[12.5px] text-brand-faint">{sub}</div>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "w-[46px] h-[26px] rounded-[13px] cursor-pointer relative transition-colors duration-200 shrink-0 border-0",
          on ? "bg-teal shadow-[0_2px_8px_rgba(58,90,90,.28)]" : "bg-[#ddd8d0]",
        )}
        role="switch"
        aria-checked={on}
      >
        <span
          className="w-5 h-5 rounded-full bg-white absolute top-[3px] transition-[left] duration-200 shadow-[0_1px_4px_rgba(0,0,0,.2)]"
          style={{ left: on ? 23 : 3 }}
        />
      </button>
    </div>
  );
}

const selectArrow = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`;

export const selectArrowStyle = { backgroundImage: selectArrow, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" } as const;

export const selectCls = "w-full border-[1.5px] border-brand-border rounded-[9px] px-[14px] py-[11px] pr-8 text-[14px] bg-[var(--bg-warm)] text-[var(--brand-text)] cursor-pointer outline-none appearance-none";

export const inputCls = "w-full border-[1.5px] border-brand-border rounded-[9px] px-[14px] py-[11px] text-[14px] bg-[var(--bg-warm)] text-[var(--brand-text)] outline-none mb-3";

export const labelCls = "text-[12px] font-medium text-[var(--faint)] block mb-[6px] uppercase tracking-[0.06em]";
