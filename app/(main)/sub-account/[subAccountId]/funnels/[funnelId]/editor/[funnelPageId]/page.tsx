import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import EditorClient from "./editor-client";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ subAccountId: string; funnelId: string; funnelPageId: string }>;
}) {
  const { subAccountId, funnelId, funnelPageId } = await params;

  const funnelPage = await db.funnelPage.findUnique({
    where: { id: funnelPageId },
  });

  if (!funnelPage) return notFound();

  return (
    <EditorClient
      subAccountId={subAccountId}
      funnelId={funnelId}
      funnelPageId={funnelPageId}
      pageDetails={funnelPage}
    />
  );
}
