"use client";

import { ChangeEvent, SyntheticEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiRequestError } from "@/src/utils/api/api";
import { establishAuthSession, registerParent } from "@/src/utils/api/auth";
import { getPostAuthRedirectPath } from "@/src/utils/api/auth-routing";
import { RegisterParentPayload } from "@/src/types/api/api";

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
  phone: "",
  display_name: "",
  num_children: 1,
  children_ages: [],
  city: "",
  province: "",
};

export default function ParentRegisterForm({ onSuccess }: ParentRegisterFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<RegisterParentPayload>(initialValues);
  const [childrenAgesInput, setChildrenAgesInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues((v) => ({
      ...v,
      [name]: name === "num_children" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const ages = childrenAgesInput
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    setIsSubmitting(true);
    try {
      const response = await registerParent({ ...values, children_ages: ages });
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
        <input name="display_name" type="text" required placeholder="The Lee family" className={inputClass} value={values.display_name} onChange={handleChange} style={inputStyle} />
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

      <div className="grid grid-cols-2 gap-[14px] max-sm:grid-cols-1">
        <div>
          <label className={labelClass} style={{ color: "var(--muted)" }}>No. of children</label>
          <input name="num_children" type="number" required min={1} max={10} className={inputClass} value={values.num_children} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label className={labelClass} style={{ color: "var(--muted)" }}>Ages (comma-separated)</label>
          <input
            type="text"
            placeholder="3, 6, 9"
            className={inputClass}
            value={childrenAgesInput}
            onChange={(e) => setChildrenAgesInput(e.target.value)}
            style={inputStyle}
          />
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
