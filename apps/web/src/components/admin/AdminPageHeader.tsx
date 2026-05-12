import type { ReactNode } from "react";
import { A } from "./tokens";

export default function AdminPageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        padding: "34px 40px 22px",
        gap: 24,
        borderBottom: `1px solid ${A.divider}`,
        background: A.bg,
        flexShrink: 0,
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: "var(--font-dm-serif), serif",
            fontSize: 32,
            fontWeight: 400,
            color: A.ink,
            lineHeight: 1.1,
            letterSpacing: "-.01em",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <div style={{ marginTop: 8, fontSize: 14.5, color: A.inkSoft }}>
            {subtitle}
          </div>
        )}
      </div>
      {right}
    </div>
  );
}
