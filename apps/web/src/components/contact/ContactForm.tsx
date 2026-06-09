"use client";

import { ArrowRightIcon } from "@/src/components/icons";
import { ContactFormPayload } from "@/src/types/api/api";
import { ApiRequestError } from "@/src/utils/api/api";
import { sendContactMessage } from "@/src/utils/api/contact";
import { ChangeEvent, useState } from "react";

const inputClass = `
  w-full border-[1.5px] rounded-[10px] px-[14px] py-3 text-[14px] outline-none transition-all
  border-[var(--border)] bg-[var(--bg-warm)] text-[var(--brand-text)]
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
      className="rounded-[22px] border border-[var(--border)] bg-white p-[36px_32px] shadow-[0_4px_24px_rgba(40,30,20,.07)]"
    >
      {!submitted ? (
        <>
          <h3 className="font-display text-[22px] mb-[6px]">Send us a message</h3>
          <p className="mb-6 text-[14px] text-[var(--faint)]">
            We usually respond within one business day.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
            <div className="grid grid-cols-2 gap-[14px] max-md:grid-cols-1">
              {["First name", "Last name"].map((label) => (
                <div key={label}>
                  <label className="mb-[7px] block text-[12px] font-semibold uppercase tracking-[0.07em] text-[var(--faint)]">
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
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="mb-[7px] block text-[12px] font-semibold uppercase tracking-[0.07em] text-[var(--faint)]">
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
              />
            </div>

            <div>
              <label className="mb-[7px] block text-[12px] font-semibold uppercase tracking-[0.07em] text-[var(--faint)]">
                I am a…
              </label>
              <select
                name="role"
                className={inputClass}
                value={formValues.role}
                onChange={handleChange}
              >
                <option>Parent / guardian</option>
                <option>Nanny / caregiver</option>
                <option>Press / media</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="mb-[7px] block text-[12px] font-semibold uppercase tracking-[0.07em] text-[var(--faint)]">
                Subject
              </label>
              <select
                name="subject"
                className={inputClass}
                value={formValues.subject}
                onChange={handleChange}
              >
                <option>General enquiry</option>
                <option>Safety concern</option>
                <option>Nanny application</option>
                <option>Account issue</option>
                <option>Partnership</option>
              </select>
            </div>

            <div>
              <label className="mb-[7px] block text-[12px] font-semibold uppercase tracking-[0.07em] text-[var(--faint)]">
                Message
              </label>
              <textarea
                name="message"
                required
                placeholder="Tell us what's on your mind…"
                rows={5}
                className={`${inputClass} resize-y`}
                value={formValues.message}
                onChange={handleChange}
              />
            </div>

            {errorMessage ? (
              <p className="text-[13px] text-[#b34b39]">
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              className="btn-cta w-full justify-center p-[14px] text-[15px] disabled:opacity-80"
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
          <p className="text-[15px] text-[var(--faint)]">
            Thanks for reaching out. We&apos;ll get back to you within one business day.
          </p>
        </div>
      )}
    </div>
  );
}
