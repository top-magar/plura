"use client";

import { useState } from "react";
import { MIcon } from "../../../ui/m-icon";
import { Input } from "@/components/ui/input";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Section, IconToggle, SelectField, selectOptions, justifyOpts, alignOpts, px, strip, type StyleProps } from "../shared";
import { N } from "./measures-menu";
import { cn } from "@/lib/utils";
import type { El } from "../../../core/types";


const dirOpts = [
  { value: "row", label: "Row", icon: <MIcon name="arrow_forward" size={14} /> },
  { value: "column", label: "Column", icon: <MIcon name="arrow_downward" size={14} /> },
  { value: "row-reverse", label: "Row reverse", icon: <MIcon name="arrow_back" size={14} /> },
  { value: "column-reverse", label: "Col reverse", icon: <MIcon name="arrow_upward" size={14} /> },
];

export function LayoutMenu({ get, set, selected, onUpdate }: StyleProps & { selected: El; onUpdate: (el: El) => void }) {
  const [padLinked, setPadLinked] = useState(true);
  const display = get("display");
  const isFlex = display === "flex";
  const isGrid = display === "grid";
  const isCol = get("flexDirection") === "column" || get("flexDirection") === "column-reverse";
  const isWrap = get("flexWrap") === "wrap";

  return (
    <TooltipProvider delayDuration={200}>
    <Section title="Layout" icon="grid_view">
      <div className="space-y-1.5">

        {/* Display mode */}
        <div className="flex gap-0.5 rounded-md border border-sidebar-border p-0.5">
          {(["block", "flex", "grid"] as const).map((t) => (
            <button key={t} onClick={() => {
              set("display", t);
              if (t === "grid" && !get("gridTemplateColumns")) set("gridTemplateColumns", "1fr 1fr");
              if (t === "flex" && !get("flexDirection")) set("flexDirection", "column");
            }} className={cn("flex-1 h-5 rounded text-[9px] font-medium capitalize transition-colors", display === t || (t === "block" && !isFlex && !isGrid) ? "bg-primary text-primary-foreground" : "text-muted-foreground/50 hover:text-foreground")}>{t}</button>
          ))}
        </div>

        {/* ─── Flex ─── */}
        {isFlex && (<>
          {/* Direction + Wrap */}
          <div className="flex gap-1">
            <div className="flex-1"><IconToggle value={get("flexDirection") || "row"} options={dirOpts} onChange={(v) => set("flexDirection", v)} /></div>
            <button onClick={() => set("flexWrap", isWrap ? "nowrap" : "wrap")} className={cn("flex size-6 items-center justify-center rounded border transition-colors shrink-0", isWrap ? "border-primary/30 bg-primary/10 text-primary" : "border-sidebar-border text-muted-foreground/30 hover:text-foreground")} title="Wrap">
              <MIcon name="wrap_text" size={12} />
            </button>
          </div>

          {/* Align + Justify */}
          <div className="grid grid-cols-2 gap-1">
            <div>
              <span className="text-[9px] text-muted-foreground/30 mb-0.5 block">Align</span>
              <IconToggle value={get("alignItems")} options={alignOpts} onChange={(v) => set("alignItems", v)} />
            </div>
            <div>
              <span className="text-[9px] text-muted-foreground/30 mb-0.5 block">Justify</span>
              <IconToggle value={get("justifyContent")} options={justifyOpts} onChange={(v) => set("justifyContent", v)} />
            </div>
          </div>

          {/* Gap */}
          <div className="grid grid-cols-2 gap-1">
            <N icon="↕" value={strip(get("rowGap") || get("gap"))} onChange={(v) => set("rowGap", px(v))} placeholder="0" tip="Row gap" />
            <N icon="↔" value={strip(get("columnGap") || get("gap"))} onChange={(v) => set("columnGap", px(v))} placeholder="0" tip="Column gap" />
          </div>

          {/* Quick column count */}
          {Array.isArray(selected.content) && !isCol && (
            <div>
              <span className="text-[9px] text-muted-foreground/30 mb-0.5 block">Children</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4].map((n) => (
                  <button key={n} onClick={() => {
                    const cols = selected.content as El[];
                    if (n === cols.length) return;
                    if (n > cols.length) {
                      let u = selected;
                      for (let i = cols.length; i < n; i++) u = { ...u, content: [...(u.content as El[]), { id: crypto.randomUUID(), type: "column", name: `Col ${i + 1}`, styles: { display: "flex", flexDirection: "column", gap: "8px", flex: "1" }, content: [] }] };
                      onUpdate(u);
                    } else onUpdate({ ...selected, content: cols.slice(0, n) });
                  }} className={cn("flex-1 h-5 rounded border text-[9px] font-medium transition-colors", (selected.content as El[]).length === n ? "bg-primary text-primary-foreground border-primary" : "border-sidebar-border text-muted-foreground/50 hover:text-foreground")}>{n}</button>
                ))}
              </div>
            </div>
          )}
        </>)}

        {/* ─── Grid ─── */}
        {isGrid && (<>
          {/* Align + Justify */}
          <div className="grid grid-cols-2 gap-1">
            <div>
              <span className="text-[9px] text-muted-foreground/30 mb-0.5 block">Align</span>
              <IconToggle value={get("alignItems")} options={alignOpts} onChange={(v) => set("alignItems", v)} />
            </div>
            <div>
              <span className="text-[9px] text-muted-foreground/30 mb-0.5 block">Justify</span>
              <IconToggle value={get("justifyItems") || "stretch"} options={[
                { value: "start", label: "Start", icon: <MIcon name="align_horizontal_left" size={14} /> },
                { value: "center", label: "Center", icon: <MIcon name="align_horizontal_center" size={14} /> },
                { value: "end", label: "End", icon: <MIcon name="align_horizontal_right" size={14} /> },
                { value: "stretch", label: "Stretch", icon: <MIcon name="expand" size={14} /> },
              ]} onChange={(v) => set("justifyItems", v)} />
            </div>
          </div>

          {/* Gap */}
          <div className="grid grid-cols-2 gap-1">
            <N icon="↕" value={strip(get("rowGap") || get("gap"))} onChange={(v) => set("rowGap", px(v))} placeholder="0" tip="Row gap" />
            <N icon="↔" value={strip(get("columnGap") || get("gap"))} onChange={(v) => set("columnGap", px(v))} placeholder="0" tip="Column gap" />
          </div>

          {/* Columns */}
          <div>
            <span className="text-[9px] text-muted-foreground/30 mb-0.5 block">Columns</span>
            <div className="grid grid-cols-4 gap-0.5 mb-1">
              {[{ l: "1", v: "1fr" }, { l: "2", v: "1fr 1fr" }, { l: "3", v: "1fr 1fr 1fr" }, { l: "1:2", v: "1fr 2fr" }].map(({ l, v }) => (
                <button key={v} onClick={() => set("gridTemplateColumns", v)} className={cn("h-5 rounded border text-[9px] font-medium transition-colors", get("gridTemplateColumns") === v ? "bg-primary/10 border-primary/30 text-primary" : "border-sidebar-border text-muted-foreground/40 hover:text-foreground")}>{l}</button>
              ))}
            </div>
            <Input value={get("gridTemplateColumns")} onChange={(e) => set("gridTemplateColumns", e.target.value)} className="h-5 text-[10px] font-mono" placeholder="1fr 1fr" />
          </div>

          {/* Rows */}
          <div>
            <span className="text-[9px] text-muted-foreground/30 mb-0.5 block">Rows</span>
            <Input value={get("gridTemplateRows")} onChange={(e) => set("gridTemplateRows", e.target.value)} className="h-5 text-[10px] font-mono" placeholder="auto" />
          </div>
        </>)}

        {/* ─── Padding (always visible) ─── */}
        <div>
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-[9px] text-muted-foreground/30">Padding</span>
            <div className="flex-1" />
            <button onClick={() => setPadLinked(!padLinked)} className={cn("flex size-4 items-center justify-center rounded transition-colors", padLinked ? "text-primary" : "text-muted-foreground/30")}>
              <MIcon name={padLinked ? "link" : "link_off"} size={10} />
            </button>
          </div>
          {padLinked ? (
            <div className="grid grid-cols-2 gap-1">
              <N icon="↕" value={strip(get("paddingTop"))} onChange={(v) => { set("paddingTop", px(v)); set("paddingBottom", px(v)); }} placeholder="0" tip="Vertical" />
              <N icon="↔" value={strip(get("paddingRight"))} onChange={(v) => { set("paddingRight", px(v)); set("paddingLeft", px(v)); }} placeholder="0" tip="Horizontal" />
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-1">
              <N icon="↑" value={strip(get("paddingTop"))} onChange={(v) => set("paddingTop", px(v))} placeholder="0" tip="Top" />
              <N icon="→" value={strip(get("paddingRight"))} onChange={(v) => set("paddingRight", px(v))} placeholder="0" tip="Right" />
              <N icon="↓" value={strip(get("paddingBottom"))} onChange={(v) => set("paddingBottom", px(v))} placeholder="0" tip="Bottom" />
              <N icon="←" value={strip(get("paddingLeft"))} onChange={(v) => set("paddingLeft", px(v))} placeholder="0" tip="Left" />
            </div>
          )}
        </div>

        {/* Overflow (always visible) */}
        <div>
          <span className="text-[9px] text-muted-foreground/30 mb-0.5 block">Overflow</span>
          <SelectField label="" value={get("overflow") || "visible"} options={selectOptions.overflow} onChange={(v) => set("overflow", v)} />
        </div>
      </div>
    </Section>
    </TooltipProvider>
  );
}
