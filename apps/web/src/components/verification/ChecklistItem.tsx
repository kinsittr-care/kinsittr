import { ChecklistCheckIcon } from "@/src/components/icons";

interface ChecklistItemProps {
  title: string;
  description: string;
}

export default function ChecklistItem({ title, description }: ChecklistItemProps) {
  return (
    <div
      className="flex gap-4 items-start bg-white rounded-[14px] px-[22px] py-[20px]"
      style={{ border: "1px solid var(--border)" }}
    >
      <div
        className="w-[36px] h-[36px] rounded-full flex items-center justify-center hrink-0"
        style={{ background: "var(--teal-lt)" }}
      >
        <ChecklistCheckIcon />
      </div>
      <div>
        <p className="font-semibold text-[15px] mb-[5px]" style={{ color: "var(--brand-text)" }}>
          {title}
        </p>
        <p className="text-[14px] leading-[1.65]" style={{ color: "var(--faint)" }}>
          {description}
        </p>
      </div>
    </div>
  );
}
