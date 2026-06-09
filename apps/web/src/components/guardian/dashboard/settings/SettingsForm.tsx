"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowDownToLine, Lock } from "lucide-react";
import type { ParentSettings, UpdateParentSettingsPayload } from "@/src/types/api/api";
import { parentSettingsQueryKey, updateParentSettings } from "@/src/utils/api/parent";
import { changePassword, deactivateAccount } from "@/src/utils/api/auth";
import { clearAuthSession } from "@/src/utils/api/session";
import { cn } from "@/lib/utils";
import { inputCls, labelCls, SectionCard, selectArrowStyle, selectCls, ToggleRow } from "./SettingsControls";

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
          <label className={labelCls}>Language</label>
          <select value={draft.language} onChange={(event) => setDraftValue("language", event.target.value)} className={cn(selectCls, "mb-4")} style={selectArrowStyle}>
            <option>English (Canada)</option>
            <option>French (Canada)</option>
            <option>Spanish</option>
            <option>Mandarin</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Currency</label>
          <select value={draft.currency} onChange={(event) => setDraftValue("currency", event.target.value)} className={cn(selectCls, "mb-4")} style={selectArrowStyle}>
            <option value="CAD">CAD</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Timezone</label>
          <select value={draft.timezone} onChange={(event) => setDraftValue("timezone", event.target.value)} className={cn(selectCls, "mb-1")} style={selectArrowStyle}>
            <option>Eastern Time (ET)</option>
            <option>Pacific Time (PT)</option>
            <option>Mountain Time (MT)</option>
          </select>
        </div>
        <button className="btn-cta mt-4 text-[14px] px-5 py-[10px]" disabled={settingsMutation.isPending} onClick={() => settingsMutation.mutate(draft)}>
          {settingsMutation.isPending ? "Saving..." : "Save settings"}
        </button>
        {(statusMessage || settingsMutation.error) && (
          <div className={cn("mt-[10px] text-[13px] font-semibold", settingsMutation.error ? "text-[#c0392b]" : "text-teal")}>
            {settingsMutation.error instanceof Error ? settingsMutation.error.message : statusMessage}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Security">
        <div className="flex flex-col gap-[10px]">
          <button className="btn-outline justify-start gap-[10px] text-[14px]" onClick={() => setPasswordFormOpen((open) => !open)}>
            <Lock className="text-gray-300" size={16} />
            Change password
          </button>
          {passwordFormOpen && (
            <div className="p-[14px] border border-brand-border rounded-xl">
              <label className={labelCls}>Current password</label>
              <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className={inputCls} />
              <label className={labelCls}>New password</label>
              <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className={inputCls} />
              <button className="btn-cta text-[14px] px-[18px] py-[9px]" disabled={passwordMutation.isPending} onClick={() => passwordMutation.mutate({ current_password: currentPassword, new_password: newPassword })}>
                {passwordMutation.isPending ? "Updating..." : "Update password"}
              </button>
              {passwordMutation.error instanceof Error && <div className="text-[#c0392b] text-[13px] mt-2">{passwordMutation.error.message}</div>}
            </div>
          )}
          <button className="btn-outline justify-start gap-[10px] text-[14px] opacity-55 cursor-not-allowed" disabled title="Data export API is not implemented yet.">
            <ArrowDownToLine className="text-gray-300" size={16} />
            Download my data
          </button>
          <button
            className="flex items-center justify-start gap-[10px] px-5 py-[10px] text-[14px] rounded-xl bg-white text-[#c0392b] border-[1.5px] border-[#f0d0d0] cursor-pointer [font-family:inherit]"
            onClick={() => setDeleteFormOpen((open) => !open)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-9" stroke="#c0392b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Delete account
          </button>
          {deleteFormOpen && (
            <div className="p-[14px] border border-[#f0d0d0] rounded-xl">
              <p className="text-[#c0392b] text-[13px] mb-3">This will deactivate your account and sign you out.</p>
              <label className={labelCls}>Confirm password</label>
              <input type="password" value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} className={inputCls} />
              <button className="px-[18px] py-[9px] text-[14px] rounded-xl border-[1.5px] border-[#c0392b] bg-[#c0392b] text-white [font-family:inherit] cursor-pointer" disabled={deactivateMutation.isPending} onClick={() => deactivateMutation.mutate({ password: deletePassword })}>
                {deactivateMutation.isPending ? "Deactivating..." : "Deactivate account"}
              </button>
              {deactivateMutation.error instanceof Error && <div className="text-[#c0392b] text-[13px] mt-2">{deactivateMutation.error.message}</div>}
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
