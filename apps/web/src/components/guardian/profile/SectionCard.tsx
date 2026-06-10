import type { ReactNode } from "react";

export default function SectionCard({
  title,
  titleAction,
  children,
}: {
  title: string;
  titleAction?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="bg-[#fdfaf5] border border-brand-border rounded-2xl p-6 mb-5 shadow-[0_2px_12px_rgba(40,30,20,.07)]">
      <div className="flex items-center justify-between gap-3 mb-[18px]">
        <h3 className="text-[11.5px] font-semibold text-brand-faint uppercase tracking-[0.1em] m-0">
          {title}
        </h3>
        {titleAction}
      </div>
      {children}
    </div>
  );
}
