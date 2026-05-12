import type { ReactNode } from "react";
import NannyShell from "@/src/components/nanny/NannyShell";

export const metadata = { title: "Nanny — KinSittr" };

export default function NannyLayout({ children }: { children: ReactNode }) {
  return <NannyShell>{children}</NannyShell>;
}
