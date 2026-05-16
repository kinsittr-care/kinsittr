"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowDownToLine, Lock } from "lucide-react";
import { useIsMobile } from "./useIsMobile";
import type { ParentSettings, UpdateParentSettingsPayload } from "@/src/types/api/api";
import {
  getParentSettings,
  parentSettingsQueryKey,
  updateParentSettings,
} from "@/src/utils/api/parent";
import { changePassword, deactivateAccount } from "@/src/utils/api/auth";
import { clearAuthSession } from "@/src/utils/api/session";

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#fdfaf5",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
        boxShadow: "0 2px 12px rgba(40,30,20,.07)",
      }}
    >
      <h3
        style={{
          fontSize: 11.5,
          fontWeight: 600,
          color: "var(--faint)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 18,
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  sub,
  on,
  onToggle,
  last = false,
}: {
  label: string;
  sub: string;
  on: boolean;
  onToggle: () => void;
  last?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between gap-1"
      style={{
        padding: "13px 0",
        borderBottom: last ? "none" : "1px solid var(--border)",
      }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 12.5, color: "var(--faint)" }}>{sub}</div>
      </div>
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: 46,
          height: 26,
          borderRadius: 13,
          background: on ? "var(--teal)" : "#ddd8d0",
          cursor: "pointer",
          position: "relative",
          transition: "background .2s",
          flexShrink: 0,
          boxShadow: on ? "0 2px 8px rgba(58,90,90,.28)" : "none",
          border: "none",
        }}
        role="switch"
        aria-checked={on}
      >
        <span
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#fff",
            position: "absolute",
            top: 3,
            left: on ? 23 : 3,
            transition: "left .2s",
            boxShadow: "0 1px 4px rgba(0,0,0,.2)",
          }}
        />
      </button>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  width: "100%",
  border: "1.5px solid var(--border)",
  borderRadius: 9,
  padding: "11px 14px",
  fontSize: 14,
  background: "var(--bg-warm)",
  color: "var(--brand-text)",
  cursor: "pointer",
  outline: "none",
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  paddingRight: 32,
  marginBottom: 16,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1.5px solid var(--border)",
  borderRadius: 9,
  padding: "11px 14px",
  fontSize: 14,
  background: "var(--bg-warm)",
  color: "var(--brand-text)",
  outline: "none",
  marginBottom: 12,
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: "var(--muted)",
  display: "block",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

export default function SettingsView() {
  const isMobile = useIsMobile();
  const settingsQuery = useQuery({
    queryKey: parentSettingsQueryKey(),
    queryFn: getParentSettings,
  });
  const settings = settingsQuery.data?.data;

  return (
    <div
      style={{
        maxWidth: 620,
        margin: "0 auto",
        padding: isMobile ? "20px 16px 40px" : "40px 36px 60px",
        overflowY: "auto",
        height: "100%",
      }}
    >
      <div style={{ marginBottom: 36 }}>
        <h1 className="font-display" style={{ fontWeight: 400, fontSize: 30, marginBottom: 4 }}>
          Settings
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>
          Manage your preferences and account settings
        </p>
      </div>

      {settingsQuery.isLoading && (
        <div style={{ color: "var(--faint)", fontSize: 14 }}>Loading settings...</div>
      )}

      {settingsQuery.isError && (
        <div style={{ color: "#c0392b", fontSize: 14 }}>
          {settingsQuery.error instanceof Error ? settingsQuery.error.message : "Unable to load settings."}
        </div>
      )}

      {settings && <SettingsForm key={settings.updated_at} settings={settings} />}
    </div>
  );
}

