"use client";

import { MIcon } from "../../../ui/m-icon";
import { Section, ColorField, type StyleProps } from "../shared";
import { N } from "./measures-menu";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Shadow = { x: number; y: number; blur: number; spread: number; color: string; inset: boolean };

function parseShadow(val: string): Shadow | null {
  if (!val || val === "none") return null;
  const inset = val.includes("inset");
  const clean = val.replace("inset", "").trim();
  // Match: x y blur spread color  OR  x y blur color
  const m = clean.match(/^(-?\d+)px\s+(-?\d+)px\s+(\d+)px\s+(-?\d+)px\s+(.+)$/) ||
            clean.match(/^(-?\d+)px\s+(-?\d+)px\s+(\d+)px\s+(.+)$/);
  if (!m) return null;
  if (m.length === 6) return { x: +m[1], y: +m[2], blur: +m[3], spread: +m[4], color: m[5].trim(), inset };
  return { x: +m[1], y: +m[2], blur: +m[3], spread: 0, color: m[4].trim(), inset };
}

function buildShadow(s: Shadow): string {
  return `${s.inset ? "inset " : ""}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`;
}

const presets: { label: string; value: string }[] = [
  { label: "sm", value: "0 1px 2px 0 rgba(0,0,0,0.05)" },
  { label: "md", value: "0 4px 6px -1px rgba(0,0,0,0.1)" },
  { label: "lg", value: "0 10px 15px -3px rgba(0,0,0,0.1)" },
  { label: "xl", value: "0 20px 25px -5px rgba(0,0,0,0.1)" },
  { label: "inner", value: "inset 0 2px 4px 0 rgba(0,0,0,0.06)" },
];

export function ShadowMenu({ get, set }: StyleProps) {
  const raw = get("boxShadow");
  const shadow = parseShadow(raw);
  const hasShadow = !!shadow;

  const toggle = () => {
    if (hasShadow) set("boxShadow", "none");
    else set("boxShadow", "0 2px 8px 0 rgba(0,0,0,0.1)");
  };

  const update = (patch: Partial<Shadow>) => {
    const s = shadow || { x: 0, y: 2, blur: 8, spread: 0, color: "rgba(0,0,0,0.1)", inset: false };
    set("boxShadow", buildShadow({ ...s, ...patch }));
  };

  return (
    <TooltipProvider delayDuration={200}>
    <Section title="Shadow" icon="blur_on" defaultOpen={hasShadow} action={
      <button onClick={toggle} className={cn("size-4 flex items-center justify-center rounded transition-colors", hasShadow ? "text-primary" : "text-muted-foreground/30")}>
        <MIcon name={hasShadow ? "visibility" : "visibility_off"} size={11} />
      </button>
    }>
      <div className="space-y-1.5">
        {hasShadow && shadow ? (<>
          {/* X / Y */}
          <div className="grid grid-cols-2 gap-1">
            <N icon="X" value={String(shadow.x)} onChange={(v) => update({ x: +v || 0 })} placeholder="0" tip="Offset X" />
            <N icon="Y" value={String(shadow.y)} onChange={(v) => update({ y: +v || 0 })} placeholder="0" tip="Offset Y" />
          </div>

          {/* Blur / Spread */}
          <div className="grid grid-cols-2 gap-1">
            <N icon="B" value={String(shadow.blur)} onChange={(v) => update({ blur: Math.max(0, +v || 0) })} placeholder="0" tip="Blur" />
            <N icon="S" value={String(shadow.spread)} onChange={(v) => update({ spread: +v || 0 })} placeholder="0" tip="Spread" />
          </div>

          {/* Color + Inset */}
          <div className="flex items-center gap-1">
            <div className="flex-1">
              <ColorField label="" value={shadow.color} onChange={(v) => update({ color: v })} />
            </div>
            <button onClick={() => update({ inset: !shadow.inset })} className={cn("flex h-5 px-1.5 items-center rounded border text-[9px] font-medium transition-colors shrink-0", shadow.inset ? "bg-primary/10 border-primary/30 text-primary" : "border-sidebar-border text-muted-foreground/40 hover:text-foreground")}>
              inset
            </button>
          </div>
        </>) : (
          /* Presets when no shadow */
          <div>
            <span className="text-[9px] text-muted-foreground/30 mb-1 block">Quick add</span>
            <div className="flex gap-0.5">
              {presets.map((p) => (
                <button key={p.label} onClick={() => set("boxShadow", p.value)} className="flex-1 h-5 rounded border border-sidebar-border text-[8px] font-medium text-muted-foreground/50 hover:text-foreground hover:border-primary/30 transition-colors">{p.label}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Section>
    </TooltipProvider>
  );
}
