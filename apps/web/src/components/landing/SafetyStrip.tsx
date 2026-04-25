import {
  BackgroundCheckIcon,
  InterviewScreenedIcon,
  ReferenceVerifiedIcon,
} from "@/src/components/icons";
import type { SafetyBadgeItem } from "@/src/types/components/landing";
import SafetyBadge from "./SafetyBadge";
import RevealWrapper from "./RevealWrapper";

const badges: SafetyBadgeItem[] = [
  {
    label: "Background check",
    icon: <BackgroundCheckIcon />,
  },
  {
    label: "Reference verified",
    icon: <ReferenceVerifiedIcon />,
  },
  {
    label: "Interview screened",
    icon: <InterviewScreenedIcon />,
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
