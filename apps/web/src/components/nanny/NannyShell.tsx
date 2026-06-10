import type { ReactNode } from "react";
import NannySidebar from "./NannySidebar";
import NannyMobileHeader from "./NannyMobileHeader";
import ProfileCompletionBanner from "../shared/ProfileCompletionBanner";
import AuthGuard from "../auth/AuthGuard";

export default function NannyShell({ children }: { children: ReactNode }) {
  return (
    <AuthGuard role="nanny">
      <div className="flex h-dvh overflow-hidden bg-nanny-bg">
        <NannySidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <NannyMobileHeader />
          <ProfileCompletionBanner role="nanny" />
          <main className="flex-1 flex flex-col overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
