import { AuthLayout, AuthTabs } from "@/src/components/auth";

export const metadata = { title: "Sign in as a parent — KinSittr" };

export default function ParentAuthPage() {
  return (
    <AuthLayout role="parent">
      <AuthTabs role="parent" />
    </AuthLayout>
  );
}
