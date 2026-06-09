import type { TeamCardProps } from "@/src/types/components/landing";

export default function TeamCard({
  initials,
  avatarBg,
  name,
  role,
  bio,
}: TeamCardProps) {
  return (
    <div
      className="bg-white border rounded-[18px] p-7 text-center"
      style={{ borderColor: "var(--border)" }}
    >
      <div
        className="w-[72px] h-[72px] rounded-full flex items-center justify-center mx-auto mb-[14px] text-white font-bold text-[22px]"
        style={{ background: avatarBg }}
      >
        {initials}
      </div>
      <h4 className="font-bold text-[16px] mb-[3px]">{name}</h4>
      <div className="text-[13px] mb-[10px]" style={{ color: "var(--faint)" }}>{role}</div>
      <p className="text-[13.5px] leading-[1.65]" style={{ color: "var(--faint)" }}>{bio}</p>
    </div>
  );
}
