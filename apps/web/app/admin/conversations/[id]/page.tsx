import AdminConversationDetailView from "@/src/components/admin/AdminConversationDetailView";

export const metadata = { title: "Conversation Details - KinSittr Admin" };

export default async function AdminConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminConversationDetailView conversationId={id} />;
}
