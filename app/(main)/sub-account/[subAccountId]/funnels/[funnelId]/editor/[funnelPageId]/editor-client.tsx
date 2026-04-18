"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { EditorProvider } from "@/components/editor/provider";
import EditorToolbar from "@/components/editor/toolbar";
import EditorSidebar from "@/components/editor/sidebar";
import EditorCanvas from "@/components/editor/canvas";
import PropertiesPanel from "@/components/editor/properties";

type Props = {
  subAccountId: string;
  funnelId: string;
  funnelPageId: string;
  pageName: string;
  pageContent: string | null;
};

export default function EditorClient({ subAccountId, funnelId, funnelPageId, pageName, pageContent }: Props) {
  return (
    <EditorProvider>
      <TooltipProvider>
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          <EditorToolbar funnelId={funnelId} subAccountId={subAccountId} pageName={pageName} pageId={funnelPageId} />
          <div className="flex flex-1 overflow-hidden">
            <EditorSidebar />
            <EditorCanvas funnelPageId={funnelPageId} pageContent={pageContent} />
            <PropertiesPanel />
          </div>
        </div>
      </TooltipProvider>
    </EditorProvider>
  );
}
