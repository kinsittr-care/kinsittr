import type { ReactNode } from "react";
import { N } from "./tokens";
import NannySidebar from "./NannySidebar";

export default function NannyShell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        height: "100dvh",
        background: N.bg,
        overflow: "hidden",
      }}
    >
      <NannySidebar />
      <main
        style={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </main>
    </div>
  );
}
