"use client";

import { ChangeEvent, SyntheticEvent, useState } from "react";
import Link from "next/link";
import { ApiRequestError } from "@/src/utils/api/api";
import { requestPasswordRecovery } from "@/src/utils/api/auth";

const inputClass = `
  w-full border-[1.5px] rounded-[10px] px-[14px] py-3 text-[14px] outline-none transition-all
  focus:bg-white focus:shadow-[0_0_0_3px_rgba(58,90,90,.1)]
`.trim();

const inputStyle = {
  borderColor: "var(--border)",
  background: "var(--bg-warm)",
  color: "var(--brand-text)",
};

export default function RecoveryRequestView() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await requestPasswordRecovery({ email });
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof ApiRequestError || err instanceof Error
          ? err.message
          : "We could not process the request. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col gap-5 text-center">
        <div>
          <h2 className="font-display text-[24px] leading-tight">Check your email</h2>
          <p className="mt-3 text-[14px] leading-6" style={{ color: "var(--muted)" }}>
            If an account exists for that email, we sent a password reset link. The link expires soon.
          </p>
        </div>
        <Link href="/auth/parent" className="btn-cta justify-center" style={{ width: "100%", fontSize: 15, padding: "14px" }}>
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
      <div>
        <h2 className="font-display text-[24px] leading-tight">Reset your password</h2>
        <p className="mt-3 text-[14px] leading-6" style={{ color: "var(--muted)" }}>
          Enter your account email and we will send reset instructions if the account exists.
        </p>
      </div>

      <div>
        <label className="block text-[12px] font-semibold uppercase tracking-[0.07em] mb-[7px]" style={{ color: "var(--faint)" }}>
          Email
        </label>
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className={inputClass}
          value={email}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      {error && <p className="text-[13px]" style={{ color: "#b34b39" }}>{error}</p>}

      <button
        type="submit"
        className="btn-cta justify-center"
        style={{ width: "100%", fontSize: 15, padding: "14px", opacity: isSubmitting ? 0.8 : 1 }}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Sending…" : "Send reset link"}
      </button>

      <Link href="/auth/parent" className="text-center text-[13px] font-semibold" style={{ color: "var(--teal)" }}>
        Back to sign in
      </Link>
    </form>
  );
}
