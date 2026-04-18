import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import EditorStep2 from "@/components/editor/editor-step2";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ subAccountId: string; funnelId: string; funnelPageId: string }>;
}) {
  const { subAccountId, funnelId, funnelPageId } = await params;

  const page = await db.funnelPage.findUnique({ where: { id: funnelPageId } });
  if (!page) return notFound();

  return (
    <>
      <style>{`main { overflow: visible !important; padding: 0 !important; }`}</style>
      <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "var(--background)", overflow: "hidden" }}>
        <EditorStep2
          pageId={funnelPageId}
          pageName={page.name}
          funnelId={funnelId}
          subAccountId={subAccountId}
          initialContent={page.content}
        />
      </div>
    </>
  );
}
