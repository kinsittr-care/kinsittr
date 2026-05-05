import SettingsView from "@/src/components/guardian/dashboard/SettingsView";

export const metadata = { title: "Settings — KinSittr" };

export default function ParentSettingsPage() {
  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <SettingsView />
    </div>
  );
}
