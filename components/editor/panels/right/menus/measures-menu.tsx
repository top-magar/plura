"use client";

import { MIcon } from "../../../ui/m-icon";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Section, IconToggle, type StyleProps } from "../shared";
import type { El } from "../../../core/types";
import { cn } from "@/lib/utils";

function N({ icon, value, onChange, placeholder = "auto", tip, disabled, slider }: { icon: string; value: string; onChange: (v: string) => void; placeholder?: string; tip: string; disabled?: boolean; slider?: { min: number; max: number } }) {
  return (
    <Tooltip><TooltipTrigger asChild>
      <div className={cn("flex items-center gap-1", disabled && "opacity-40 pointer-events-none")}>
        {slider && (
          <input type="range" min={slider.min} max={slider.max} value={+value || 0} onChange={(e) => onChange(e.target.value)} className="flex-1 h-1 accent-primary cursor-pointer min-w-0" />
        )}
        <div className={cn("relative", slider ? "w-12 shrink-0" : "w-full")}>
          <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[9px] font-medium text-muted-foreground/40 select-none">{icon}</span>
          <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-5 text-[10px] pl-5 tabular-nums" placeholder={placeholder} />
        </div>
      </div>
    </TooltipTrigger><TooltipContent className="text-[10px]">{tip}</TooltipContent></Tooltip>
  );
}

export { N }; // re-export for other menus

export function MeasuresMenu({ get, set, selected, onUpdate }: StyleProps & { selected: El; onUpdate: (el: El) => void }) {
  const isFreeform = selected.x !== undefined;

  return (
    <TooltipProvider delayDuration={200}>
    <Section title="Size" icon="straighten">
      <div className="space-y-1.5">
        {/* Position */}
        {isFreeform && (
          <div className="grid grid-cols-2 gap-1">
            <N icon="X" value={String(selected.x ?? 0)} onChange={(v) => onUpdate({ ...selected, x: +v || 0 })} placeholder="0" tip="X position" />
            <N icon="Y" value={String(selected.y ?? 0)} onChange={(v) => onUpdate({ ...selected, y: +v || 0 })} placeholder="0" tip="Y position" />
          </div>
        )}

        {/* Size */}
        <div className="grid grid-cols-2 gap-1">
          <N icon="W" value={String(selected.w ?? '')} onChange={(v) => onUpdate({ ...selected, w: +v || 0 })} placeholder="auto" tip="Width" />
          <N icon="H" value={String(selected.h ?? '')} onChange={(v) => onUpdate({ ...selected, h: +v || 0 })} placeholder="auto" tip="Height" />
        </div>

        {/* Rotation (future) */}
      </div>
    </Section>
    </TooltipProvider>
  );
}
