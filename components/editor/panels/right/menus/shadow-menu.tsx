"use client";

import { useState } from "react";
import { MIcon } from "../../../ui/m-icon";
import { Section, ColorField, type StyleProps } from "../shared";
import { N } from "./measures-menu";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Shadow = { x: number; y: number; blur: number; spread: number; color: string; inset: boolean };

function parseShadow(s: string): Shadow | null {
  if (!s.trim() || s.trim() === "none") return null;
  const inset = s.includes("inset");
  const clean = s.replace("inset", "").trim();
  const m = clean.match(/^(-?\d+)px\s+(-?\d+)px\s+(\d+)px\s+(-?\d+)px\s+(.+)$/) ||
            clean.match(/^(-?\d+)px\s+(-?\d+)px\s+(\d+)px\s+(.+)$/);
  if (!m) return null;
  return m.length === 6
    ? { x: +m[1], y: +m[2], blur: +m[3], spread: +m[4], color: m[5].trim(), inset }
    : { x: +m[1], y: +m[2], blur: +m[3], spread: 0, color: m[4].trim(), inset };
}

function parseShadows(val: string): Shadow[] {
  if (!val || val === "none") return [];
  // Split on commas not inside parens
  const parts: string[] = [];
  let depth = 0, cur = "";
  for (const ch of val) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    else if (ch === "," && depth === 0) { parts.push(cur.trim()); cur = ""; continue; }
    cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts.map(parseShadow).filter((s): s is Shadow => s !== null);
}

function buildShadow(s: Shadow): string {
  return `${s.inset ? "inset " : ""}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`;
}

function buildAll(shadows: Shadow[]): string {
  return shadows.length ? shadows.map(buildShadow).join(", ") : "none";
}

const defaults: Shadow = { x: 0, y: 4, blur: 12, spread: 0, color: "rgba(0,0,0,0.1)", inset: false };

const presets: { label: string; shadows: Shadow[] }[] = [
  { label: "sm", shadows: [{ x: 0, y: 1, blur: 2, spread: 0, color: "rgba(0,0,0,0.05)", inset: false }] },
  { label: "md", shadows: [{ x: 0, y: 4, blur: 6, spread: -1, color: "rgba(0,0,0,0.1)", inset: false }, { x: 0, y: 2, blur: 4, spread: -2, color: "rgba(0,0,0,0.1)", inset: false }] },
  { label: "lg", shadows: [{ x: 0, y: 10, blur: 15, spread: -3, color: "rgba(0,0,0,0.1)", inset: false }, { x: 0, y: 4, blur: 6, spread: -4, color: "rgba(0,0,0,0.1)", inset: false }] },
  { label: "xl", shadows: [{ x: 0, y: 20, blur: 25, spread: -5, color: "rgba(0,0,0,0.1)", inset: false }, { x: 0, y: 8, blur: 10, spread: -6, color: "rgba(0,0,0,0.1)", inset: false }] },
  { label: "inner", shadows: [{ x: 0, y: 2, blur: 4, spread: 0, color: "rgba(0,0,0,0.06)", inset: true }] },
];

