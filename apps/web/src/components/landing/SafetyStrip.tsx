import type { SafetyBadgeItem } from "@/src/types/landing";
import SafetyBadge from "./SafetyBadge";
import RevealWrapper from "./RevealWrapper";

const badges: SafetyBadgeItem[] = [
  {
    label: "Background check",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 1l7 3v6c0 4.4-3 8.3-7 9.4C6 18.3 3 14.4 3 10V4l7-3z"
          stroke="rgba(255,255,255,.7)"
          strokeWidth="1.5"
          fill="rgba(255,255,255,.1)"
        />
        <path
          d="M7 10l2 2 4-4"
          stroke="rgba(255,255,255,.8)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Reference verified",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="7" r="4" stroke="rgba(255,255,255,.7)" strokeWidth="1.5" />
        <path
          d="M3 17c0-3.3 3.1-6 7-6s7 2.7 7 6"
          stroke="rgba(255,255,255,.7)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: "Interview screened",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect
          x="2"
          y="5"
          width="16"
          height="12"
          rx="2.5"
          stroke="rgba(255,255,255,.7)"
          strokeWidth="1.5"
        />
        <path
          d="M6 5V4a4 4 0 0 1 8 0v1"
          stroke="rgba(255,255,255,.7)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function SafetyStrip() {
  return (
    <RevealWrapper>
      <div
        className="flex items-center gap-[60px] flex-wrap px-[52px] py-[60px] max-md:px-7 max-md:py-12"
        style={{ background: "var(--teal-dk)", color: "#fff" }}
      >
        <div className="flex-1 min-w-[260px]">
          <h3
            className="font-display text-[28px] mb-[10px]"
            style={{ color: "#fff" }}
          >
            Safety isn&apos;t an afterthought.
          </h3>
          <p
            className="text-[15px] leading-[1.7] max-w-[440px]"
            style={{ color: "rgba(255,255,255,.72)" }}
          >
            Every nanny on KinSittr goes through a multi-step verification
            process before their profile goes live. Your family&apos;s safety is
            our foundation.
          </p>
        </div>
        <div className="flex gap-[14px] flex-wrap">
          {badges.map((b) => (
            <SafetyBadge key={b.label} {...b} />
          ))}
        </div>
      </div>
    </RevealWrapper>
  );
}
