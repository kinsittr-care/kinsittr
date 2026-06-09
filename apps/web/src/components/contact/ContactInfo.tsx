import { MailIcon, MapPinIcon } from "@/src/components/icons";
import RevealWrapper from "@/src/components/landing/RevealWrapper";
import EnvelopeIllustration from "./EnvelopeIllustration";

const channels = [
  {
    iconBgClass: "bg-[var(--teal-lt)]",
    icon: <MailIcon />,
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
    iconBgClass: "bg-[var(--coral-lt)]",
    icon: <MapPinIcon />,
    label: "Headquarters",
    value: "Calgary, Alberta, Canada",
  },
];

export default function ContactInfo() {
  return (
    <RevealWrapper>
      <div
        className="mb-[18px] inline-flex items-center gap-[7px] rounded-[30px] border border-[var(--teal-mid)] bg-[var(--teal-lt)] px-[13px] py-[5px] text-[12px] font-bold uppercase tracking-widest text-[var(--teal)]"
      >
        Contact us
      </div>
      <h1 className="font-display mb-4 text-[clamp(34px,4.5vw,52px)] leading-[1.1] tracking-[-0.02em]">
        We&apos;d love to <br /><em className="text-[var(--teal)]">hear from you.</em>
      </h1>
      <p className="mb-9 max-w-[380px] text-[16px] leading-[1.75] text-[var(--faint)]">
        Have a question about KinSittr, a safety concern, or want to explore working with us? We&apos;re a small team and we read every message.
      </p>

      {channels.map(({ iconBgClass, icon, label, value }) => (
        <div key={label} className="flex items-center gap-[14px] mb-5">
          <div
            className={`flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl ${iconBgClass}`}
          >
            {icon}
          </div>
          <div>
            <div className="mb-[2px] text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--faint)]">
              {label}
            </div>
            <div className="text-[15px] font-semibold text-[var(--brand-text)]">
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
