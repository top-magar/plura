"use client";

import { useState, type CSSProperties } from "react";
import { MIcon } from "../../ui/m-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { El } from "../../core/types";
import { cn } from "@/lib/utils";
import { useEditor } from "../../core/provider";
import { findParentId } from "../../core/tree-helpers";
import DesignTab from "./design-tab";
import ContentTab from "./content-tab";

export default function SettingsTab() {
  const { state, dispatch } = useEditor();
  const selected = state.editor.selected;
  if (!selected) return null;

  const device = state.editor.device;
  const resolved = device === "Desktop" ? selected.styles : { ...selected.styles, ...selected.responsiveStyles?.[device] };
  const s = resolved as Record<string, unknown>;
  const get = (p: string) => String(s[p] ?? "");
  const set = (p: string, v: string) => {
    if (device === "Desktop") {
      dispatch({ type: "UPDATE_ELEMENT_LIVE", payload: { element: { ...selected, styles: { ...selected.styles, [p]: v } as CSSProperties } } });
    } else {
      const prev = selected.responsiveStyles ?? {};
      dispatch({ type: "UPDATE_ELEMENT_LIVE", payload: { element: { ...selected, responsiveStyles: { ...prev, [device]: { ...prev[device], [p]: v } } } } });
    }
  };
  const onUpdate = (el: El) => dispatch({ type: "UPDATE_ELEMENT", payload: { element: el } });
  const parentId = findParentId(state.editor.elements, selected.id);
  const isBody = selected.type === "__body";
  const [tab, setTab] = useState<"design" | "content">("design");

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
      {/* Header */}
      <div className="border-b border-sidebar-border px-3 py-2 space-y-1.5 shrink-0">
        <div className="flex items-center gap-1">
          <input className="h-6 min-w-0 flex-1 rounded border border-sidebar-border bg-transparent px-2 text-[11px] outline-none focus:border-primary" value={selected.name} onChange={(e) => onUpdate({ ...selected, name: e.target.value })} />
          {device !== "Desktop" && <Badge className="shrink-0 px-1.5 py-0 text-[9px] h-4 bg-primary/10 text-primary border-primary/20">{device}</Badge>}
        </div>
        <div className="flex items-center gap-0.5">
          {parentId && <Button variant="ghost" size="icon" className="size-6" onClick={() => dispatch({ type: "DUPLICATE_ELEMENT", payload: { elId: selected.id, containerId: parentId } })}><MIcon name="content_copy" size={13} /></Button>}
          <Button variant="ghost" size="icon" className={cn("size-6", selected.locked && "text-amber-500")} onClick={() => onUpdate({ ...selected, locked: !selected.locked })}><MIcon name={selected.locked ? "lock" : "lock_open"} size={13} /></Button>
          <Button variant="ghost" size="icon" className={cn("size-6", selected.hidden && "text-muted-foreground/40")} onClick={() => onUpdate({ ...selected, hidden: !selected.hidden })}><MIcon name={selected.hidden ? "visibility_off" : "visibility"} size={13} /></Button>
          <div className="flex-1" />
          {!isBody && <Button variant="ghost" size="icon" className="size-6 text-muted-foreground/50 hover:text-destructive" onClick={() => dispatch({ type: "DELETE_ELEMENT", payload: { id: selected.id } })}><MIcon name="delete" size={13} /></Button>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-sidebar-border shrink-0">
        {(["design", "content"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("flex-1 h-7 text-[10px] font-medium capitalize transition-colors", tab === t ? "text-foreground border-b-2 border-primary" : "text-muted-foreground/50 hover:text-foreground")}>{t}</button>
        ))}
      </div>

      {tab === "design" && <DesignTab get={get} set={set} selected={selected} onUpdate={onUpdate} />}
      {tab === "content" && <ContentTab selected={selected} onUpdate={onUpdate} />}
    </div>
  );
}
