"use client";

import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "./useIsMobile";
import { getParentSettings, parentSettingsQueryKey } from "@/src/utils/api/parent";
import SettingsForm from "./settings/SettingsForm";

export default function SettingsView() {
  const isMobile = useIsMobile();
  const settingsQuery = useQuery({
    queryKey: parentSettingsQueryKey(),
    queryFn: getParentSettings,
  });
  const settings = settingsQuery.data?.data;

  return (
    <div
      className="max-w-[620px] mx-auto overflow-y-auto h-full"
      style={{ padding: isMobile ? "20px 16px 40px" : "40px 36px 60px" }}
    >
      <div className="mb-9">
        <h1 className="font-display font-normal text-[30px] mb-1">
          Settings
        </h1>
        <p className="text-[var(--faint)] text-[14px]">
          Manage your preferences and account settings
        </p>
      </div>

      {settingsQuery.isLoading && (
        <div className="text-brand-faint text-[14px]">Loading settings...</div>
      )}

      {settingsQuery.isError && (
        <div className="text-[#c0392b] text-[14px]">
          {settingsQuery.error instanceof Error ? settingsQuery.error.message : "Unable to load settings."}
        </div>
      )}

      {settings && <SettingsForm key={settings.updated_at} settings={settings} />}
    </div>
  );
}
