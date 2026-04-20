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
    <div className="flex h-10 items-center justify-between border-b border-sidebar-border bg-sidebar px-2">
      {/* Left: back + title */}
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon" className="size-8">
          <Link href={`/sub-account/${subAccountId}/funnels/${funnelId}`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <input
          className="h-7 w-36 rounded border border-sidebar-border bg-transparent px-2 text-xs outline-none focus:border-primary"
          value={pageTitle}
          onChange={(e) => onPageTitleChange(e.target.value)}
        />
      </div>

      {/* Center: device toggle */}
      <div className="flex items-center gap-0.5 rounded-md border border-sidebar-border p-0.5">
        {devices.map(([d, Icon]) => (
          <button
            key={d}
            onClick={() => dispatch({ type: "CHANGE_DEVICE", payload: { device: d } })}
            className={cn(
              "flex size-7 items-center justify-center rounded-sm text-muted-foreground transition-colors",
              device === d && "bg-primary/10 text-primary"
            )}
          >
            <Icon className="size-3.5" />
          </button>
        ))}
      </div>

      {/* Right: actions */}
      <TooltipProvider delayDuration={300}>
        <div className="flex items-center gap-1">
          <Tooltip><TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8" onClick={() => dispatch({ type: "TOGGLE_PREVIEW" })}>
              <Eye className="size-4" />
            </Button>
          </TooltipTrigger><TooltipContent className="text-[10px]">Preview</TooltipContent></Tooltip>

          <Separator orientation="vertical" className="h-5" />

          <Tooltip><TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8" onClick={onZoomOut}>
              <ZoomOut className="size-3.5" />
            </Button>
          </TooltipTrigger><TooltipContent className="text-[10px]">Zoom Out (Cmd+-)</TooltipContent></Tooltip>
          <span className="w-8 text-center text-[10px] text-muted-foreground">{zoom}%</span>
          <Tooltip><TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8" onClick={onZoomIn}>
              <ZoomIn className="size-3.5" />
            </Button>
          </TooltipTrigger><TooltipContent className="text-[10px]">Zoom In (Cmd+=)</TooltipContent></Tooltip>

          <Separator orientation="vertical" className="h-5" />

          <Tooltip><TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8" onClick={() => dispatch({ type: "UNDO" })} disabled={!canUndo}>
              <Undo2 className="size-4" />
            </Button>
          </TooltipTrigger><TooltipContent className="text-[10px]">Undo (Cmd+Z)</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8" onClick={() => dispatch({ type: "REDO" })} disabled={!canRedo}>
              <Redo2 className="size-4" />
            </Button>
          </TooltipTrigger><TooltipContent className="text-[10px]">Redo (Cmd+Shift+Z)</TooltipContent></Tooltip>

          <Separator orientation="vertical" className="h-5" />

          <Tooltip><TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8" onClick={onExportHTML}>
              <FileCode className="size-3.5" />
            </Button>
          </TooltipTrigger><TooltipContent className="text-[10px]">Export HTML</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8" onClick={onPublish}>
              <Globe2 className="size-3.5" />
            </Button>
          </TooltipTrigger><TooltipContent className="text-[10px]">Publish</TooltipContent></Tooltip>

          <Separator orientation="vertical" className="h-5" />

          <Button size="sm" onClick={onSave} className="relative gap-1 text-xs">
            <Save className="size-3.5" /> Save
            {dirty && !saving && <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-destructive" />}
          </Button>
          {saving && <span className="text-[10px] text-muted-foreground animate-pulse">Saving...</span>}
          {!saving && !dirty && <span className="text-[10px] text-emerald-500">Saved</span>}
        </div>
      </TooltipProvider>
    </div>
  );
}
