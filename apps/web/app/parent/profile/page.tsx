import ProfileView from "@/src/components/guardian/dashboard/ProfileView";

export const metadata = { title: "My profile — KinSittr" };

export default function ParentProfilePage() {
  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <ProfileView />
    </div>
  );
}