export function ShadowMenu({ get, set }: StyleProps) {
  const shadows = parseShadows(get("boxShadow"));
  const hasShadow = shadows.length > 0;
  const [active, setActive] = useState(0);

  const commit = (next: Shadow[]) => set("boxShadow", buildAll(next));

  const toggle = () => commit(hasShadow ? [] : [{ ...defaults }]);

  const update = (i: number, patch: Partial<Shadow>) => {
    const next = shadows.map((s, j) => j === i ? { ...s, ...patch } : s);
    commit(next);
  };

  const add = () => { const next = [...shadows, { ...defaults }]; setActive(next.length - 1); commit(next); };
  const remove = (i: number) => { const next = shadows.filter((_, j) => j !== i); setActive(Math.min(active, next.length - 1)); commit(next); };
  const duplicate = (i: number) => { const next = [...shadows]; next.splice(i + 1, 0, { ...shadows[i] }); setActive(i + 1); commit(next); };

  const s = shadows[active];

  return (
    <TooltipProvider delayDuration={200}>
    <Section title="Shadow" icon="blur_on" defaultOpen={hasShadow} action={
      <button onClick={toggle} className={cn("size-4 flex items-center justify-center rounded transition-colors", hasShadow ? "text-primary" : "text-muted-foreground/30")}>
        <MIcon name={hasShadow ? "visibility" : "visibility_off"} size={11} />
      </button>
    }>
      <div className="space-y-1.5">
        {hasShadow ? (<>
          {/* Preview */}
          <div className="flex items-center justify-center h-10 rounded border border-sidebar-border bg-sidebar">
            <div className="size-6 rounded bg-background" style={{ boxShadow: buildAll(shadows) }} />
          </div>

          {/* Shadow list */}
          {shadows.length > 1 && (
            <div className="space-y-0.5">
              {shadows.map((sh, i) => (
                <div key={i} onClick={() => setActive(i)} className={cn("flex items-center gap-1.5 h-5 px-1.5 rounded text-[9px] cursor-pointer transition-colors", i === active ? "bg-primary/10 text-primary" : "text-muted-foreground/50 hover:bg-sidebar-accent/50")}>
                  <span className="size-2.5 rounded-sm shrink-0 border border-sidebar-border" style={{ background: sh.color }} />
                  <span className="truncate flex-1">{sh.inset ? "inset " : ""}{sh.x} {sh.y} {sh.blur} {sh.spread}</span>
                  <button onClick={(e) => { e.stopPropagation(); duplicate(i); }} className="size-3.5 flex items-center justify-center text-muted-foreground/30 hover:text-foreground shrink-0"><MIcon name="content_copy" size={9} /></button>
                  <button onClick={(e) => { e.stopPropagation(); remove(i); }} className="size-3.5 flex items-center justify-center text-muted-foreground/30 hover:text-destructive shrink-0"><MIcon name="close" size={9} /></button>
                </div>
              ))}
            </div>
          )}

          {/* Active shadow controls */}
          {s && (
            <div className="space-y-1">
              <div className="grid grid-cols-2 gap-1">
                <N icon="X" value={String(s.x)} onChange={(v) => update(active, { x: +v || 0 })} placeholder="0" tip="Offset X" />
                <N icon="Y" value={String(s.y)} onChange={(v) => update(active, { y: +v || 0 })} placeholder="0" tip="Offset Y" />
              </div>
              <div className="grid grid-cols-2 gap-1">
                <N icon="B" value={String(s.blur)} onChange={(v) => update(active, { blur: Math.max(0, +v || 0) })} placeholder="0" tip="Blur" />
                <N icon="S" value={String(s.spread)} onChange={(v) => update(active, { spread: +v || 0 })} placeholder="0" tip="Spread" />
              </div>
              <div className="flex items-center gap-1">
                <div className="flex-1">
                  <ColorField label="" value={s.color} onChange={(v) => update(active, { color: v })} />
                </div>
                <button onClick={() => update(active, { inset: !s.inset })} className={cn("flex h-5 px-1.5 items-center rounded border text-[8px] font-medium transition-colors shrink-0", s.inset ? "bg-primary/10 border-primary/30 text-primary" : "border-sidebar-border text-muted-foreground/40 hover:text-foreground")}>inset</button>
              </div>
            </div>
          )}

          {/* Add shadow */}
          <button onClick={add} className="flex items-center gap-1 text-[9px] text-muted-foreground/40 hover:text-foreground transition-colors">
            <MIcon name="add" size={10} /> Add shadow
          </button>
        </>) : (
          <div>
            <span className="text-[9px] text-muted-foreground/30 mb-1 block">Quick add</span>
            <div className="flex gap-0.5">
              {presets.map((p) => (
                <button key={p.label} onClick={() => { commit(p.shadows); setActive(0); }} className="flex-1 h-5 rounded border border-sidebar-border text-[8px] font-medium text-muted-foreground/50 hover:text-foreground hover:border-primary/30 transition-colors">{p.label}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Section>
    </TooltipProvider>
  );
}
