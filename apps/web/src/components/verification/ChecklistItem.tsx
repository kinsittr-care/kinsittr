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
        className="w-[36px] h-[36px] rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: "var(--teal-lt)" }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8 l3.5 3.5L13 4" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div>
        <p className="font-semibold text-[15px] mb-[5px]" style={{ color: "var(--brand-text)" }}>
          {title}
        </p>
        <p className="text-[14px] leading-[1.65]" style={{ color: "var(--muted)" }}>
          {description}
        </p>
      </div>
    </div>
  );
}
