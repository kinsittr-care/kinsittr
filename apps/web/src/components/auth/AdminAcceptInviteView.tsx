"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { acceptAdminInvite } from "@/src/utils/api/admin/management";

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1.5px solid #e7ddd2",
  borderRadius: 9,
  padding: "11px 14px",
  fontSize: 14,
  outline: "none",
  background: "#fffdf8",
  color: "#33271f",
  fontFamily: "inherit",
};

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
    <form onSubmit={submitInvite} style={{ display: "grid", gap: 16 }}>
      <p style={{ margin: 0, color: "#7b7168", fontSize: 13, lineHeight: 1.6 }}>
        Accepting an invite creates your admin account. You will be redirected to admin sign in afterwards
      </p>

      <label style={{ display: "grid", gap: 6, color: "#7b7168", fontSize: 13 }}>
        Invite token
        <textarea
          value={token}
          onChange={(event) => setToken(event.target.value)}
          style={{ ...inputStyle, minHeight: 88, resize: "vertical" }}
          required
        />
      </label>

      <label style={{ display: "grid", gap: 6, color: "#7b7168", fontSize: 13 }}>
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          style={inputStyle}
          required
          minLength={8}
        />
      </label>

      {error && <p style={{ margin: 0, color: "#b24a3f", fontSize: 13 }}>{error}</p>}
      {success && (
        <p style={{ margin: 0, color: "#3f6b4d", fontSize: 13 }}>
          Invite accepted. Redirecting to admin sign in...
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          border: "none",
          borderRadius: 10,
          background: "#8b5e3c",
          color: "#fff",
          padding: "12px 18px",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        {isSubmitting ? "Accepting invite..." : "Accept invite"}
      </button>
    </form>
  );
}
