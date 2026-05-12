import AdminShell from "@/src/components/admin/AdminShell";
import type { ReactNode } from "react";

export const metadata = { title: "Admin Console — KinSittr" };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
