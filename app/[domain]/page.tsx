import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { updateFunnelPageVisits } from "@/lib/queries";
import PageRenderer from "./renderer";

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
  const page = funnel.FunnelPages[0];
  if (!page) return notFound();

  await updateFunnelPageVisits(page.id);

  return <PageRenderer content={page.content} />;
}
