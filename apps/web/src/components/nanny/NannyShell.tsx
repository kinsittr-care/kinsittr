import type { ReactNode } from "react";
import NannySidebar from "./NannySidebar";
import NannyMobileHeader from "./NannyMobileHeader";

export default function NannyShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh overflow-hidden bg-nanny-bg">
      <NannySidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <NannyMobileHeader />
        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
