export default function ValueCard({
  iconBg,
  icon,
  title,
  description,
}: {
  iconBg: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div
      className="bg-white border rounded-[18px] p-[26px]"
      style={{ borderColor: "var(--border)" }}
    >
      <div
        className="w-12 h-12 rounded-[13px] flex items-center justify-center mb-[14px]"
        style={{ background: iconBg }}
      >
        {icon}
      </div>
      <h3 className="font-bold text-[16px] mb-[7px]">{title}</h3>
      <p className="text-[14px] leading-[1.65]" style={{ color: "var(--muted)" }}>
        {description}
      </p>
    </div>
  );
}
