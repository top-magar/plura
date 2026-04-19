import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { EditorProvider } from "@/components/editor-v2/editor-provider";
import Editor from "@/components/editor-v2/editor";

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
    <EditorProvider
      subaccountId={page.Funnel.subAccountId}
      funnelId={page.Funnel.id}
      pageDetails={{
        id: page.id,
        name: page.name,
        order: page.order,
        content: page.content,
        funnelId: page.funnelId,
      }}
    >
      <Editor />
    </EditorProvider>
  );
}
