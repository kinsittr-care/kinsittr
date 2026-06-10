"use client";

import { ChangeEvent, SyntheticEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ApiRequestError } from "@/src/utils/api/api";
import { resetPasswordWithRecovery, verifyPasswordRecovery } from "@/src/utils/api/auth";

const inputClass = `
  w-full border-[1.5px] rounded-[10px] px-[14px] py-3 text-[14px] outline-none transition-all
  border-[var(--border)] bg-[var(--bg-warm)] text-[var(--brand-text)]
  focus:bg-white focus:shadow-[0_0_0_3px_rgba(58,90,90,.1)]
`.trim();

interface RecoveryResetViewProps {
  token: string;
}

export default function RecoveryResetView({ token }: RecoveryResetViewProps) {
  const [password, setPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function verifyToken() {
      if (!token) {
        setIsVerifying(false);
        setIsValidToken(false);
        setError("This reset link is invalid or expired.");
        return;
      }
      try {
        await verifyPasswordRecovery({ token });
        if (!active) return;
        setIsValidToken(true);
      } catch {
        if (!active) return;
        setError("This reset link is invalid or expired.");
        setIsValidToken(false);
      } finally {
        if (active) setIsVerifying(false);
      }
    }
    verifyToken();
    return () => {
      active = false;
    };
  }, [token]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPasswordWithRecovery({ token, new_password: password });
      setIsComplete(true);
    } catch (err) {
      setError(
        err instanceof ApiRequestError || err instanceof Error
          ? err.message
          : "We could not reset your password. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isVerifying) {
    return <p className="text-center text-[14px] text-[var(--faint)]">Checking reset link…</p>;
  }

  if (isComplete) {
    return (
      <div className="flex flex-col gap-5 text-center">
        <div>
          <h2 className="font-display text-[24px] leading-tight">Password updated</h2>
          <p className="mt-3 text-[14px] leading-6 text-[var(--faint)]">
            You can now sign in with your new password.
          </p>
        </div>
        <Link href="/auth/parent" className="btn-cta w-full justify-center p-[14px] text-[15px]">
          Sign in
        </Link>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="flex flex-col gap-5 text-center">
        <p className="text-[14px] text-[#b34b39]">{error}</p>
        <Link href="/auth/forgot-password" className="btn-cta w-full justify-center p-[14px] text-[15px]">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
      <div>
        <h2 className="font-display text-[24px] leading-tight">Create a new password</h2>
        <p className="mt-3 text-[14px] leading-6 text-[var(--faint)]">
          Choose a new password with at least 8 characters.
        </p>
      </div>

      <div>
        <label className="mb-[7px] block text-[12px] font-semibold uppercase tracking-[0.07em] text-[var(--faint)]">
          New password
        </label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Min. 8 characters"
          className={inputClass}
          value={password}
          onChange={handleChange}
        />
      </div>

      {error && <p className="text-[13px] text-[#b34b39]">{error}</p>}

      <button
        type="submit"
        className="btn-cta w-full justify-center p-[14px] text-[15px] disabled:opacity-80"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Updating…" : "Reset password"}
      </button>
    </form>
  );
}
