"use client";

import { ChangeEvent, useState } from "react";

interface PasswordFieldProps {
  name?: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  inputClass: string;
  inputStyle: React.CSSProperties;
}

export default function PasswordField({
  name = "password",
  value,
  onChange,
  placeholder = "Password",
  inputClass,
  inputStyle,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <input
        name={name}
        type={isVisible ? "text" : "password"}
        required
        placeholder={placeholder}
        className={`${inputClass} pr-20`}
        value={value}
        onChange={onChange}
        style={inputStyle}
      />
      <button
        type="button"
        aria-label={isVisible ? "Hide password" : "Show password"}
        aria-pressed={isVisible}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-semibold"
        style={{ color: "var(--teal)" }}
        onClick={() => setIsVisible((current) => !current)}
      >
        {isVisible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
