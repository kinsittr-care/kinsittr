import type { StepCardProps } from "@/src/types/landing";

export default function StepCard({
  step,
  title,
  description,
  icon,
}: StepCardProps) {
  return (
    <div className="bg-white px-[30px] py-9">
      <div
        className="flex items-center gap-2 font-display text-[13px] mb-5"
        style={{ color: "var(--teal)", letterSpacing: "0.06em" }}
      >
        {step}
        <span
          className="flex-1 h-px"
          style={{ background: "var(--border)" }}
        />
      </div>
      <div className="mb-[22px]">{icon}</div>
      <h3 className="font-display text-[22px] mb-[10px]">{title}</h3>
      <p
        className="text-[14.5px] leading-[1.7]"
        style={{ color: "var(--muted)" }}
      >
        {description}
      </p>
    </div>
  );
}
