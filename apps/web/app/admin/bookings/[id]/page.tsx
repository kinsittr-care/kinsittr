import AdminBookingDetailView from "@/src/components/admin/AdminBookingDetailView";

export const metadata = { title: "Booking Details - KinSittr Admin" };

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminBookingDetailView bookingId={id} />;
}
