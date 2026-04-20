"use client";

import { MIcon } from "../../ui/m-icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Section, type StyleProps } from "./shared";

export default function PositionSection({ get, set }: StyleProps) {
  return (
    <Section title="Position" icon="open_with" defaultOpen={false}>
      <div className="space-y-2">
        <div className="flex gap-1">
          <div className="flex gap-px rounded-md border border-sidebar-border overflow-hidden flex-1">
            {(["flex-start","center","flex-end"] as const).map((v, i) => (
              <Tooltip key={v}><TooltipTrigger asChild>
                <button onClick={() => set("alignSelf", v)} className={cn("flex flex-1 h-6 items-center justify-center text-muted-foreground transition-colors hover:text-foreground", get("alignSelf") === v && "bg-primary/10 text-primary")}>
                  <MIcon name={["align_horizontal_left","align_horizontal_center","align_horizontal_right"][i]} size={14} />
                </button>
              </TooltipTrigger><TooltipContent className="text-[10px]">{["Align Left","Align Center","Align Right"][i]}</TooltipContent></Tooltip>
            ))}
          </div>
          <div className="flex gap-px rounded-md border border-sidebar-border overflow-hidden flex-1">
            {(["flex-start","center","flex-end"] as const).map((v, i) => (
              <Tooltip key={v}><TooltipTrigger asChild>
                <button onClick={() => set("justifySelf", v)} className={cn("flex flex-1 h-6 items-center justify-center text-muted-foreground transition-colors hover:text-foreground", get("justifySelf") === v && "bg-primary/10 text-primary")}>
                  <MIcon name={["align_vertical_top","align_vertical_center","align_vertical_bottom"][i]} size={14} />
                </button>
              </TooltipTrigger><TooltipContent className="text-[10px]">{["Align Top","Align Middle","Align Bottom"][i]}</TooltipContent></Tooltip>
            ))}
          </div>
        </div>
        <div className="flex gap-px rounded-md border border-sidebar-border overflow-hidden">
          {(["static","relative","absolute","fixed","sticky"] as const).map((v) => (
            <Tooltip key={v}><TooltipTrigger asChild>
              <button onClick={() => set("position", v)} className={cn("flex flex-1 h-6 items-center justify-center text-[9px] text-muted-foreground transition-colors hover:text-foreground", get("position") === v && "bg-primary/10 text-primary font-medium")}>
                {v.slice(0, 3)}
              </button>
            </TooltipTrigger><TooltipContent className="text-[10px]">{v}</TooltipContent></Tooltip>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-1">
          {([["top","arrow_upward","Top"],["right","arrow_forward","Right"],["bottom","arrow_downward","Bottom"],["left","arrow_back","Left"]] as const).map(([p, ic, label]) => (
            <Tooltip key={p}><TooltipTrigger asChild><div className="relative"><MIcon name={ic} size={10} className="absolute left-1 top-1/2 -translate-y-1/2 text-muted-foreground/40" /><Input value={get(p)} onChange={(e) => set(p, e.target.value)} className="h-6 text-[10px] pl-5 text-center" placeholder="—" /></div></TooltipTrigger><TooltipContent className="text-[10px]">{label}</TooltipContent></Tooltip>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1">
          <Tooltip><TooltipTrigger asChild><div className="relative"><MIcon name="layers" size={10} className="absolute left-1 top-1/2 -translate-y-1/2 text-muted-foreground/40" /><Input value={get("zIndex")} onChange={(e) => set("zIndex", e.target.value)} className="h-6 text-[10px] pl-5" placeholder="auto" /></div></TooltipTrigger><TooltipContent className="text-[10px]">Z-Index</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><div className="relative"><MIcon name="rotate_right" size={10} className="absolute left-1 top-1/2 -translate-y-1/2 text-muted-foreground/40" /><Input value={get("transform")} onChange={(e) => set("transform", e.target.value)} className="h-6 text-[10px] pl-5" placeholder="0deg" /></div></TooltipTrigger><TooltipContent className="text-[10px]">Rotate</TooltipContent></Tooltip>
        </div>
      </div>
    </Section>
  );
}
