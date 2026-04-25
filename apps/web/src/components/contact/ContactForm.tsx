"use client";

import { ArrowRightIcon } from "@/src/components/icons";
import { useState } from "react";

const inputClass = `
  w-full border-[1.5px] rounded-[10px] px-[14px] py-3 text-[14px] outline-none transition-all
  focus:bg-white focus:shadow-[0_0_0_3px_rgba(58,90,90,.1)]
`.trim();

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div
      className="bg-white rounded-[22px] p-[36px_32px]"
      style={{ border: "1px solid var(--border)", boxShadow: "0 4px 24px rgba(40,30,20,.07)" }}
    >
      {!submitted ? (
        <>
          <h3 className="font-display text-[22px] mb-[6px]">Send us a message</h3>
          <p className="text-[14px] mb-6" style={{ color: "var(--muted)" }}>
            We usually respond within one business day.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
            <div className="grid grid-cols-2 gap-[14px] max-md:grid-cols-1">
              {["First name", "Last name"].map((label) => (
                <div key={label}>
                  <label className="block text-[12px] font-semibold uppercase tracking-[0.07em] mb-[7px]" style={{ color: "var(--muted)" }}>
                    {label}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={label === "First name" ? "Jordan" : "Lee"}
                    className={inputClass}
                    style={{ borderColor: "var(--border)", background: "var(--bg-warm)", color: "var(--brand-text)" }}
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-[0.07em] mb-[7px]" style={{ color: "var(--muted)" }}>
                Email
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                className={inputClass}
                style={{ borderColor: "var(--border)", background: "var(--bg-warm)", color: "var(--brand-text)" }}
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-[0.07em] mb-[7px]" style={{ color: "var(--muted)" }}>
                I am a…
              </label>
              <select
                className={inputClass}
                style={{ borderColor: "var(--border)", background: "var(--bg-warm)", color: "var(--brand-text)" }}
              >
                <option>Parent / guardian</option>
                <option>Nanny / caregiver</option>
                <option>Press / media</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-[0.07em] mb-[7px]" style={{ color: "var(--muted)" }}>
                Subject
              </label>
              <select
                className={inputClass}
                style={{ borderColor: "var(--border)", background: "var(--bg-warm)", color: "var(--brand-text)" }}
              >
                <option>General enquiry</option>
                <option>Safety concern</option>
                <option>Nanny application</option>
                <option>Account issue</option>
                <option>Partnership</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-[0.07em] mb-[7px]" style={{ color: "var(--muted)" }}>
                Message
              </label>
              <textarea
                required
                placeholder="Tell us what's on your mind…"
                rows={5}
                className={inputClass}
                style={{ borderColor: "var(--border)", background: "var(--bg-warm)", color: "var(--brand-text)", resize: "vertical" }}
              />
            </div>

            <button type="submit" className="btn-cta justify-center" style={{ width: "100%", fontSize: 15, padding: "14px" }}>
              Send message
              <ArrowRightIcon color="#fff" />
            </button>
          </form>
        </>
      ) : (
        <div className="text-center py-5">
          <div className="text-[48px] mb-3">✉️</div>
          <h3 className="font-display text-[24px] mb-2">Message sent!</h3>
          <p className="text-[15px]" style={{ color: "var(--muted)" }}>
            Thanks for reaching out. We&apos;ll get back to you within one business day.
          </p>
        </div>
      )}
    </div>
  );
}
