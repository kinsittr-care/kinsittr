import { N } from "../tokens";
import type { NannyProfile } from "@/src/types/api/api";

const sectionTitle = {
  fontFamily: "DM Serif Display, var(--font-dm-serif), serif",
  fontSize: 22,
  fontWeight: 400,
  color: "var(--nanny-green-dk)",
  letterSpacing: "-.005em",
  marginBottom: 16,
};

function CheckIcon({ done }: { done: boolean }) {
  return done ? (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <circle cx="9" cy="9" r="8.5" fill={N.green} />
      <path d="M5 9l2.8 2.8L13 6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <circle cx="9" cy="9" r="8" fill="none" stroke={N.border} strokeWidth="1.5" />
    </svg>
  );
}

export default function DashboardChecklist({
  profile,
  fallbackPhone,
  isLoading,
}: {
  profile: NannyProfile | undefined;
  fallbackPhone: string | undefined;
  isLoading: boolean;
}) {
  const steps = getProfileStrengthSteps(profile, fallbackPhone);
  const doneCount = steps.filter((s) => s.done).length;
  const pct = Math.round((doneCount / steps.length) * 100);

  return (
    <div
      style={{
        background: N.card,
        border: `1px solid ${N.border}`,
        borderRadius: 18,
        padding: "24px 26px",
        boxShadow: N.shadow,
      }}
    >
      <h2 style={sectionTitle}>Profile strength</h2>

      {/* Progress bar */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
            fontSize: 13,
            color: N.inkMute,
          }}
        >
          <span>{doneCount} of {steps.length} complete</span>
          <span style={{ fontWeight: 600, color: N.green }}>{pct}%</span>
        </div>
        <div style={{ height: 6, background: N.borderSoft, borderRadius: 3, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: N.green,
              borderRadius: 3,
              transition: "width .4s",
            }}
          />
        </div>
      </div>

      {isLoading && <p style={{ margin: "0 0 14px", fontSize: 13.5, color: N.inkFaint }}>Checking your profile...</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {steps.map((s) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <CheckIcon done={s.done} />
            <span
              style={{
                fontSize: 14,
                color: s.done ? N.greenDk : N.inkMute,
                fontWeight: s.done ? 500 : 400,
                textDecoration: s.done ? "none" : "none",
              }}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getProfileStrengthSteps(profile: NannyProfile | undefined, fallbackPhone: string | undefined) {
  return [
    { label: "Profile photo uploaded", done: text(profile?.avatar_url) },
    { label: "Phone number added", done: text(profile?.phone || fallbackPhone) },
    { label: "Location selected", done: text(profile?.city) && text(profile?.province) },
    { label: "Bio written", done: text(profile?.bio) },
    { label: "Specialties selected", done: Boolean(profile?.specialties.length) },
    { label: "Hourly rate set", done: Boolean(profile && profile.rate_per_hour > 0) },
    { label: "Stripe payouts connected", done: Boolean(profile?.stripe_onboarded) },
    { label: "Verification approved", done: profile?.verification_status === "verified" },
  ];
}

function text(value: string | undefined | null) {
  return Boolean(value?.trim());
}
