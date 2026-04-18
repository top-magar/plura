import { getFunnels } from "@/lib/queries";
import FunnelsClient from "./client";

export default async function FunnelsPage({
  params,
}: {
  params: Promise<{ subAccountId: string }>;
}) {
  const { subAccountId } = await params;
  const funnels = await getFunnels(subAccountId);

  return <FunnelsClient funnels={funnels} subAccountId={subAccountId} />;
}
