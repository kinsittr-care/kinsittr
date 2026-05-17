import type { CSSProperties, ReactNode } from "react";

export function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div
      style={{
        background: "#fdfaf5",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
        boxShadow: "0 2px 12px rgba(40,30,20,.07)",
      }}
    >
      <h3
        style={{
          fontSize: 11.5,
          fontWeight: 600,
          color: "var(--faint)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 18,
        }}
      >
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
      className="flex items-center justify-between gap-1"
      style={{
        padding: "13px 0",
        borderBottom: last ? "none" : "1px solid var(--border)",
      }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 12.5, color: "var(--faint)" }}>{sub}</div>
      </div>
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: 46,
          height: 26,
          borderRadius: 13,
          background: on ? "var(--teal)" : "#ddd8d0",
          cursor: "pointer",
          position: "relative",
          transition: "background .2s",
          flexShrink: 0,
          boxShadow: on ? "0 2px 8px rgba(58,90,90,.28)" : "none",
          border: "none",
        }}
        role="switch"
        aria-checked={on}
      >
        <span
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#fff",
            position: "absolute",
            top: 3,
            left: on ? 23 : 3,
            transition: "left .2s",
            boxShadow: "0 1px 4px rgba(0,0,0,.2)",
          }}
        />
      </button>
    </div>
  );
}

export const selectStyle: CSSProperties = {
  width: "100%",
  border: "1.5px solid var(--border)",
  borderRadius: 9,
  padding: "11px 14px",
  fontSize: 14,
  background: "var(--bg-warm)",
  color: "var(--brand-text)",
  cursor: "pointer",
  outline: "none",
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  paddingRight: 32,
  marginBottom: 16,
};

export const inputStyle: CSSProperties = {
  width: "100%",
  border: "1.5px solid var(--border)",
  borderRadius: 9,
  padding: "11px 14px",
  fontSize: 14,
  background: "var(--bg-warm)",
  color: "var(--brand-text)",
  outline: "none",
  marginBottom: 12,
};

export const labelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: "var(--muted)",
  display: "block",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};
