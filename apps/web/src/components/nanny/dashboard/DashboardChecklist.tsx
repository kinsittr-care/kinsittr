import { cn } from "@/lib/utils";
import type { NannyProfile } from "@/src/types/api/api";

function CheckIcon({ done }: { done: boolean }) {
  return done ? (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <circle cx="9" cy="9" r="8.5" fill="var(--nanny-green)" />
      <path d="M5 9l2.8 2.8L13 6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <circle cx="9" cy="9" r="8" fill="none" stroke="var(--nanny-border)" strokeWidth="1.5" />
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
    <div className="bg-nanny-card border border-nanny-border rounded-[18px] px-[26px] py-6 shadow-[var(--nanny-shadow)]">
      <h2 className="font-display text-[22px] font-normal text-nanny-green-dk tracking-[-0.005em] mb-4">
        Profile strength
      </h2>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex justify-between mb-2 text-[13px] text-nanny-ink-faint">
          <span>{doneCount} of {steps.length} complete</span>
          <span className="font-semibold text-nanny-green">{pct}%</span>
        </div>
        <div className="h-[6px] bg-nanny-border-soft rounded-[3px] overflow-hidden">
          <div
            className="h-full bg-nanny-green rounded-[3px]"
            style={{ width: `${pct}%`, transition: "width .4s" }}
          />
        </div>
      </div>

      {isLoading && <p className="m-0 mb-[14px] text-[13.5px] text-nanny-ink-faint">Checking your profile...</p>}

      <div className="flex flex-col gap-3">
        {steps.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <CheckIcon done={s.done} />
            <span className={cn("text-[14px]", s.done ? "text-nanny-green-dk font-medium" : "text-nanny-ink-faint font-normal")}>
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
