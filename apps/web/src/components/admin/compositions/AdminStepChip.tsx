import { A } from "../tokens";

function Check({ on }: { on: boolean }) {
  return on ? (
    <svg width="14" height="14" viewBox="0 0 14 14">
      <path
        d="M2 7l3.5 3.5L12 3.5"
        fill="none"
        stroke={A.green}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 14 14">
      <circle cx="7" cy="7" r="5.5" fill="none" stroke={A.inkFaint} strokeWidth="1.5" />
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
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "7px 13px",
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 500,
        background: done ? A.greenLight : "transparent",
        color: done ? A.green : A.inkSoft,
        border: `1px solid ${
          done
            ? "color-mix(in srgb, var(--admin-green) 55%, transparent)"
            : A.border
        }`,
      }}
    >
      <Check on={done} />
      {label}
    </span>
  );
}
