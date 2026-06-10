import {
  CalendarStepIcon,
  ChatStepIcon,
  SearchStepIcon,
} from "@/src/components/icons";
import type { HowItWorksStep } from "@/src/types/components/landing";
import StepCard from "./StepCard";
import RevealWrapper from "./RevealWrapper";

const steps: HowItWorksStep[] = [
  {
    step: "Step 01",
    title: "Browse profiles",
    description:
      "Filter by location, hourly rate, and specialties. Every profile is hand-reviewed before it appears on KinSittr.",
    icon: <SearchStepIcon />,
  },
  {
    step: "Step 02",
    title: "Request a booking",
    description:
      "Choose your date and duration. Your nanny reviews your request and approves — both sides connect with confidence.",
    icon: <CalendarStepIcon />,
  },
  {
    step: "Step 03",
    title: "Chat & connect",
    description:
      "Once approved, messaging unlocks. Share details, ask questions, and build a real relationship before care begins.",
    icon: <ChatStepIcon />,
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how"
      className="px-[52px] pt-[100px] pb-[80px] max-md:px-7 max-md:pt-[70px] max-md:pb-[70px]"
      style={{ background: "var(--bg-warm)" }}
    >
      <div className="max-w-[1080px] mx-auto">
        <div className="text-center max-w-[520px] mx-auto mb-14">
          <RevealWrapper>
            <div
              className="text-[12px] font-bold uppercase tracking-[0.12em] mb-3"
              style={{ color: "var(--teal)" }}
            >
              How it works
            </div>
          </RevealWrapper>
          <RevealWrapper delay={0.1}>
            <h2
              className="font-display leading-[1.12] tracking-[-0.02em] mb-4"
              style={{ fontSize: "clamp(32px, 4vw, 50px)" }}
            >
              Simple steps to{" "}
              <em style={{ color: "var(--teal)" }}>peace of mind</em>
            </h2>
          </RevealWrapper>
          <RevealWrapper delay={0.2}>
            <p
              className="text-[16.5px] leading-[1.75] max-w-[400px] mx-auto"
              style={{ color: "var(--faint)" }}
            >
              Whether you&apos;re a parent or a nanny, getting started is easy.
            </p>
          </RevealWrapper>
        </div>

        <RevealWrapper>
          <div className="grid grid-cols-3 gap-[2px] mt-14 max-md:grid-cols-1">
            {steps.map((s, i) => (
              <div
                key={s.step}
                className={
                  i === 0
                    ? "rounded-tl-[20px] rounded-bl-[20px] overflow-hidden max-md:rounded-none max-md:first:rounded-t-[20px]"
                    : i === steps.length - 1
                    ? "rounded-tr-[20px] rounded-br-[20px] overflow-hidden max-md:rounded-none max-md:last:rounded-b-[20px]"
                    : "overflow-hidden"
                }
              >
                <StepCard {...s} />
              </div>
            ))}
          </div>
        </RevealWrapper>
      </div>
    </section>
  );
}
