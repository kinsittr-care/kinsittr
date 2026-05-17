import { Suspense } from "react";
import NannyMessagesView from "@/src/components/nanny/NannyMessagesView";

export const metadata = { title: "Messages — KinSittr Nanny" };

export default function NannyMessagesPage() {
  return (
    <Suspense fallback={null}>
      <NannyMessagesView />
    </Suspense>
  );
}
