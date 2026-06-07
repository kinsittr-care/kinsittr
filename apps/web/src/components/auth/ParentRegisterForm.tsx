"use client";

import { ChangeEvent, SyntheticEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiRequestError } from "@/src/utils/api/api";
import { establishAuthSession, registerParent } from "@/src/utils/api/auth";
import { getPostAuthRedirectPath } from "@/src/utils/api/auth-routing";
import { RegisterParentPayload } from "@/src/types/api/api";
import PasswordField from "./PasswordField";
import AuthErrorDialog from "./AuthErrorDialog";

const inputClass = `
  w-full border-[1.5px] rounded-[10px] px-[14px] py-3 text-[14px] outline-none transition-all
  focus:bg-white focus:shadow-[0_0_0_3px_rgba(58,90,90,.1)]
`.trim();

const inputStyle = {
  borderColor: "var(--border)",
  background: "var(--bg-warm)",
  color: "var(--brand-text)",
};

const labelClass = "block text-[12px] font-semibold uppercase tracking-[0.07em] mb-[7px]";

interface ParentRegisterFormProps {
  onSuccess?: () => void;
}

const initialValues: RegisterParentPayload = {
  firstname: "",
  lastname: "",
  email: "",
  password: "",
};

export default function ParentRegisterForm({ onSuccess }: ParentRegisterFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<RegisterParentPayload>(initialValues);
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
      const response = await registerParent(values);
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
          <label className={labelClass} style={{ color: "var(--faint)" }}>First name</label>
          <input name="firstname" type="text" required placeholder="Jordan" className={inputClass} value={values.firstname} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label className={labelClass} style={{ color: "var(--faint)" }}>Last name</label>
          <input name="lastname" type="text" required placeholder="Lee" className={inputClass} value={values.lastname} onChange={handleChange} style={inputStyle} />
        </div>
      </div>

      <div>
        <label className={labelClass} style={{ color: "var(--faint)" }}>Email</label>
        <input name="email" type="email" required placeholder="you@example.com" className={inputClass} value={values.email} onChange={handleChange} style={inputStyle} />
      </div>

      <div>
        <label className={labelClass} style={{ color: "var(--faint)" }}>Password</label>
        <PasswordField
          value={values.password}
          onChange={handleChange}
          placeholder="Min. 8 characters"
          inputClass={inputClass}
          inputStyle={inputStyle}
        />
      </div>

      <AuthErrorDialog message={error} onClose={() => setError("")} />

      <button
        type="submit"
        className="btn-cta justify-center"
        style={{ width: "100%", fontSize: 15, padding: "14px", opacity: isSubmitting ? 0.8 : 1 }}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
