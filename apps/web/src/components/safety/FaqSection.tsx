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
    <section style={{ padding: "90px 0" }}>
      <div className="mx-auto px-[52px] max-w-[700px] max-md:px-6">
        <RevealWrapper>
          <div
            className="inline-flex items-center gap-[7px] text-[12px] font-bold uppercase tracking-[0.1em] rounded-[30px] px-[13px] py-[5px] mb-[18px] border"
            style={{ color: "var(--teal)", background: "var(--teal-lt)", borderColor: "var(--teal-mid)" }}
          >
            FAQ
          </div>
          <h2 className="font-display leading-[1.1] tracking-[-0.02em] mb-10" style={{ fontSize: "clamp(26px,3vw,38px)" }}>
            Common questions
          </h2>
        </RevealWrapper>

        <div>
          {faqs.map((f, i) => (
            <div key={f.q} style={{ borderBottom: "1px solid var(--border)" }}>
              <button
                className="w-full flex items-center justify-between gap-4 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-semibold text-[16px]" style={{ color: "var(--brand-text)" }}>
                  {f.q}
                </span>
                <span
                  className="text-[22px] flex-shrink-0 transition-transform"
                  style={{ color: "var(--teal)", transform: open === i ? "rotate(45deg)" : "none" }}
                >
                  +
                </span>
              </button>
              {open === i && (
                <p className="pb-5 text-[14.5px] leading-[1.75]" style={{ color: "var(--muted)" }}>
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
