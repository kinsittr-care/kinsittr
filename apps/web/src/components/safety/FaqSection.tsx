"use client";

import { useState } from "react";
import RevealWrapper from "@/src/components/landing/RevealWrapper";

const faqs = [
  {
    q: "How long does verification take?",
    a: "The full process typically takes 5–7 business days. We don't rush it — thoroughness is the point.",
  },
  {
    q: "What if a nanny has a minor on their record?",
    a: "We review each case individually. Serious offences involving children, violence, or fraud result in an automatic permanent decline with no exceptions.",
  },
  {
    q: "Can I report a concern about a nanny?",
    a: "Yes — always. Use the report button in the app, or contact our team directly. All reports are reviewed within 24 hours.",
  },
  {
    q: "Are nannies re-verified over time?",
    a: "Background checks are renewed annually. Nannies who receive concerning reports are placed under temporary review immediately.",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-[90px]">
      <div className="mx-auto px-[52px] max-w-[700px] max-md:px-6">
        <RevealWrapper>
          <div
            className="mb-[18px] inline-flex items-center gap-[7px] rounded-[30px] border border-teal-mid bg-teal-lt px-[13px] py-[5px] text-[12px] font-bold uppercase tracking-widest text-teal"
          >
            FAQ
          </div>
          <h2 className="font-display mb-10 text-[clamp(26px,3vw,38px)] leading-[1.1] tracking-[-0.02em]">
            Common questions
          </h2>
        </RevealWrapper>

        <div>
          {faqs.map((f, i) => (
            <div key={f.q} className="border-b border-(--border)">
              <button
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-[16px] font-semibold text-brand-text">
                  {f.q}
                </span>
                <span
                  className={`shrink-0 text-[22px] text-teal transition-transform ${open === i ? "rotate-45" : ""}`}
                >
                  +
                </span>
              </button>
              {open === i && (
                <p className="pb-5 text-[14.5px] leading-[1.75] text-brand-faint">
                  {f.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
