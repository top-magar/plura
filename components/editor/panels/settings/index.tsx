"use client";

import { type CSSProperties } from "react";
import { MIcon } from "../../ui/m-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { El } from "../../core/types";
import { cn } from "@/lib/utils";
import { useEditor } from "../../core/provider";
import { findParentId } from "../../core/tree-helpers";
import { Section, Field } from "./shared";
import TypographySection from "./typography";
import LayoutSection from "./layout";
import AppearanceSection from "./appearance";
import PositionSection from "./position";

// ── Context-aware visibility ────────────────────────────

const textTypes = new Set(["text", "heading", "subheading", "quote", "code", "list", "badge", "icon", "footer"]);
const containerTypes = new Set(["__body", "container", "section", "row", "column", "2Col", "3Col", "4Col", "grid", "hero", "header", "card", "sidebar", "modal", "form"]);
const simpleTypes = new Set(["divider", "spacer"]);

function showTypography(type: string) { return textTypes.has(type) || type === "button" || type === "link" || type === "navbar"; }
function showLayout(type: string) { return !simpleTypes.has(type); }
function showAppearance(type: string) { return !simpleTypes.has(type); }
function showPosition(type: string) { return !simpleTypes.has(type) && type !== "__body"; }

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
      dispatch({ type: "UPDATE_ELEMENT", payload: { element: { ...selected, styles: { ...selected.styles, [p]: v } as CSSProperties } } });
    } else {
      const prev = selected.responsiveStyles ?? {};
      dispatch({ type: "UPDATE_ELEMENT", payload: { element: { ...selected, responsiveStyles: { ...prev, [device]: { ...prev[device], [p]: v } } } } });
    }
  };
  const onUpdate = (el: El) => dispatch({ type: "UPDATE_ELEMENT", payload: { element: el } });
  const parentId = findParentId(state.editor.elements, selected.id);

  return (
    <div className="flex-1 overflow-y-auto">
      <TooltipProvider delayDuration={200}>

      {/* ── Layer: name, actions, opacity ── */}
      <div className="border-b border-sidebar-border px-3 py-2 space-y-2">
        <div className="flex items-center gap-1">
          <input className="h-6 min-w-0 flex-1 rounded border border-sidebar-border bg-transparent px-2 text-[11px] outline-none focus:border-primary" value={selected.name} onChange={(e) => onUpdate({ ...selected, name: e.target.value })} />
          {device !== "Desktop" && <Badge className="shrink-0 px-1.5 py-0 text-[9px] h-4 bg-primary/10 text-primary border-primary/20">{device}</Badge>}
        </div>
        <div className="flex items-center gap-1">
          {parentId && (
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="size-6" onClick={() => dispatch({ type: "DUPLICATE_ELEMENT", payload: { elId: selected.id, containerId: parentId } })}><MIcon name="content_copy" size={13} /></Button></TooltipTrigger><TooltipContent side="bottom" className="text-[10px]">Duplicate</TooltipContent></Tooltip>
          )}
          <Tooltip><TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className={cn("size-6", selected.locked && "text-amber-500")} onClick={() => onUpdate({ ...selected, locked: !selected.locked })}>
              <MIcon name={selected.locked ? "lock" : "lock_open"} size={13} />
            </Button>
          </TooltipTrigger><TooltipContent side="bottom" className="text-[10px]">{selected.locked ? "Unlock" : "Lock"}</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className={cn("size-6", selected.hidden && "text-muted-foreground/40")} onClick={() => onUpdate({ ...selected, hidden: !selected.hidden })}>
              <MIcon name={selected.hidden ? "visibility_off" : "visibility"} size={13} />
            </Button>
          </TooltipTrigger><TooltipContent side="bottom" className="text-[10px]">{selected.hidden ? "Show" : "Hide"}</TooltipContent></Tooltip>
          <div className="flex-1" />
          {selected.type !== "__body" && (
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="size-6 text-muted-foreground/50 hover:text-destructive" onClick={() => dispatch({ type: "DELETE_ELEMENT", payload: { id: selected.id } })}><MIcon name="delete" size={13} /></Button></TooltipTrigger><TooltipContent side="bottom" className="text-[10px]">Delete</TooltipContent></Tooltip>
          )}
        </div>
      </div>

      {/* ── Penpot section order ── */}

      {/* 1. Layout (measures + flex controls) */}
      {showLayout(selected.type) && <LayoutSection get={get} set={set} />}

      {/* 2. Typography */}
      {showTypography(selected.type) && <TypographySection get={get} set={set} />}

      {/* 3. Fill + Stroke + Shadow */}
      {showAppearance(selected.type) && <AppearanceSection get={get} set={set} />}

      {/* 4. Position */}
      {showPosition(selected.type) && <PositionSection get={get} set={set} />}

      {/* 5. Content (inline, not a separate tab) */}
      {!Array.isArray(selected.content) && Object.keys(selected.content as Record<string, string>).length > 0 && (
        <Section title="Content" icon="text_fields">
          <div className="space-y-2">
            {Object.entries(selected.content as Record<string, string>).map(([key, val]) => {
              const setVal = (v: string) => onUpdate({ ...selected, content: { ...(selected.content as Record<string, string>), [key]: v } });
              if (key === "innerText") return (
                <div key={key}>
                  <label className="mb-0.5 block text-[10px] text-sidebar-foreground/50">Text</label>
                  <textarea value={val} onChange={(e) => setVal(e.target.value)} className="w-full rounded border border-sidebar-border bg-transparent p-2 text-xs outline-none resize-y focus:border-primary min-h-[48px]" rows={3} />
                </div>
              );
              if (key === "src") return (
                <div key={key}>
                  <Field label="Source" value={val} onChange={setVal} placeholder="https://..." />
                  {val && <img src={val} alt="" className="mt-1 rounded border border-sidebar-border max-h-16 w-full object-cover" />}
                </div>
              );
              return <Field key={key} label={key} value={val} onChange={setVal} />;
            })}
          </div>
        </Section>
      )}

      {/* Quick Columns — for row containers */}
      {Array.isArray(selected.content) && (get("flexDirection") === "row" || get("flexDirection") === "row-reverse") && (
        <Section title="Columns" icon="view_column">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((n) => (
              <button key={n} onClick={() => {
                const cols = selected.content as El[];
                if (n === cols.length) return;
                if (n > cols.length) {
                  let updated = selected;
                  for (let i = cols.length; i < n; i++) {
                    const col: El = { id: crypto.randomUUID(), type: "column", name: `Col ${i + 1}`, styles: { display: "flex", flexDirection: "column", gap: "8px", flex: "1", padding: "8px" }, content: [] };
                    updated = { ...updated, content: [...(updated.content as El[]), col] };
                  }
                  onUpdate(updated);
                } else onUpdate({ ...selected, content: cols.slice(0, n) });
              }} className={cn("flex-1 h-7 rounded border text-[10px] font-medium transition-colors", (selected.content as El[]).length === n ? "bg-primary text-primary-foreground border-primary" : "border-sidebar-border hover:bg-sidebar-accent")}>{n}</button>
            ))}
          </div>
        </Section>
      )}

      </TooltipProvider>
    </div>
  );
}
