"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { EditorProvider } from "@/components/editor/provider";
import EditorToolbar from "@/components/editor/toolbar";
import EditorSidebar from "@/components/editor/sidebar";
import EditorCanvas from "@/components/editor/canvas";
import PropertiesPanel from "@/components/editor/properties";
import type { FunnelPage } from "@/lib/generated/prisma/client";

type Props = {
  subAccountId: string;
  funnelId: string;
  funnelPageId: string;
  pageDetails: FunnelPage;
};

export default function EditorClient({ subAccountId, funnelId, funnelPageId, pageDetails }: Props) {
  return (
    <EditorProvider subAccountId={subAccountId} funnelId={funnelId} pageDetails={pageDetails}>
      <TooltipProvider>
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          <EditorToolbar funnelId={funnelId} subAccountId={subAccountId} pageName={pageDetails.name} pageId={funnelPageId} />
          <div className="flex flex-1 overflow-hidden">
            <EditorSidebar />
            <EditorCanvas funnelPageId={funnelPageId} pageContent={pageDetails.content} />
            <PropertiesPanel />
          </div>
        </div>
      </TooltipProvider>
    </EditorProvider>
  );
}
