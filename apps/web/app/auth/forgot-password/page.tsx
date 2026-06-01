import { AuthLayout, RecoveryRequestView } from "@/src/components/auth";

export const metadata = { title: "Reset password — KinSittr" };

export default function ForgotPasswordPage() {
  return (
    <AuthLayout role="parent">
      <RecoveryRequestView />
    </AuthLayout>
  );
}
