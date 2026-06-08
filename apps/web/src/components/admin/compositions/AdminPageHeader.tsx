import type { ReactNode } from "react";
import { A } from "../tokens";

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
      className="flex flex-col gap-3 px-4 pt-6 pb-5 md:flex-row md:items-end md:justify-between md:gap-6 md:px-10 md:pt-8 md:pb-[22px]"
      style={{ borderBottom: `1px solid ${A.divider}`, background: A.bg, flexShrink: 0 }}
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
      {right && <div className="overflow-x-auto pb-0.5 [scrollbar-width:none]">{right}</div>}
    </div>
  );
}
