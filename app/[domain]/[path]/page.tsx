import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { updateFunnelPageVisits } from "@/lib/queries";
import PageRenderer from "../renderer";

export default async function DomainPathPage({
  params,
}: {
  params: Promise<{ domain: string; path: string }>;
}) {
  const { domain, path } = await params;

  const funnel = await db.funnel.findUnique({
    where: { subDomainName: domain },
    include: { FunnelPages: { where: { pathName: path } } },
  });

  if (!funnel?.published) return notFound();
  const page = funnel.FunnelPages[0];
  if (!page) return notFound();

  await updateFunnelPageVisits(page.id);

  return <PageRenderer content={page.content} />;
}
