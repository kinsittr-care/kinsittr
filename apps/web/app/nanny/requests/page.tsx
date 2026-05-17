import { Suspense } from "react";
import NannyRequestsView from "@/src/components/nanny/NannyRequestsView";

export const metadata = { title: "Requests — KinSittr Nanny" };

export default function NannyRequestsPage() {
  return (
    <Suspense fallback={null}>
      <NannyRequestsView />
    </Suspense>
  );
}
