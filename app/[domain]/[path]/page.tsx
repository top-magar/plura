import { db } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function DomainPathPage({
  params,
}: {
  params: { domain: string; path: string };
}) {
  const { domain, path } = params;

  const funnel = await db.funnel.findUnique({
    where: { subDomainName: domain },
    include: {
      FunnelPages: {
        where: { pathName: path },
      },
    },
  });

  const page = funnel?.FunnelPages?.[0];
  if (!page) return notFound();

  // TODO: render funnel page content
  return <div>{page.name}</div>;
}
