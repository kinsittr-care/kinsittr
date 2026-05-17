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
