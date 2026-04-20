"use client";

import Link from "next/link";
import {
  ArrowLeft, Save, Undo2, Redo2, Eye, Laptop, Tablet, Smartphone,
  ZoomIn, ZoomOut, Globe2, FileCode,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Device } from "./types";
import { useEditor } from "./editor-provider";

const devices: [Device, typeof Laptop][] = [
  ["Desktop", Laptop],
  ["Tablet", Tablet],
  ["Mobile", Smartphone],
];

interface EditorNavigationProps {
  pageTitle: string;
  onPageTitleChange: (v: string) => void;
  dirty: boolean;
  saving: boolean;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onSave: () => void;
  onExportHTML: () => void;
  onPublish: () => void;
}

export default function EditorNavigation({
  pageTitle, onPageTitleChange, dirty, saving, zoom,
  onZoomIn, onZoomOut, onSave, onExportHTML, onPublish,
}: EditorNavigationProps) {
  const { state, dispatch, subAccountId, funnelId } = useEditor();
  const device = state.editor.device;
  const canUndo = state.history.currentIndex > 0;
  const canRedo = state.history.currentIndex < state.history.history.length - 1;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-10 items-center border-b border-sidebar-border bg-sidebar px-2">

        {/* Left: back + title */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <Tooltip><TooltipTrigger asChild>
            <Button asChild variant="ghost" size="icon" className="size-7 shrink-0">
              <Link href={`/sub-account/${subAccountId}/funnels/${funnelId}`}>
                <ArrowLeft className="size-3.5" />
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
        <div className="flex items-center gap-1">
          {/* Undo/Redo */}
          <Tooltip><TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7" onClick={() => dispatch({ type: "UNDO" })} disabled={!canUndo}>
              <Undo2 className="size-3.5" />
            </Button>
          </TooltipTrigger><TooltipContent className="text-[10px]">Undo</TooltipContent></Tooltip>
          <span className="text-[9px] font-mono text-muted-foreground/50 tabular-nums w-5 text-center select-none">{state.history.currentIndex}</span>
          <Tooltip><TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7" onClick={() => dispatch({ type: "REDO" })} disabled={!canRedo}>
              <Redo2 className="size-3.5" />
            </Button>
          </TooltipTrigger><TooltipContent className="text-[10px]">Redo</TooltipContent></Tooltip>

          <Separator orientation="vertical" className="h-4 mx-0.5" />

          {/* Device toggle */}
          <div className="flex items-center gap-px rounded-md border border-sidebar-border p-px">
            {devices.map(([d, Icon]) => (
              <Tooltip key={d}><TooltipTrigger asChild>
                <button
                  onClick={() => dispatch({ type: "CHANGE_DEVICE", payload: { device: d } })}
                  className={cn(
                    "flex size-6 items-center justify-center rounded-sm text-muted-foreground transition-colors",
                    device === d && "bg-primary/10 text-primary"
                  )}
                >
                  <Icon className="size-3" />
                </button>
              </TooltipTrigger><TooltipContent className="text-[10px]">{d}</TooltipContent></Tooltip>
            ))}
          </div>

          <Separator orientation="vertical" className="h-4 mx-0.5" />

          {/* Zoom */}
          <Tooltip><TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7" onClick={onZoomOut}>
              <ZoomOut className="size-3" />
            </Button>
          </TooltipTrigger><TooltipContent className="text-[10px]">Zoom out</TooltipContent></Tooltip>
          <span className="w-7 text-center text-[10px] text-muted-foreground/60 tabular-nums select-none">{zoom}%</span>
          <Tooltip><TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7" onClick={onZoomIn}>
              <ZoomIn className="size-3" />
            </Button>
          </TooltipTrigger><TooltipContent className="text-[10px]">Zoom in</TooltipContent></Tooltip>
        </div>

        {/* Right: preview + export + publish + save */}
        <div className="flex items-center gap-1 flex-1 justify-end min-w-0">
          <Tooltip><TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7" onClick={() => dispatch({ type: "TOGGLE_PREVIEW" })}>
              <Eye className="size-3.5" />
            </Button>
          </TooltipTrigger><TooltipContent className="text-[10px]">Preview</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7" onClick={onExportHTML}>
              <FileCode className="size-3.5" />
            </Button>
          </TooltipTrigger><TooltipContent className="text-[10px]">Export HTML</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7" onClick={onPublish}>
              <Globe2 className="size-3.5" />
            </Button>
          </TooltipTrigger><TooltipContent className="text-[10px]">Publish</TooltipContent></Tooltip>

          <Separator orientation="vertical" className="h-4 mx-0.5" />

          <Button size="sm" onClick={onSave} className="relative h-7 gap-1 px-3 text-xs">
            <Save className="size-3" />
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
