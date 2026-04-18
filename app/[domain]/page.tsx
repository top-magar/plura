import { db } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function DomainPage({
  params,
}: {
  params: { domain: string };
}) {
  const { domain } = params;

  const funnel = await db.funnel.findUnique({
    where: { subDomainName: domain },
    include: { FunnelPages: { orderBy: { order: "asc" } } },
  });

  if (!funnel) return notFound();

  // TODO: render first funnel page content
  return <div>{funnel.name}</div>;
}
