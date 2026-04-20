"use client";

import Link from "next/link";
import { MIcon } from "../ui/m-icon";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Device } from "../core/types";
import { useEditor } from "../core/provider";

const devices: [Device, string][] = [
  ["Desktop", "laptop_mac"],
  ["Tablet", "tablet_mac"],
  ["Mobile", "smartphone"],
];

interface EditorNavigationProps {
  pageTitle: string;
  onPageTitleChange: (v: string) => void;
  dirty: boolean;
  saving: boolean;
  zoom: number;
  metaDescription: string;
  onMetaDescriptionChange: (v: string) => void;
  ogImage: string;
  onOgImageChange: (v: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onSave: () => void;
  onExportHTML: () => void;
  onPublish: () => void;
}

export default function EditorNavigation({
  pageTitle, onPageTitleChange, dirty, saving, zoom,
  metaDescription, onMetaDescriptionChange, ogImage, onOgImageChange,
  onZoomIn, onZoomOut, onSave, onExportHTML, onPublish,
}: EditorNavigationProps) {
  const { state, dispatch, subAccountId, funnelId } = useEditor();
  const device = state.editor.device;
  const canUndo = state.history.currentIndex > 0;
  const canRedo = state.history.currentIndex < state.history.snapshots.length - 1;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-10 items-center border-b border-sidebar-border bg-sidebar px-2">

        {/* Left: back + title */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <Tooltip><TooltipTrigger asChild>
            <Button asChild variant="ghost" size="icon" className="size-7 shrink-0">
              <Link href={`/sub-account/${subAccountId}/funnels/${funnelId}`}>
                <MIcon name="arrow_back" size={14} />
              </Link>
            </Button>
          </TooltipTrigger><TooltipContent className="text-[10px]">Back to funnel</TooltipContent></Tooltip>
          <input
            className="h-6 w-32 rounded border border-transparent bg-transparent px-1.5 text-xs font-medium outline-none hover:border-sidebar-border focus:border-primary transition-colors"
            value={pageTitle}
            onChange={(e) => onPageTitleChange(e.target.value)}
          />
        </div>

        {/* Center: undo/redo + device + zoom */}
        <div className="flex items-center gap-1.5">
          {/* Undo/Redo */}
          <Tooltip><TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7" onClick={() => dispatch({ type: "UNDO" })} disabled={!canUndo}>
              <MIcon name="undo" size={14} />
            </Button>
          </TooltipTrigger><TooltipContent className="text-[10px]">Undo</TooltipContent></Tooltip>
          <span className="text-[9px] font-mono text-muted-foreground/50 tabular-nums w-5 text-center select-none">{state.history.currentIndex}</span>
          <Tooltip><TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7" onClick={() => dispatch({ type: "REDO" })} disabled={!canRedo}>
              <MIcon name="redo" size={14} />
            </Button>
          </TooltipTrigger><TooltipContent className="text-[10px]">Redo</TooltipContent></Tooltip>

          <Separator orientation="vertical" className="!h-3 !self-auto" />

          {/* Device toggle */}
          <div className="flex items-center gap-px rounded-md border border-sidebar-border p-px">
            {devices.map(([d, icon]) => (
              <Tooltip key={d}><TooltipTrigger asChild>
                <button
                  onClick={() => dispatch({ type: "CHANGE_DEVICE", payload: { device: d } })}
                  className={cn(
                    "flex size-6 items-center justify-center rounded-sm text-muted-foreground transition-colors",
                    device === d && "bg-primary/10 text-primary"
                  )}
                >
                  <MIcon name={icon} size={14} />
                </button>
              </TooltipTrigger><TooltipContent className="text-[10px]">{d}</TooltipContent></Tooltip>
            ))}
          </div>

          <Separator orientation="vertical" className="!h-3 !self-auto" />

          {/* Zoom */}
          <Tooltip><TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7" onClick={onZoomOut}>
              <MIcon name="zoom_out" size={14} />
            </Button>
          </TooltipTrigger><TooltipContent className="text-[10px]">Zoom out</TooltipContent></Tooltip>
          <span className="w-7 text-center text-[10px] text-muted-foreground/60 tabular-nums select-none">{zoom}%</span>
          <Tooltip><TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7" onClick={onZoomIn}>
              <MIcon name="zoom_in" size={14} />
            </Button>
          </TooltipTrigger><TooltipContent className="text-[10px]">Zoom in</TooltipContent></Tooltip>
        </div>

        {/* Right: preview + export + publish + save */}
        <div className="flex items-center gap-1.5 flex-1 justify-end min-w-0">
          <Tooltip><TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7" onClick={() => dispatch({ type: "TOGGLE_PREVIEW" })}>
              <MIcon name="visibility" size={14} />
            </Button>
          </TooltipTrigger><TooltipContent className="text-[10px]">Preview</TooltipContent></Tooltip>
          <Dialog>
            <Tooltip><TooltipTrigger asChild>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="size-7">
                  <MIcon name="settings" size={14} />
                </Button>
              </DialogTrigger>
            </TooltipTrigger><TooltipContent className="text-[10px]">Page Settings</TooltipContent></Tooltip>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle className="text-sm">Page Settings</DialogTitle></DialogHeader>
              <div className="space-y-3 py-2">
                <div>
                  <label className="text-xs font-medium mb-1 block">Page Title</label>
                  <Input value={pageTitle} onChange={(e) => onPageTitleChange(e.target.value)} className="h-8 text-xs" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Meta Description</label>
                  <textarea value={metaDescription} onChange={(e) => onMetaDescriptionChange(e.target.value)} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs outline-none resize-y min-h-[60px] focus:border-primary" placeholder="Brief description for search engines..." />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">OG Image URL</label>
                  <Input value={ogImage} onChange={(e) => onOgImageChange(e.target.value)} className="h-8 text-xs" placeholder="https://..." />
                  {ogImage && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={ogImage} alt="OG Preview" className="mt-2 rounded border max-h-32 object-cover w-full" />
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Tooltip><TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7" onClick={onExportHTML}>
              <MIcon name="code" size={14} />
            </Button>
          </TooltipTrigger><TooltipContent className="text-[10px]">Export HTML</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7" onClick={onPublish}>
              <MIcon name="public" size={14} />
            </Button>
          </TooltipTrigger><TooltipContent className="text-[10px]">Publish</TooltipContent></Tooltip>

          <Separator orientation="vertical" className="!h-3 !self-auto" />

          <Button size="sm" onClick={onSave} className="relative h-7 gap-1 px-3 text-xs">
            <MIcon name="save" size={14} />
            {saving ? "Saving" : "Save"}
            {dirty && !saving && <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-destructive" />}
          </Button>
          <span className={cn("text-[9px] w-10 transition-colors", saving ? "text-muted-foreground animate-pulse" : !dirty ? "text-emerald-500" : "text-transparent")}>
            {saving ? "..." : "Saved"}
          </span>
        </div>

      </div>
    </TooltipProvider>
  );
}
