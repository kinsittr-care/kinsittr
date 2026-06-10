"use client";

import { ChangeEvent, SyntheticEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiRequestError, ApiResponse } from "@/src/utils/api/api";
import { establishAuthSession, loginUser } from "@/src/utils/api/auth";
import { getPostAuthRedirectPath } from "@/src/utils/api/auth-routing";
import { clearAuthSession } from "@/src/utils/api/session";
import { AuthSession, AuthTokenPair, AuthUser, LoginPayload } from "@/src/types/api/api";
import PasswordField from "./PasswordField";
import AuthErrorDialog from "./AuthErrorDialog";

const inputClass = `
  w-full border-[1.5px] rounded-[10px] px-[14px] py-3 text-[14px] outline-none transition-all
  border-[var(--border)] bg-[var(--bg-warm)] text-[var(--brand-text)]
  focus:bg-white focus:shadow-[0_0_0_3px_rgba(58,90,90,.1)]
`.trim();

interface LoginFormProps {
  establishSession?: (auth: AuthTokenPair) => Promise<AuthSession>;
  login?: (payload: LoginPayload) => Promise<ApiResponse<AuthTokenPair>>;
  onSuccess?: () => void;
  requiredRole?: AuthUser["role"];
}

export default function LoginForm({
  establishSession = establishAuthSession,
  login = loginUser,
  onSuccess,
  requiredRole,
}: LoginFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<LoginPayload>({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await login(values);
      const session = await establishSession(response.data as NonNullable<typeof response.data>);
      if (requiredRole && session.user.role !== requiredRole) {
        clearAuthSession();
        setError("Use an authorized admin account to sign in.");
        return;
      }
      onSuccess?.();
      router.push(getPostAuthRedirectPath(session.user));
    } catch (err) {
      setError(
        err instanceof ApiRequestError || err instanceof Error
          ? err.message
          : "Login failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
      <div>
        <label
          className="mb-[7px] block text-[12px] font-semibold uppercase tracking-[0.07em] text-[var(--faint)]"
        >
          Email
        </label>
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className={inputClass}
          value={values.email}
          onChange={handleChange}
        />
      </div>

      <div>
        <label
          className="mb-[7px] block text-[12px] font-semibold uppercase tracking-[0.07em] text-[var(--faint)]"
        >
          Password
        </label>
        <PasswordField
          value={values.password}
          onChange={handleChange}
          placeholder="••••••••"
          inputClass={inputClass}
        />
      </div>

      <div className="text-right -mt-2">
        <Link href="/auth/forgot-password" className="text-[13px] font-semibold text-[var(--teal)]">
          Forgot password?
        </Link>
      </div>

      <AuthErrorDialog message={error} onClose={() => setError("")} />

      <button
        type="submit"
        className="btn-cta w-full justify-center p-[14px] text-[15px] disabled:opacity-80"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
