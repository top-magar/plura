import { getFunnelDetails } from "@/lib/queries";
import { notFound } from "next/navigation";
import FunnelDetailClient from "./client";

export default async function FunnelDetailPage({
  params,
}: {
  params: Promise<{ subAccountId: string; funnelId: string }>;
}) {
  const { subAccountId, funnelId } = await params;
  const funnel = await getFunnelDetails(funnelId);

  if (!funnel) return notFound();

  return <FunnelDetailClient funnel={funnel} subAccountId={subAccountId} />;
}
