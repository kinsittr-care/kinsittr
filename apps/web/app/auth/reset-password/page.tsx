import { AuthLayout, RecoveryResetView } from "@/src/components/auth";

export const metadata = { title: "Create new password — KinSittr" };

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;

  return (
    <AuthLayout role="parent">
      <RecoveryResetView token={params.token ?? ""} />
    </AuthLayout>
  );
}
