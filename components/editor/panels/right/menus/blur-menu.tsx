"use client";

import { MIcon } from "../../../ui/m-icon";
import { Section, type StyleProps } from "../shared";
import { N } from "./measures-menu";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function parseFilter(val: string, fn: string): string {
  const m = val.match(new RegExp(`${fn}\\(([^)]+)\\)`));
  return m ? m[1].replace("px", "").replace("%", "").replace("deg", "") : "";
}

function setFilter(get: (p: string) => string, set: (p: string, v: string) => void, fn: string, val: string, unit: string) {
  const current = get("filter") || "";
  const regex = new RegExp(`${fn}\\([^)]*\\)\\s*`);
  const cleaned = current.replace(regex, "").trim();
  const next = val && val !== "0" ? `${cleaned} ${fn}(${val}${unit})`.trim() : cleaned;
  set("filter", next || "");
}

const blendModes = ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion"];

const filterRows: { label: string; fn: string; unit: string; icon: string; min?: number; max?: number; placeholder: string }[] = [
  { label: "Blur", fn: "blur", unit: "px", icon: "blur_on", placeholder: "0" },
  { label: "Brightness", fn: "brightness", unit: "%", icon: "brightness_6", min: 0, max: 200, placeholder: "100" },
  { label: "Contrast", fn: "contrast", unit: "%", icon: "contrast", min: 0, max: 200, placeholder: "100" },
  { label: "Saturate", fn: "saturate", unit: "%", icon: "palette", min: 0, max: 200, placeholder: "100" },
  { label: "Grayscale", fn: "grayscale", unit: "%", icon: "filter_b_and_w", min: 0, max: 100, placeholder: "0" },
  { label: "Hue", fn: "hue-rotate", unit: "deg", icon: "rotate_right", min: 0, max: 360, placeholder: "0" },
];

export function BlurMenu({ get, set }: StyleProps) {
  const hasFilter = !!get("filter");
  const hasBackdrop = !!get("backdropFilter");
  const opacity = get("opacity");
  const blend = get("mixBlendMode") || "normal";

  return (
    <TooltipProvider delayDuration={200}>
    <Section title="Effects" icon="auto_awesome" defaultOpen={false} action={
      hasFilter || hasBackdrop ? (
        <button onClick={() => { set("filter", ""); set("backdropFilter", ""); }} className="size-4 flex items-center justify-center rounded text-muted-foreground/30 hover:text-destructive transition-colors">
          <MIcon name="close" size={10} />
        </button>
      ) : undefined
    }>
      <div className="space-y-1.5">
        {/* Opacity */}
        <div>
          <span className="text-[9px] text-muted-foreground/30 mb-0.5 block">Opacity</span>
          <div className="flex items-center gap-1.5">
            <input type="range" min={0} max={100} value={opacity ? Math.round(parseFloat(opacity) * 100) : 100} onChange={(e) => set("opacity", String(+e.target.value / 100))} className="flex-1 h-1 accent-primary cursor-pointer" />
            <span className="text-[9px] text-muted-foreground/40 tabular-nums w-7 text-right shrink-0">{opacity ? Math.round(parseFloat(opacity) * 100) : 100}%</span>
          </div>
        </div>

        {/* Blend mode */}
        <div>
          <span className="text-[9px] text-muted-foreground/30 mb-0.5 block">Blend</span>
          <div className="flex flex-wrap gap-0.5">
            {blendModes.map((m) => (
              <button key={m} onClick={() => set("mixBlendMode", m === "normal" ? "" : m)} className={cn("h-4 px-1 rounded text-[7px] font-medium transition-colors", blend === m || (m === "normal" && !get("mixBlendMode")) ? "bg-primary text-primary-foreground" : "bg-sidebar-accent/30 text-muted-foreground/40 hover:text-foreground")}>{m.replace("color-", "c-")}</button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div>
          <span className="text-[9px] text-muted-foreground/30 mb-0.5 block">Filters</span>
          <div className="space-y-1">
            {filterRows.map(({ label, fn, unit, icon, placeholder }) => {
              const val = parseFilter(get("filter"), fn);
              return (
                <div key={fn} className="flex items-center gap-1">
                  <MIcon name={icon} size={11} className="text-muted-foreground/30 shrink-0" />
                  <span className="text-[8px] text-muted-foreground/40 w-12 shrink-0">{label}</span>
                  <div className="flex-1">
                    <N icon="" value={val} onChange={(v) => setFilter(get, set, fn, v, unit)} placeholder={placeholder} tip={label} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Backdrop blur */}
        <div>
          <span className="text-[9px] text-muted-foreground/30 mb-0.5 block">Backdrop blur</span>
          <N icon="B" value={get("backdropFilter")?.replace("blur(", "").replace("px)", "").replace(")", "") || ""} onChange={(v) => set("backdropFilter", v && v !== "0" ? `blur(${v}px)` : "")} placeholder="0" tip="Backdrop blur (glass effect)" />
        </div>
      </div>
    </Section>
    </TooltipProvider>
  );
}
