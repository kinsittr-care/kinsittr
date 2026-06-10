import { cn } from "@/lib/utils";

function Check({ on }: { on: boolean }) {
  return on ? (
    <svg width="14" height="14" viewBox="0 0 14 14">
      <path
        d="M2 7l3.5 3.5L12 3.5"
        fill="none"
        stroke="var(--admin-green)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 14 14">
      <circle cx="7" cy="7" r="5.5" fill="none" stroke="var(--admin-ink-faint)" strokeWidth="1.5" />
    </svg>
  );
}

export default function AdminStepChip({
  label,
  done,
}: {
  label: string;
  done: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[7px] px-[13px] py-[7px] rounded-full text-[12px] font-medium border",
        done
          ? "bg-admin-green-light text-admin-green border-[color-mix(in_srgb,var(--admin-green)_55%,transparent)]"
          : "bg-transparent text-admin-ink-soft border-admin-border",
      )}
    >
      <Check on={done} />
      {label}
    </span>
  );
}
