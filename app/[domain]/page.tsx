import { db } from "@/lib/db";
import { notFound } from "next/navigation";

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

  if (!funnel) return notFound();

  return <div>{funnel.name}</div>;
}
