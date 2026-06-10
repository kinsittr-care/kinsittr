import { AuthLayout, AuthTabs } from "@/src/components/auth";

export const metadata = { title: "Sign in as a nanny — KinSittr" };

export default function NannyAuthPage() {
  return (
    <AuthLayout role="nanny">
      <AuthTabs role="nanny" />
    </AuthLayout>
  );
}
