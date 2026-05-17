"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowDownToLine, Lock } from "lucide-react";
import type { ParentSettings, UpdateParentSettingsPayload } from "@/src/types/api/api";
import { parentSettingsQueryKey, updateParentSettings } from "@/src/utils/api/parent";
import { changePassword, deactivateAccount } from "@/src/utils/api/auth";
import { clearAuthSession } from "@/src/utils/api/session";
import { inputStyle, labelStyle, SectionCard, selectStyle, ToggleRow } from "./SettingsControls";

export default function SettingsForm({ settings }: { settings: ParentSettings }) {
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
        <ToggleRow label="New messages" sub="Get notified when a nanny replies" on={draft.notify_messages} onToggle={() => setDraftValue("notify_messages", !draft.notify_messages)} />
        <ToggleRow label="Booking updates" sub="Confirmations, reminders, and changes" on={draft.notify_bookings} onToggle={() => setDraftValue("notify_bookings", !draft.notify_bookings)} />
        <ToggleRow label="24h reminders" sub="Alert before each booking starts" on={draft.notify_reminders} onToggle={() => setDraftValue("notify_reminders", !draft.notify_reminders)} />
        <ToggleRow label="Weekly digest" sub="Summary of bookings and activity" on={draft.notify_weekly_digest} onToggle={() => setDraftValue("notify_weekly_digest", !draft.notify_weekly_digest)} last />
      </SectionCard>

      <SectionCard title="Privacy">
        <ToggleRow label="Show profile to nannies" sub="Nannies can view your family profile before accepting" on={draft.show_profile} onToggle={() => setDraftValue("show_profile", !draft.show_profile)} />
        <ToggleRow label="Share reviews publicly" sub="Your reviews appear on nanny profiles" on={draft.share_reviews} onToggle={() => setDraftValue("share_reviews", !draft.share_reviews)} />
        <ToggleRow label="Analytics & improvements" sub="Help us improve with anonymous usage data" on={draft.analytics} onToggle={() => setDraftValue("analytics", !draft.analytics)} last />
      </SectionCard>

      <SectionCard title="App Preferences">
        <div>
          <label style={labelStyle}>Language</label>
          <select value={draft.language} onChange={(event) => setDraftValue("language", event.target.value)} style={selectStyle}>
            <option>English (Canada)</option>
            <option>French (Canada)</option>
            <option>Spanish</option>
            <option>Mandarin</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Currency</label>
          <select value={draft.currency} onChange={(event) => setDraftValue("currency", event.target.value)} style={selectStyle}>
            <option value="CAD">CAD</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Timezone</label>
          <select value={draft.timezone} onChange={(event) => setDraftValue("timezone", event.target.value)} style={{ ...selectStyle, marginBottom: 4 }}>
            <option>Eastern Time (ET)</option>
            <option>Pacific Time (PT)</option>
            <option>Mountain Time (MT)</option>
          </select>
        </div>
        <button className="btn-cta" style={{ marginTop: 16, fontSize: 14, padding: "10px 20px" }} disabled={settingsMutation.isPending} onClick={() => settingsMutation.mutate(draft)}>
          {settingsMutation.isPending ? "Saving..." : "Save settings"}
        </button>
        {(statusMessage || settingsMutation.error) && (
          <div style={{ marginTop: 10, fontSize: 13, color: settingsMutation.error ? "#c0392b" : "var(--teal)", fontWeight: 600 }}>
            {settingsMutation.error instanceof Error ? settingsMutation.error.message : statusMessage}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Security">
        <div className="flex flex-col gap-[10px]">
          <button className="btn-outline" style={{ justifyContent: "flex-start", gap: 10, fontSize: 14 }} onClick={() => setPasswordFormOpen((open) => !open)}>
            <Lock className="text-gray-300" size={16} />
            Change password
          </button>
          {passwordFormOpen && (
            <div style={{ padding: 14, border: "1px solid var(--border)", borderRadius: 12 }}>
              <label style={labelStyle}>Current password</label>
              <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} style={inputStyle} />
              <label style={labelStyle}>New password</label>
              <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} style={inputStyle} />
              <button className="btn-cta" style={{ fontSize: 14, padding: "9px 18px" }} disabled={passwordMutation.isPending} onClick={() => passwordMutation.mutate({ current_password: currentPassword, new_password: newPassword })}>
                {passwordMutation.isPending ? "Updating..." : "Update password"}
              </button>
              {passwordMutation.error instanceof Error && <div style={{ color: "#c0392b", fontSize: 13, marginTop: 8 }}>{passwordMutation.error.message}</div>}
            </div>
          )}
          <button className="btn-outline" style={{ justifyContent: "flex-start", gap: 10, fontSize: 14, opacity: 0.55, cursor: "not-allowed" }} disabled title="Data export API is not implemented yet.">
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
              <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 12 }}>This will deactivate your account and sign you out.</p>
              <label style={labelStyle}>Confirm password</label>
              <input type="password" value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} style={inputStyle} />
              <button style={{ padding: "9px 18px", fontSize: 14, borderRadius: 12, border: "1.5px solid #c0392b", background: "#c0392b", color: "#fff", fontFamily: "inherit", cursor: "pointer" }} disabled={deactivateMutation.isPending} onClick={() => deactivateMutation.mutate({ password: deletePassword })}>
                {deactivateMutation.isPending ? "Deactivating..." : "Deactivate account"}
              </button>
              {deactivateMutation.error instanceof Error && <div style={{ color: "#c0392b", fontSize: 13, marginTop: 8 }}>{deactivateMutation.error.message}</div>}
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
