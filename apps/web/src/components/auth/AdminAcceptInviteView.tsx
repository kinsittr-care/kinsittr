"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { acceptAdminInvite } from "@/src/utils/api/admin/management";

const inputClass = "w-full rounded-[9px] border-[1.5px] border-[#e7ddd2] bg-[#fffdf8] px-[14px] py-[11px] text-[14px] text-[#33271f] outline-none";
const labelClass = "grid gap-1.5 text-[13px] text-[#7b7168]";

export default function AdminAcceptInviteView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") ?? "");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submitInvite = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      await acceptAdminInvite({ token: token.trim(), password });
      setSuccess(true);
      setTimeout(() => router.replace("/auth/admin"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to accept this invite.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submitInvite} className="grid gap-4">
      <p className="m-0 text-[13px] leading-[1.6] text-[#7b7168]">
        Accepting an invite creates your admin account. You will be redirected to admin sign in afterwards
      </p>

      <label className={labelClass}>
        Invite token
        <textarea
          value={token}
          onChange={(event) => setToken(event.target.value)}
          className={`${inputClass} min-h-[88px] resize-y`}
          required
        />
      </label>

      <label className={labelClass}>
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={inputClass}
          required
          minLength={8}
        />
      </label>

      {error && <p className="m-0 text-[13px] text-[#b24a3f]">{error}</p>}
      {success && (
        <p className="m-0 text-[13px] text-[#3f6b4d]">
          Invite accepted. Redirecting to admin sign in...
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="cursor-pointer rounded-[10px] border-0 bg-[#8b5e3c] px-[18px] py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-80"
      >
        {isSubmitting ? "Accepting invite..." : "Accept invite"}
      </button>
    </form>
  );
}
