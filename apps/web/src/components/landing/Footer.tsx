import type { FooterColumn } from "@/src/types/components/landing";
import Logo from "./Logo";

const columns: FooterColumn[] = [
  {
    heading: "Families",
    links: [
      { label: "Join waitlist", href: "/waitlist?role=parent" },
      { label: "Safety",        href: "/safety" },
    ],
  },
  {
    heading: "Nannies",
    links: [
      { label: "Join waitlist", href: "/waitlist?role=nanny" },
      { label: "Verification",  href: "/verification" },
      { label: "Resources",     href: "/nanny-resources" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About",   href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="px-[52px] pt-14 pb-9 max-md:px-7 max-md:pt-12 max-md:pb-8" style={{ background: "var(--brand-text)" }}>
      <div className="flex justify-between gap-10 mb-12 flex-wrap">
        <div>
          <Logo dark />
          <p className="text-[14px] leading-[1.7] max-w-[240px] mt-3" style={{ color: "rgba(255,255,255,.5)" }}>
            Trusted childcare for Canadian families and dedicated nannies.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.heading}>
            <h5 className="text-[11.5px] font-bold uppercase tracking-widest mb-[14px]" style={{ color: "rgba(255,255,255,.4)" }}>
              {col.heading}
            </h5>
            {col.links.map(({ label, href }) => (
              <a key={label} href={href} className="link-white">{label}</a>
            ))}
          </div>
        ))}
      </div>

      <div
        className="flex justify-between items-center flex-wrap gap-[10px] pt-[22px] text-[13px] border-t"
        style={{ color: "rgba(255,255,255,.3)", borderColor: "rgba(255,255,255,.08)" }}
      >
        <span>© 2026 KinSittr Inc.</span>
        <div className="flex gap-5">
          <a href="/privacy" className="link-white-faint">Privacy</a>
          <a href="/terms" className="link-white-faint">Terms</a>
        </div>
      </div>
    </footer>
  );
}
