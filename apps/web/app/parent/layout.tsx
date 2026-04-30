import DashboardShell from "@/src/components/dashboard/DashboardShell";
import type { ReactNode } from "react";

export const metadata = { title: "Parent — KinSittr" };

export default function ParentLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
