"use client";

import { useState } from "react";
import { MIcon } from "../../../ui/m-icon";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Section, IconToggle, SelectField, selectOptions, justifyOpts, alignOpts, directionOpts, type StyleProps } from "../shared";
import { N } from "./measures-menu";
import { cn } from "@/lib/utils";
import type { El } from "../../../core/types";

export function LayoutMenu({ get, set, selected, onUpdate }: StyleProps & { selected: El; onUpdate: (el: El) => void }) {
  const [padLinked, setPadLinked] = useState(true);
  const layoutType = get("display") === "grid" ? "grid" : get("display") === "flex" ? "flex" : null;
  const isCol = get("flexDirection") === "column" || get("flexDirection") === "column-reverse";
  const isWrap = get("flexWrap") === "wrap";

  return (
    <TooltipProvider delayDuration={200}>
    <Section title="Layout" icon="grid_view">
      <div className="space-y-2">
        <div className="flex gap-1">
          {(["flex","grid","block"] as const).map((t) => (
            <button key={t} onClick={() => { set("display", t === "block" ? "block" : t); if (t === "grid" && !get("gridTemplateColumns")) set("gridTemplateColumns", "1fr 1fr"); }} className={cn("flex-1 h-6 rounded border text-[10px] font-medium capitalize transition-colors", (t === "block" && !layoutType) || get("display") === t ? "bg-primary text-primary-foreground border-primary" : "border-sidebar-border text-muted-foreground/60 hover:text-foreground")}>{t}</button>
          ))}
          {layoutType && <Tooltip><TooltipTrigger asChild><button onClick={() => { set("display", "block"); set("flexDirection", ""); set("gridTemplateColumns", ""); set("gridTemplateRows", ""); }} className="flex size-6 items-center justify-center rounded border border-sidebar-border text-muted-foreground/40 hover:text-destructive transition-colors shrink-0"><MIcon name="close" size={12} /></button></TooltipTrigger><TooltipContent className="text-[10px]">Remove layout</TooltipContent></Tooltip>}
        </div>

        {layoutType === "flex" && (<>
          <div className="flex gap-1">
            <div className="flex-1"><IconToggle value={get("flexDirection")} options={directionOpts} onChange={(v) => set("flexDirection", v)} /></div>
            <button onClick={() => set("flexWrap", isWrap ? "nowrap" : "wrap")} className={cn("flex size-6 items-center justify-center rounded border transition-colors shrink-0", isWrap ? "border-primary/30 bg-primary/10 text-primary" : "border-sidebar-border text-muted-foreground/40")}><MIcon name="wrap_text" size={13} /></button>
          </div>
          <div><span className="text-[9px] text-muted-foreground/40 mb-0.5 block">Align</span><IconToggle value={get("alignItems")} options={alignOpts} onChange={(v) => set("alignItems", v)} /></div>
          <div><span className="text-[9px] text-muted-foreground/40 mb-0.5 block">Justify</span><IconToggle value={get("justifyContent")} options={justifyOpts} onChange={(v) => set("justifyContent", v)} /></div>
          <div className="grid grid-cols-2 gap-1">
            <N icon="↕" value={get("rowGap") || get("gap")} onChange={(v) => set("rowGap", v)} placeholder="0" tip="Row gap" disabled={!isWrap && !isCol} />
            <N icon="↔" value={get("columnGap") || get("gap")} onChange={(v) => set("columnGap", v)} placeholder="0" tip="Column gap" disabled={!isWrap && isCol} />
          </div>
        </>)}

        {layoutType === "grid" && (<>
          <IconToggle value={get("gridAutoFlow") || "row"} options={[{ value: "row", label: "Row", icon: <MIcon name="arrow_forward" size={14} /> }, { value: "column", label: "Column", icon: <MIcon name="arrow_downward" size={14} /> }]} onChange={(v) => set("gridAutoFlow", v)} />
          <div><span className="text-[9px] text-muted-foreground/40 mb-0.5 block">Align items</span><IconToggle value={get("alignItems")} options={alignOpts} onChange={(v) => set("alignItems", v)} /></div>
          <div className="grid grid-cols-2 gap-1">
            <N icon="↕" value={get("rowGap") || get("gap")} onChange={(v) => set("rowGap", v)} placeholder="0" tip="Row gap" />
            <N icon="↔" value={get("columnGap") || get("gap")} onChange={(v) => set("columnGap", v)} placeholder="0" tip="Column gap" />
          </div>
          <div><span className="text-[9px] text-muted-foreground/40 mb-0.5 block">Columns</span><Input value={get("gridTemplateColumns")} onChange={(e) => set("gridTemplateColumns", e.target.value)} className="h-6 text-[10px] font-mono" placeholder="1fr 1fr" /><div className="flex gap-0.5 mt-1 flex-wrap">{["1fr","1fr 1fr","1fr 1fr 1fr","1fr 2fr","repeat(3, 1fr)"].map((p) => <button key={p} onClick={() => set("gridTemplateColumns", p)} className={cn("h-5 px-1.5 rounded border text-[8px] font-mono transition-colors", get("gridTemplateColumns") === p ? "bg-primary/10 border-primary/30 text-primary" : "border-sidebar-border text-muted-foreground/50 hover:text-foreground")}>{p}</button>)}</div></div>
          <div><span className="text-[9px] text-muted-foreground/40 mb-0.5 block">Rows</span><Input value={get("gridTemplateRows")} onChange={(e) => set("gridTemplateRows", e.target.value)} className="h-6 text-[10px] font-mono" placeholder="auto" /></div>
        </>)}

        {layoutType && (
          <div className="flex items-center gap-1">
            {padLinked ? (
              <div className="grid grid-cols-2 gap-1 flex-1">
                <N icon="↕" value={get("paddingTop")} onChange={(v) => { set("paddingTop", v); set("paddingBottom", v); }} placeholder="0" tip="Vertical" />
                <N icon="↔" value={get("paddingRight")} onChange={(v) => { set("paddingRight", v); set("paddingLeft", v); }} placeholder="0" tip="Horizontal" />
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-1 flex-1">
                <N icon="↑" value={get("paddingTop")} onChange={(v) => set("paddingTop", v)} placeholder="0" tip="Top" />
                <N icon="→" value={get("paddingRight")} onChange={(v) => set("paddingRight", v)} placeholder="0" tip="Right" />
                <N icon="↓" value={get("paddingBottom")} onChange={(v) => set("paddingBottom", v)} placeholder="0" tip="Bottom" />
                <N icon="←" value={get("paddingLeft")} onChange={(v) => set("paddingLeft", v)} placeholder="0" tip="Left" />
              </div>
            )}
            <button onClick={() => setPadLinked(!padLinked)} className={cn("flex size-6 items-center justify-center rounded border transition-colors shrink-0", padLinked ? "border-primary/30 bg-primary/10 text-primary" : "border-sidebar-border text-muted-foreground/40")}><MIcon name={padLinked ? "link" : "link_off"} size={13} /></button>
          </div>
        )}
        <SelectField label="" value={get("overflow")} options={selectOptions.overflow} onChange={(v) => set("overflow", v)} />

        {/* Column count shortcut for row containers */}
        {Array.isArray(selected.content) && (get("flexDirection") === "row" || get("flexDirection") === "row-reverse") && (
          <div>
            <span className="text-[9px] text-muted-foreground/40 mb-0.5 block">Columns</span>
            <div className="flex gap-1">
              {[1,2,3,4].map((n) => (
                <button key={n} onClick={() => {
                  const cols = selected.content as El[];
                  if (n === cols.length) return;
                  if (n > cols.length) { let u = selected; for (let i = cols.length; i < n; i++) { u = { ...u, content: [...(u.content as El[]), { id: crypto.randomUUID(), type: "column", name: `Col ${i+1}`, styles: { display: "flex", flexDirection: "column", gap: "8px", flex: "1", padding: "8px" }, content: [] }] }; } onUpdate(u); }
                  else onUpdate({ ...selected, content: cols.slice(0, n) });
                }} className={cn("flex-1 h-7 rounded border text-[10px] font-medium transition-colors", (selected.content as El[]).length === n ? "bg-primary text-primary-foreground border-primary" : "border-sidebar-border hover:bg-sidebar-accent")}>{n}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Section>
    </TooltipProvider>
  );
}
