interface ResourceItemProps {
  tag: string;
  tagStyle: React.CSSProperties;
  title: string;
  description: string;
}

export default function ResourceItem({ tag, tagStyle, title, description }: ResourceItemProps) {
  return (
    <div
      className="flex items-center gap-4 bg-white px-[22px] py-[20px] transition-colors"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <span
        className="text-[11px] font-bold uppercase tracking-[0.07em] rounded-full px-[10px] py-[4px] shrink-0"
        style={tagStyle}
      >
        {tag}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[15px] mb-[3px]" style={{ color: "var(--brand-text)" }}>
          {title}
        </p>
        <p className="text-[13px] leading-[1.6]" style={{ color: "var(--faint)" }}>
          {description}
        </p>
      </div>
      <span className="text-[18px] ml-auto shrink-0" style={{ color: "var(--faint)" }}>→</span>
    </div>
  );
}
