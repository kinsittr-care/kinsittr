"use client";

import { ArrowRightIcon } from "@/src/components/icons";
import { ContactFormPayload } from "@/src/types/api/api";
import { ApiRequestError } from "@/src/utils/api/api";
import { sendContactMessage } from "@/src/utils/api/contact";
import { ChangeEvent, useState } from "react";

const inputClass = `
  w-full border-[1.5px] rounded-[10px] px-[14px] py-3 text-[14px] outline-none transition-all
  focus:bg-white focus:shadow-[0_0_0_3px_rgba(58,90,90,.1)]
`.trim();

export default function ContactForm() {
  const [formValues, setFormValues] = useState<ContactFormPayload>({
    firstName: "",
    lastName: "",
    email: "",
    role: "Parent / guardian",
    subject: "General enquiry",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await sendContactMessage(formValues);
      setSubmitted(true);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiRequestError || error instanceof Error
          ? error.message
          : "We could not send your message.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
                    name={label === "First name" ? "firstName" : "lastName"}
                    type="text"
                    required
                    placeholder={label === "First name" ? "Jordan" : "Lee"}
                    className={inputClass}
                    value={label === "First name" ? formValues.firstName : formValues.lastName}
                    onChange={handleChange}
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
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className={inputClass}
                value={formValues.email}
                onChange={handleChange}
                style={{ borderColor: "var(--border)", background: "var(--bg-warm)", color: "var(--brand-text)" }}
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-[0.07em] mb-[7px]" style={{ color: "var(--muted)" }}>
                I am a…
              </label>
              <select
                name="role"
                className={inputClass}
                value={formValues.role}
                onChange={handleChange}
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
                name="subject"
                className={inputClass}
                value={formValues.subject}
                onChange={handleChange}
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
                name="message"
                required
                placeholder="Tell us what's on your mind…"
                rows={5}
                className={inputClass}
                value={formValues.message}
                onChange={handleChange}
                style={{ borderColor: "var(--border)", background: "var(--bg-warm)", color: "var(--brand-text)", resize: "vertical" }}
              />
            </div>

            {errorMessage ? (
              <p className="text-[13px]" style={{ color: "#b34b39" }}>
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              className="btn-cta justify-center"
              style={{ width: "100%", fontSize: 15, padding: "14px", opacity: isSubmitting ? 0.8 : 1 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send message"}
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
