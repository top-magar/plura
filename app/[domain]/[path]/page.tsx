import { db } from "@/lib/db";
import { notFound } from "next/navigation";

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

  const page = funnel?.FunnelPages?.[0];
  if (!page) return notFound();

  return <div>{page.name}</div>;
}
