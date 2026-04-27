"use client";

import { ChangeEvent, FormEventHandler, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiRequestError } from "@/src/utils/api";
import { establishAuthSession, loginUser } from "@/src/utils/api/auth";
import { getPostAuthRedirectPath } from "@/src/utils/auth-routing";
import { LoginPayload } from "@/src/types/api/api";

const inputClass = `
  w-full border-[1.5px] rounded-[10px] px-[14px] py-3 text-[14px] outline-none transition-all
  focus:bg-white focus:shadow-[0_0_0_3px_rgba(58,90,90,.1)]
`.trim();

const inputStyle = {
  borderColor: "var(--border)",
  background: "var(--bg-warm)",
  color: "var(--brand-text)",
};

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<LoginPayload>({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await loginUser(values);
      const session = await establishAuthSession(response.data as NonNullable<typeof response.data>);
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
          className="block text-[12px] font-semibold uppercase tracking-[0.07em] mb-[7px]"
          style={{ color: "var(--muted)" }}
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
          style={inputStyle}
        />
      </div>

      <div>
        <label
          className="block text-[12px] font-semibold uppercase tracking-[0.07em] mb-[7px]"
          style={{ color: "var(--muted)" }}
        >
          Password
        </label>
        <input
          name="password"
          type="password"
          required
          placeholder="••••••••"
          className={inputClass}
          value={values.password}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      {error && (
        <p className="text-[13px]" style={{ color: "#b34b39" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        className="btn-cta justify-center"
        style={{ width: "100%", fontSize: 15, padding: "14px", opacity: isSubmitting ? 0.8 : 1 }}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
