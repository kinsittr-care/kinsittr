import type { ReactNode } from "react";

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
    <div className="flex flex-col gap-3 px-4 pt-6 pb-5 md:flex-row md:items-end md:justify-between md:gap-6 md:px-10 md:pt-8 md:pb-[22px] border-b border-admin-divider bg-admin-bg shrink-0">
      <div>
        <h1 className="font-display text-[32px] font-normal text-admin-ink leading-[1.1] tracking-[-0.01em]">
          {title}
        </h1>
        {subtitle && (
          <div className="mt-2 text-[14.5px] text-admin-ink-soft">
            {subtitle}
          </div>
        )}
      </div>
      {right && <div className="overflow-x-auto pb-0.5 [scrollbar-width:none]">{right}</div>}
    </div>
  );
}
