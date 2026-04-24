import RevealWrapper from "@/src/components/landing/RevealWrapper";
import EnvelopeIllustration from "./EnvelopeIllustration";

const channels = [
  {
    iconBg: "var(--teal-lt)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="4" width="16" height="13" rx="2.5" stroke="var(--teal)" strokeWidth="1.8" />
        <path d="M2 7l8 5 8-5" stroke="var(--teal)" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    label: "Email",
    value: "kinsittr@gmail.com",
  },
  // {
  //   iconBg: "var(--gold-lt)",
  //   icon: (
  //     <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  //       <path d="M3 3h4l2 5-2.5 1.5a11 11 0 0 0 5 5L13 12l5 2v4a1 1 0 0 1-1 1C6 19 1 14 1 4a1 1 0 0 1 1-1z" stroke="var(--gold)" strokeWidth="1.8" fill="none" strokeLinejoin="round" />
  //     </svg>
  //   ),
  //   label: "Phone",
  //   value: "1-800-000-0000",
  // },
  {
    iconBg: "var(--coral-lt)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2C6 2 3 5 3 8c0 5 7 10 7 10s7-5 7-10c0-3-2.5-6-7-6z" stroke="var(--coral)" strokeWidth="1.8" fill="none" />
        <circle cx="10" cy="8" r="2.5" fill="var(--coral)" />
      </svg>
    ),
    label: "Headquarters",
    value: "Calgary, Alberta, Canada",
  },
];

export default function ContactInfo() {
  return (
    <RevealWrapper>
      <div
        className="inline-flex items-center gap-[7px] text-[12px] font-bold uppercase tracking-widest rounded-[30px] px-[13px] py-[5px] mb-[18px] border"
        style={{ color: "var(--teal)", background: "var(--teal-lt)", borderColor: "var(--teal-mid)" }}
      >
        Contact us
      </div>
      <h1 className="font-display leading-[1.1] tracking-[-0.02em] mb-4" style={{ fontSize: "clamp(34px,4.5vw,52px)" }}>
        We&apos;d love to <br /><em style={{ color: "var(--teal)" }}>hear from you.</em>
      </h1>
      <p className="text-[16px] leading-[1.75] mb-9 max-w-[380px]" style={{ color: "var(--muted)" }}>
        Have a question about KinSittr, a safety concern, or want to explore working with us? We&apos;re a small team and we read every message.
      </p>

      {channels.map(({ iconBg, icon, label, value }) => (
        <div key={label} className="flex items-center gap-[14px] mb-5">
          <div
            className="w-[46px] h-[46px] rounded-[12px] flex items-center justify-center shrink-0"
            style={{ background: iconBg }}
          >
            {icon}
          </div>
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-[0.08em] mb-[2px]" style={{ color: "var(--faint)" }}>
              {label}
            </div>
            <div className="text-[15px] font-semibold" style={{ color: "var(--brand-text)" }}>
              {value}
            </div>
          </div>
        </div>
      ))}

      <div className="mt-9">
        <EnvelopeIllustration />
      </div>
    </RevealWrapper>
  );
}
