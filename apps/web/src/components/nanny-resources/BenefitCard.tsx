interface BenefitCardProps {
  iconBg: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function BenefitCard({ iconBg, icon, title, description }: BenefitCardProps) {
  return (
    <div
      className="bg-white rounded-[18px] p-[26px]"
      style={{ border: "1px solid var(--border)" }}
    >
      <div
        className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center mb-4"
        style={{ background: iconBg }}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-[16px] mb-2" style={{ color: "var(--brand-text)" }}>
        {title}
      </h3>
      <p className="text-[14px] leading-[1.7]" style={{ color: "var(--faint)" }}>
        {description}
      </p>
    </div>
  );
}
