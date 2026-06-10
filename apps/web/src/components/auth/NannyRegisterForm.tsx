"use client";

import { ChangeEvent, SyntheticEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiRequestError } from "@/src/utils/api/api";
import { establishAuthSession, registerNanny } from "@/src/utils/api/auth";
import { getPostAuthRedirectPath } from "@/src/utils/api/auth-routing";
import { RegisterNannyPayload } from "@/src/types/api/api";
import PasswordField from "./PasswordField";
import AuthErrorDialog from "./AuthErrorDialog";

const inputClass = `
  w-full border-[1.5px] rounded-[10px] px-[14px] py-3 text-[14px] outline-none transition-all
  border-[var(--border)] bg-[var(--bg-warm)] text-[var(--brand-text)]
  focus:bg-white focus:shadow-[0_0_0_3px_rgba(58,90,90,.1)]
`.trim();

const labelClass = "mb-[7px] block text-[12px] font-semibold uppercase tracking-[0.07em] text-[var(--faint)]";

interface NannyRegisterFormProps {
  onSuccess?: () => void;
}

const initialValues: RegisterNannyPayload = {
  firstname: "",
  lastname: "",
  email: "",
  password: "",
};

export default function NannyRegisterForm({ onSuccess }: NannyRegisterFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<RegisterNannyPayload>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((v) => ({
      ...v,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await registerNanny(values);
      const session = await establishAuthSession(response.data as NonNullable<typeof response.data>);
      onSuccess?.();
      router.push(getPostAuthRedirectPath(session.user));
    } catch (err) {
      setError(
        err instanceof ApiRequestError || err instanceof Error
          ? err.message
          : "Registration failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
      <div className="grid grid-cols-2 gap-[14px] max-sm:grid-cols-1">
        <div>
          <label className={labelClass}>First name</label>
          <input name="firstname" type="text" required placeholder="Jordan" className={inputClass} value={values.firstname} onChange={handleChange} />
        </div>
        <div>
          <label className={labelClass}>Last name</label>
          <input name="lastname" type="text" required placeholder="Lee" className={inputClass} value={values.lastname} onChange={handleChange} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Email</label>
        <input name="email" type="email" required placeholder="you@example.com" className={inputClass} value={values.email} onChange={handleChange} />
      </div>

      <div>
        <label className={labelClass}>Password</label>
        <PasswordField
          value={values.password}
          onChange={handleChange}
          placeholder="Min. 8 characters"
          inputClass={inputClass}
        />
      </div>

      <AuthErrorDialog message={error} onClose={() => setError("")} />

      <button
        type="submit"
        className="btn-cta w-full justify-center p-[14px] text-[15px] disabled:opacity-80"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
