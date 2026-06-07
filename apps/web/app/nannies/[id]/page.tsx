import PublicNannyProfileView from "@/src/components/public-nanny/PublicNannyProfileView";

export const metadata = { title: "Nanny profile - KinSittr" };

export default async function PublicNannyProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PublicNannyProfileView nannyId={id} />;
}
