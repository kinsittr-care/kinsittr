import type { ReactNode } from "react";
import { A } from "./tokens";
import AdminSidebar from "./AdminSidebar";

export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        height: "100dvh",
        background: A.bg,
        overflow: "hidden",
      }}
    >
      <AdminSidebar />
      <main style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
        {children}
      </main>
    </div>
  );
}
