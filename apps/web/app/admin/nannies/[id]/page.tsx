import AdminNannyDetailView from "@/src/components/admin/AdminNannyDetailView";

export const metadata = { title: "Nanny Details - KinSittr Admin" };

export default async function AdminNannyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminNannyDetailView nannyId={id} />;
}
