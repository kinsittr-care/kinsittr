import AdminParentDetailView from "@/src/components/admin/AdminParentDetailView";

export const metadata = { title: "Parent Details - KinSittr Admin" };

export default async function AdminParentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminParentDetailView parentId={id} />;
}
