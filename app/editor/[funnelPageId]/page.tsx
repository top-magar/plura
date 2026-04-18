import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import EditorStep2 from "@/components/editor/editor-step2";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ funnelPageId: string }>;
}) {
  const { funnelPageId } = await params;

  const page = await db.funnelPage.findUnique({
    where: { id: funnelPageId },
    include: { Funnel: { select: { id: true, subAccountId: true } } },
  });
  if (!page) return notFound();

  return (
    <EditorStep2
      pageId={funnelPageId}
      pageName={page.name}
      funnelId={page.Funnel.id}
      subAccountId={page.Funnel.subAccountId}
      initialContent={page.content}
    />
  );
}