function SettingsForm({ settings }: { settings: ParentSettings }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<UpdateParentSettingsPayload>(() => settingsToPayload(settings));
  const [passwordFormOpen, setPasswordFormOpen] = useState(false);
  const [deleteFormOpen, setDeleteFormOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const settingsMutation = useMutation({
    mutationFn: updateParentSettings,
    onSuccess: async () => {
      setStatusMessage("Settings saved.");
      await queryClient.invalidateQueries({ queryKey: parentSettingsQueryKey() });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      clearAuthSession();
      queryClient.clear();
      router.push("/auth/parent");
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateAccount,
    onSuccess: () => {
      clearAuthSession();
      queryClient.clear();
      router.push("/");
    },
  });

  const setDraftValue = <K extends keyof UpdateParentSettingsPayload>(
    key: K,
    value: UpdateParentSettingsPayload[K],
  ) => {
    setStatusMessage(null);
    setDraft((current) => ({ ...current, [key]: value }));
  };

  return (
    <>
      <SectionCard title="Notifications">
        <ToggleRow
          label="New messages"
          sub="Get notified when a nanny replies"
          on={draft.notify_messages}
          onToggle={() => setDraftValue("notify_messages", !draft.notify_messages)}
        />
        <ToggleRow
          label="Booking updates"
          sub="Confirmations, reminders, and changes"
          on={draft.notify_bookings}
          onToggle={() => setDraftValue("notify_bookings", !draft.notify_bookings)}
        />
        <ToggleRow
          label="24h reminders"
          sub="Alert before each booking starts"
          on={draft.notify_reminders}
          onToggle={() => setDraftValue("notify_reminders", !draft.notify_reminders)}
        />
        <ToggleRow
          label="Weekly digest"
          sub="Summary of bookings and activity"
          on={draft.notify_weekly_digest}
          onToggle={() => setDraftValue("notify_weekly_digest", !draft.notify_weekly_digest)}
          last
        />
      </SectionCard>

      <SectionCard title="Privacy">
        <ToggleRow
          label="Show profile to nannies"
          sub="Nannies can view your family profile before accepting"
          on={draft.show_profile}
          onToggle={() => setDraftValue("show_profile", !draft.show_profile)}
        />
        <ToggleRow
          label="Share reviews publicly"
          sub="Your reviews appear on nanny profiles"
          on={draft.share_reviews}
          onToggle={() => setDraftValue("share_reviews", !draft.share_reviews)}
        />
        <ToggleRow
          label="Analytics & improvements"
          sub="Help us improve with anonymous usage data"
          on={draft.analytics}
          onToggle={() => setDraftValue("analytics", !draft.analytics)}
          last
        />
      </SectionCard>

      <SectionCard title="App Preferences">
        <div>
          <label style={labelStyle}>Language</label>
          <select
            value={draft.language}
            onChange={(event) => setDraftValue("language", event.target.value)}
            style={selectStyle}
          >
            <option>English (Canada)</option>
            <option>French (Canada)</option>
            <option>Spanish</option>
            <option>Mandarin</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Currency</label>
          <select
            value={draft.currency}
            onChange={(event) => setDraftValue("currency", event.target.value)}
            style={selectStyle}
          >
            <option value="CAD">CAD</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Timezone</label>
          <select
            value={draft.timezone}
            onChange={(event) => setDraftValue("timezone", event.target.value)}
            style={{ ...selectStyle, marginBottom: 4 }}
          >
            <option>Eastern Time (ET)</option>
            <option>Pacific Time (PT)</option>
            <option>Mountain Time (MT)</option>
          </select>
        </div>
        <button
          className="btn-cta"
          style={{ marginTop: 16, fontSize: 14, padding: "10px 20px" }}
          disabled={settingsMutation.isPending}
          onClick={() => settingsMutation.mutate(draft)}
        >
          {settingsMutation.isPending ? "Saving..." : "Save settings"}
        </button>
        {(statusMessage || settingsMutation.error) && (
          <div
            style={{
              marginTop: 10,
              fontSize: 13,
              color: settingsMutation.error ? "#c0392b" : "var(--teal)",
              fontWeight: 600,
            }}
          >
            {settingsMutation.error instanceof Error ? settingsMutation.error.message : statusMessage}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Security">
        <div className="flex flex-col gap-[10px]">
          <button
            className="btn-outline"
            style={{ justifyContent: "flex-start", gap: 10, fontSize: 14 }}
            onClick={() => setPasswordFormOpen((open) => !open)}
          >
            <Lock className="text-gray-300" size={16} />
            Change password
          </button>
          {passwordFormOpen && (
            <div style={{ padding: 14, border: "1px solid var(--border)", borderRadius: 12 }}>
              <label style={labelStyle}>Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                style={inputStyle}
              />
              <label style={labelStyle}>New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                style={inputStyle}
              />
              <button
                className="btn-cta"
                style={{ fontSize: 14, padding: "9px 18px" }}
                disabled={passwordMutation.isPending}
                onClick={() =>
                  passwordMutation.mutate({
                    current_password: currentPassword,
                    new_password: newPassword,
                  })
                }
              >
                {passwordMutation.isPending ? "Updating..." : "Update password"}
              </button>
              {passwordMutation.error instanceof Error && (
                <div style={{ color: "#c0392b", fontSize: 13, marginTop: 8 }}>
                  {passwordMutation.error.message}
                </div>
              )}
            </div>
          )}
          <button
            className="btn-outline"
            style={{ justifyContent: "flex-start", gap: 10, fontSize: 14, opacity: 0.55, cursor: "not-allowed" }}
            disabled
            title="Data export API is not implemented yet."
          >
            <ArrowDownToLine className="text-gray-300" size={16} />
            Download my data
          </button>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 10,
              padding: "10px 20px",
              fontSize: 14,
              borderRadius: 12,
              background: "#fff",
              color: "#c0392b",
              border: "1.5px solid #f0d0d0",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
            onClick={() => setDeleteFormOpen((open) => !open)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-9" stroke="#c0392b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Delete account
          </button>
          {deleteFormOpen && (
            <div style={{ padding: 14, border: "1px solid #f0d0d0", borderRadius: 12 }}>
              <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 12 }}>
                This will deactivate your account and sign you out.
              </p>
              <label style={labelStyle}>Confirm password</label>
              <input
                type="password"
                value={deletePassword}
                onChange={(event) => setDeletePassword(event.target.value)}
                style={inputStyle}
              />
              <button
                style={{
                  padding: "9px 18px",
                  fontSize: 14,
                  borderRadius: 12,
                  border: "1.5px solid #c0392b",
                  background: "#c0392b",
                  color: "#fff",
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
                disabled={deactivateMutation.isPending}
                onClick={() => deactivateMutation.mutate({ password: deletePassword })}
              >
                {deactivateMutation.isPending ? "Deactivating..." : "Deactivate account"}
              </button>
              {deactivateMutation.error instanceof Error && (
                <div style={{ color: "#c0392b", fontSize: 13, marginTop: 8 }}>
                  {deactivateMutation.error.message}
                </div>
              )}
            </div>
          )}
        </div>
      </SectionCard>
    </>
  );
}

function settingsToPayload(settings: ParentSettings): UpdateParentSettingsPayload {
  return {
    notify_messages: settings.notify_messages,
    notify_bookings: settings.notify_bookings,
    notify_reminders: settings.notify_reminders,
    notify_weekly_digest: settings.notify_weekly_digest,
    show_profile: settings.show_profile,
    share_reviews: settings.share_reviews,
    analytics: settings.analytics,
    language: settings.language,
    currency: settings.currency,
    timezone: settings.timezone,
  };
}
