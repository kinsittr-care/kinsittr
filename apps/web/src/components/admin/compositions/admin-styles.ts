import type { CSSProperties } from "react";
import { A } from "../tokens";

export const card: CSSProperties = {
  background: A.card,
  border: `1px solid ${A.border}`,
  borderRadius: 16,
  padding: "22px 24px",
  boxShadow: A.shadow,
};

export const btnPrimary: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "11px 22px",
  background: A.clay,
  color: "#fff",
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  border: "none",
};

export const btnGhost: CSSProperties = {
  padding: "10px 16px",
  background: A.card,
  color: A.inkMid,
  border: `1px solid ${A.border}`,
  borderRadius: 10,
  fontSize: 13.5,
  fontWeight: 500,
  cursor: "pointer",
};

export const btnGhostSm: CSSProperties = {
  padding: "7px 16px",
  background: A.card,
  color: A.clay,
  border: `1px solid color-mix(in srgb, var(--admin-clay) 55%, transparent)`,
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

export const btnApprove: CSSProperties = {
  padding: "10px 18px",
  background: A.greenLight,
  color: A.green,
  border: `1px solid color-mix(in srgb, var(--admin-green) 55%, transparent)`,
  borderRadius: 10,
  fontSize: 13.5,
  fontWeight: 600,
  cursor: "pointer",
};

export const btnDanger: CSSProperties = {
  padding: "10px 18px",
  background: A.redLight,
  color: A.red,
  border: `1px solid color-mix(in srgb, var(--admin-red) 55%, transparent)`,
  borderRadius: 10,
  fontSize: 13.5,
  fontWeight: 600,
  cursor: "pointer",
};
