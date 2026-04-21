"use client";

import { useState } from "react";
import { MIcon } from "../../../ui/m-icon";
import { Input } from "@/components/ui/input";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Section, IconToggle, SelectField, selectOptions, justifyOpts, alignOpts, directionOpts, type StyleProps } from "../shared";
import { N } from "./measures-menu";
import { cn } from "@/lib/utils";
import type { El } from "../../../core/types";

export function LayoutMenu({ get, set, selected, onUpdate }: StyleProps & { selected: El; onUpdate: (el: El) => void }) {
  const [padLinked, setPadLinked] = useState(true);
  const display = get("display");
  const isFlex = display === "flex";
  const isGrid = display === "grid";
  const hasLayout = isFlex || isGrid;
  const isCol = get("flexDirection") === "column" || get("flexDirection") === "column-reverse";
  const isWrap = get("flexWrap") === "wrap";

  return (
    <TooltipProvider delayDuration={200}>
    <Section title="Layout" icon="grid_view">
      <div className="space-y-2">

        {/* Display mode */}
        <div className="flex gap-0.5 rounded-md border border-sidebar-border p-0.5">
          {(["block", "flex", "grid"] as const).map((t) => (
            <button key={t} onClick={() => {
              set("display", t);
              if (t === "grid" && !get("gridTemplateColumns")) set("gridTemplateColumns", "1fr 1fr");
            }} className={cn("flex-1 h-5 rounded text-[9px] font-medium capitalize transition-colors", display === t || (t === "block" && !hasLayout) ? "bg-primary text-primary-foreground" : "text-muted-foreground/50 hover:text-foreground")}>{t}</button>
          ))}
        </div>

        {/* ─── Flex ─── */}
        {isFlex && (
          <div className="space-y-1.5">
            {/* Direction + Wrap */}
            <div className="flex gap-1">
              <div className="flex-1"><IconToggle value={get("flexDirection")} options={directionOpts} onChange={(v) => set("flexDirection", v)} /></div>
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
              <N icon="↕" value={get("rowGap") || get("gap")} onChange={(v) => set("rowGap", v)} placeholder="0" tip="Row gap" />
              <N icon="↔" value={get("columnGap") || get("gap")} onChange={(v) => set("columnGap", v)} placeholder="0" tip="Column gap" />
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
                        for (let i = cols.length; i < n; i++) u = { ...u, content: [...(u.content as El[]), { id: crypto.randomUUID(), type: "column", name: `Col ${i + 1}`, styles: { display: "flex", flexDirection: "column", gap: "8px", flex: "1", padding: "8px" }, content: [] }] };
                        onUpdate(u);
                      } else onUpdate({ ...selected, content: cols.slice(0, n) });
                    }} className={cn("flex-1 h-5 rounded border text-[9px] font-medium transition-colors", (selected.content as El[]).length === n ? "bg-primary text-primary-foreground border-primary" : "border-sidebar-border text-muted-foreground/50 hover:text-foreground")}>{n}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Grid ─── */}
        {isGrid && (
          <div className="space-y-1.5">
            {/* Flow direction */}
            <IconToggle value={get("gridAutoFlow") || "row"} options={[
              { value: "row", label: "Row", icon: <MIcon name="arrow_forward" size={14} /> },
              { value: "column", label: "Column", icon: <MIcon name="arrow_downward" size={14} /> },
            ]} onChange={(v) => set("gridAutoFlow", v)} />

            {/* Align */}
            <div>
              <span className="text-[9px] text-muted-foreground/30 mb-0.5 block">Align</span>
              <IconToggle value={get("alignItems")} options={alignOpts} onChange={(v) => set("alignItems", v)} />
            </div>

            {/* Gap */}
            <div className="grid grid-cols-2 gap-1">
              <N icon="↕" value={get("rowGap") || get("gap")} onChange={(v) => set("rowGap", v)} placeholder="0" tip="Row gap" />
              <N icon="↔" value={get("columnGap") || get("gap")} onChange={(v) => set("columnGap", v)} placeholder="0" tip="Column gap" />
            </div>

            {/* Columns */}
            <div>
              <span className="text-[9px] text-muted-foreground/30 mb-0.5 block">Columns</span>
              <div className="flex gap-0.5 mb-1">
                {["1fr", "1fr 1fr", "1fr 1fr 1fr", "1fr 2fr", "repeat(3, 1fr)"].map((p) => (
                  <button key={p} onClick={() => set("gridTemplateColumns", p)} className={cn("h-5 px-1 rounded border text-[8px] font-mono transition-colors", get("gridTemplateColumns") === p ? "bg-primary/10 border-primary/30 text-primary" : "border-sidebar-border text-muted-foreground/40 hover:text-foreground")}>{p.replace("repeat(3, 1fr)", "3×1fr")}</button>
                ))}
              </div>
              <Input value={get("gridTemplateColumns")} onChange={(e) => set("gridTemplateColumns", e.target.value)} className="h-5 text-[10px] font-mono" placeholder="1fr 1fr" />
            </div>

            {/* Rows */}
            <div>
              <span className="text-[9px] text-muted-foreground/30 mb-0.5 block">Rows</span>
              <Input value={get("gridTemplateRows")} onChange={(e) => set("gridTemplateRows", e.target.value)} className="h-5 text-[10px] font-mono" placeholder="auto" />
            </div>
          </div>
        )}

        {/* ─── Padding (only when layout is set) ─── */}
        {hasLayout && (
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
                <N icon="↕" value={get("paddingTop")} onChange={(v) => { set("paddingTop", v); set("paddingBottom", v); }} placeholder="0" tip="Vertical" />
                <N icon="↔" value={get("paddingRight")} onChange={(v) => { set("paddingRight", v); set("paddingLeft", v); }} placeholder="0" tip="Horizontal" />
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-1">
                <N icon="↑" value={get("paddingTop")} onChange={(v) => set("paddingTop", v)} placeholder="0" tip="Top" />
                <N icon="→" value={get("paddingRight")} onChange={(v) => set("paddingRight", v)} placeholder="0" tip="Right" />
                <N icon="↓" value={get("paddingBottom")} onChange={(v) => set("paddingBottom", v)} placeholder="0" tip="Bottom" />
                <N icon="←" value={get("paddingLeft")} onChange={(v) => set("paddingLeft", v)} placeholder="0" tip="Left" />
              </div>
            )}
          </div>
        )}

        {/* Overflow */}
        {hasLayout && (
          <div>
            <span className="text-[9px] text-muted-foreground/30 mb-0.5 block">Overflow</span>
            <SelectField label="" value={get("overflow")} options={selectOptions.overflow} onChange={(v) => set("overflow", v)} />
          </div>
        )}
      </div>
    </Section>
    </TooltipProvider>
  );
}
