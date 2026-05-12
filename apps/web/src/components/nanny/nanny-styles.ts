import type { CSSProperties } from "react";
import { N } from "./tokens";

export const card: CSSProperties = {
  background: N.card,
  border: `1px solid ${N.border}`,
  borderRadius: 18,
  boxShadow: N.shadow,
};

export const btnPrimary: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "12px 24px",
  background: N.green,
  color: "#fff",
  borderRadius: 12,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  border: "none",
  transition: "transform .15s",
};

export const btnGhost: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "11px 20px",
  background: N.card,
  color: N.inkSoft,
  border: `1px solid ${N.border}`,
  borderRadius: 12,
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
};

export const btnAccept: CSSProperties = {
  padding: "9px 18px",
  background: N.greenLt,
  color: N.green,
  border: `1px solid ${N.greenMid}`,
  borderRadius: 10,
  fontSize: 13.5,
  fontWeight: 600,
  cursor: "pointer",
};

export const btnDecline: CSSProperties = {
  padding: "9px 18px",
  background: N.roseLt,
  color: N.rose,
  border: `1px solid color-mix(in srgb, var(--nanny-rose) 35%, transparent)`,
  borderRadius: 10,
  fontSize: 13.5,
  fontWeight: 600,
  cursor: "pointer",
};

export const inputStyle: CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  background: N.cardSoft,
  border: `1px solid ${N.border}`,
  borderRadius: 10,
  fontSize: 14,
  color: N.inkSoft,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};

export const labelStyle: CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: N.inkMute,
  marginBottom: 7,
};
