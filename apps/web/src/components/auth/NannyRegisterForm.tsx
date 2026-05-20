"use client";

import { ChangeEvent, SyntheticEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiRequestError } from "@/src/utils/api/api";
import { establishAuthSession, registerNanny } from "@/src/utils/api/auth";
import { getPostAuthRedirectPath } from "@/src/utils/api/auth-routing";
import { RegisterNannyPayload } from "@/src/types/api/api";

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

interface NannyRegisterFormProps {
  onSuccess?: () => void;
}

const initialValues: RegisterNannyPayload = {
  firstname: "",
  lastname: "",
  email: "",
  password: "",
  phone: "",
  display_name: "",
  service_type: "nanny",
  bio: "",
  rate_per_hour: 20,
  city: "",
  province: "",
};

export default function NannyRegisterForm({ onSuccess }: NannyRegisterFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<RegisterNannyPayload>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues((v) => ({
      ...v,
      [name]: name === "rate_per_hour" ? Number(value) : value,
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
          <label className={labelClass} style={{ color: "var(--muted)" }}>First name</label>
          <input name="firstname" type="text" required placeholder="Jordan" className={inputClass} value={values.firstname} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label className={labelClass} style={{ color: "var(--muted)" }}>Last name</label>
          <input name="lastname" type="text" required placeholder="Lee" className={inputClass} value={values.lastname} onChange={handleChange} style={inputStyle} />
        </div>
      </div>

      <div>
        <label className={labelClass} style={{ color: "var(--muted)" }}>Email</label>
        <input name="email" type="email" required placeholder="you@example.com" className={inputClass} value={values.email} onChange={handleChange} style={inputStyle} />
      </div>

      <div>
        <label className={labelClass} style={{ color: "var(--muted)" }}>Password</label>
        <input name="password" type="password" required placeholder="Min. 8 characters" className={inputClass} value={values.password} onChange={handleChange} style={inputStyle} />
      </div>

      <div>
        <label className={labelClass} style={{ color: "var(--muted)" }}>Display name</label>
        <input name="display_name" type="text" required placeholder="Jordan Lee" className={inputClass} value={values.display_name} onChange={handleChange} style={inputStyle} />
      </div>

      <div>
        <label className={labelClass} style={{ color: "var(--muted)" }}>Service type</label>
        <input
          type="text"
          value="Nanny / Caregiver"
          className={inputClass}
          style={inputStyle}
          disabled
          readOnly
        />
      </div>

      <div>
        <label className={labelClass} style={{ color: "var(--muted)" }}>Bio</label>
        <textarea
          name="bio"
          required
          placeholder="Tell families a bit about yourself and your experience…"
          rows={4}
          className={inputClass}
          value={values.bio}
          onChange={handleChange}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      <div>
        <label className={labelClass} style={{ color: "var(--muted)" }}>Rate per hour (CAD)</label>
        <input name="rate_per_hour" type="number" required min={10} step={0.5} className={inputClass} value={values.rate_per_hour} onChange={handleChange} style={inputStyle} />
      </div>

      <div className="grid grid-cols-2 gap-[14px] max-sm:grid-cols-1">
        <div>
          <label className={labelClass} style={{ color: "var(--muted)" }}>City</label>
          <input name="city" type="text" required placeholder="Toronto" className={inputClass} value={values.city} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label className={labelClass} style={{ color: "var(--muted)" }}>Province</label>
          <input name="province" type="text" required placeholder="ON" className={inputClass} value={values.province} onChange={handleChange} style={inputStyle} />
        </div>
      </div>

      <div>
        <label className={labelClass} style={{ color: "var(--muted)" }}>Phone <span style={{ color: "var(--faint)", fontWeight: 400 }}>(optional)</span></label>
        <input name="phone" type="tel" placeholder="+1 416 000 0000" className={inputClass} value={values.phone} onChange={handleChange} style={inputStyle} />
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
        {isSubmitting ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
