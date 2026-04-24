import type { SafetyBadgeProps } from "@/src/types/landing";

export default function SafetyBadge({
  icon,
  label,
}: SafetyBadgeProps) {
  return (
    <div
      className="flex items-center gap-[9px] rounded-[12px] px-[18px] py-3 text-[14px] font-medium border"
      style={{
        background: "rgba(255,255,255,.1)",
        borderColor: "rgba(255,255,255,.18)",
        color: "rgba(255,255,255,.9)",
      }}
    >
      {icon}
      {label}
    </div>
  );
}
