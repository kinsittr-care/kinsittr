import BillingView from "@/src/components/dashboard/BillingView";

export const metadata = { title: "Billing — KinSittr" };

export default function ParentBillingPage() {
  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <BillingView />
    </div>
  );
}
