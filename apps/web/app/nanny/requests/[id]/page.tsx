import NannyRequestDetailView from "@/src/components/nanny/requests/NannyRequestDetailView";

export const metadata = { title: "Request Details - KinSittr Nanny" };

export default async function NannyRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <NannyRequestDetailView bookingId={id} />;
}
