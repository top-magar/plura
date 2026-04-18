import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import FunnelEditor from "@/components/editor/funnel-editor";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ funnelPageId: string }>;
}) {
  const { funnelPageId } = await params;

  const page = await db.funnelPage.findUnique({
    where: { id: funnelPageId },
    include: { Funnel: { select: { id: true, subAccountId: true, SubAccount: { select: { agencyId: true } } } } },
  });
  if (!page) return notFound();

  return (
    <FunnelEditor
      pageId={funnelPageId}
      pageName={page.name}
      funnelId={page.Funnel.id}
      subAccountId={page.Funnel.subAccountId}
      agencyId={page.Funnel.SubAccount.agencyId}
      initialContent={page.content}
    />
  );
}
