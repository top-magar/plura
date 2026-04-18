import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { updateFunnelPageVisits } from "@/lib/queries";
import FunnelPageRenderer from "@/components/editor/page-renderer";

export default async function DomainPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;

  const funnel = await db.funnel.findUnique({
    where: { subDomainName: domain },
    include: { FunnelPages: { orderBy: { order: "asc" } } },
  });

  if (!funnel || !funnel.published) return notFound();

  const firstPage = funnel.FunnelPages[0];
  if (!firstPage) return notFound();

  // Track visit
  await updateFunnelPageVisits(firstPage.id);

  return <FunnelPageRenderer content={firstPage.content} />;
}
