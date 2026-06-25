"use client";

import { ArrowRightIcon } from "@/src/components/icons";
import { ApiRequestError } from "@/src/utils/api/api";
import { sendContactMessage } from "@/src/utils/api/contact";
import { type ChangeEvent, type FormEvent, type ReactNode, useState } from "react";

type WaitlistRole = "Parent / guardian" | "Nanny / caregiver";

interface WaitlistFormValues {
  firstName: string;
  lastName: string;
  email: string;
  role: WaitlistRole;
  city: string;
  message: string;
}

interface WaitlistFormProps {
  initialRole?: "parent" | "nanny";
}

const inputClass = `
  w-full border-[1.5px] rounded-[10px] px-[14px] py-3 text-[14px] outline-none transition-all
  border-[var(--border)] bg-[var(--bg-warm)] text-[var(--brand-text)]
  focus:bg-white focus:shadow-[0_0_0_3px_rgba(58,90,90,.1)]
`.trim();

function initialValuesForRole(role?: WaitlistFormProps["initialRole"]): WaitlistFormValues {
  return {
    firstName: "",
    lastName: "",
    email: "",
    role: role === "nanny" ? "Nanny / caregiver" : "Parent / guardian",
    city: "",
    message: "",
  };
}

export default function WaitlistForm({ initialRole }: WaitlistFormProps) {
  const [formValues, setFormValues] = useState<WaitlistFormValues>(() => initialValuesForRole(initialRole));
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const cityLine = formValues.city.trim() ? `City: ${formValues.city.trim()}` : "City: Not provided";
      const noteLine = formValues.message.trim() ? `Note: ${formValues.message.trim()}` : "Note: Not provided";

      await sendContactMessage({
        firstName: formValues.firstName.trim(),
        lastName: formValues.lastName.trim(),
        email: formValues.email.trim(),
        role: formValues.role,
        subject: `Waitlist: ${formValues.role}`,
        message: `${cityLine}\n${noteLine}`,
      });
      setSubmitted(true);
      setFormValues(initialValuesForRole(initialRole));
    } catch (error) {
      setErrorMessage(
        error instanceof ApiRequestError || error instanceof Error
          ? error.message
          : "We could not add you to the waitlist.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-[26px] border border-[var(--border)] bg-white p-8 text-center shadow-[0_4px_24px_rgba(40,30,20,.07)] sm:p-10">
        <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-teal">You are on the list</p>
        <h2 className="mt-3 font-display text-[32px] leading-tight text-[var(--brand-text)]">
          We will email you when KinSittr opens access.
        </h2>
        <p className="mx-auto mt-4 max-w-[460px] text-[15px] leading-7 text-[var(--faint)]">
          Thanks for joining early. We are inviting families and caregivers in small batches so the experience stays reliable.
        </p>
        <button
          type="button"
          className="btn-outline mt-7"
          onClick={() => setSubmitted(false)}
        >
          Add another person
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-[26px] border border-[var(--border)] bg-white p-7 shadow-[0_4px_24px_rgba(40,30,20,.07)] sm:p-9">
      <h2 className="font-display text-[28px] leading-tight text-[var(--brand-text)]">Join the waitlist</h2>
      <p className="mt-2 text-[14px] leading-6 text-[var(--faint)]">
        Tell us how you plan to use KinSittr. We will use this to send the right launch invite.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-[18px]">
        <div className="grid grid-cols-2 gap-[14px] max-md:grid-cols-1">
          <Field label="First name">
            <input
              name="firstName"
              type="text"
              required
              placeholder="Jordan"
              className={inputClass}
              value={formValues.firstName}
              onChange={handleChange}
            />
          </Field>
          <Field label="Last name">
            <input
              name="lastName"
              type="text"
              required
              placeholder="Lee"
              className={inputClass}
              value={formValues.lastName}
              onChange={handleChange}
            />
          </Field>
        </div>

        <Field label="Email">
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className={inputClass}
            value={formValues.email}
            onChange={handleChange}
          />
        </Field>

        <div className="grid grid-cols-2 gap-[14px] max-md:grid-cols-1">
          <Field label="I am joining as">
            <select name="role" required className={inputClass} value={formValues.role} onChange={handleChange}>
              <option>Parent / guardian</option>
              <option>Nanny / caregiver</option>
            </select>
          </Field>
          <Field label="City">
            <input
              name="city"
              type="text"
              placeholder="Toronto"
              className={inputClass}
              value={formValues.city}
              onChange={handleChange}
            />
          </Field>
        </div>

        <Field label="Anything we should know?">
          <textarea
            name="message"
            rows={4}
            placeholder="Optional: timing, childcare needs, caregiver experience, or questions."
            className={`${inputClass} resize-y`}
            value={formValues.message}
            onChange={handleChange}
          />
        </Field>

        {errorMessage ? (
          <p className="rounded-[12px] bg-[#fff0ec] px-4 py-3 text-[13px] text-[#b34b39]">
            {errorMessage}
          </p>
        ) : null}

        <button
          type="submit"
          className="btn-cta w-full justify-center p-[14px] text-[15px] disabled:opacity-80"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Joining..." : "Join waitlist"}
          <ArrowRightIcon color="#fff" />
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-[7px] block text-[12px] font-semibold uppercase tracking-[0.07em] text-[var(--faint)]">
        {label}
      </span>
      {children}
    </label>
  );
}
