"use client";

import { MIcon } from "../../ui/m-icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Section, ColorField, IconToggle, SelectField, selectOptions, borderStyleOpts, type StyleProps } from "./shared";

export default function AppearanceSection({ get, set }: StyleProps) {
  return (
    <Section title="Appearance" icon="palette">
      <div className="space-y-3">
        <div className="space-y-1.5">
          <span className="text-[9px] font-medium text-muted-foreground/50 uppercase tracking-wider">Fill</span>
          <ColorField label="Background" value={get("backgroundColor")} onChange={(v) => set("backgroundColor", v)} />
          <div className="grid grid-cols-2 gap-1">
            <Tooltip><TooltipTrigger asChild><div className="relative"><MIcon name="image" size={10} className="absolute left-1 top-1/2 -translate-y-1/2 text-muted-foreground/40" /><Input value={get("backgroundImage")} onChange={(e) => set("backgroundImage", e.target.value)} className="h-6 text-[10px] pl-5" placeholder="url()" /></div></TooltipTrigger><TooltipContent className="text-[10px]">Background Image</TooltipContent></Tooltip>
            <SelectField label="" value={get("backgroundSize")} options={selectOptions.backgroundSize} onChange={(v) => set("backgroundSize", v)} />
          </div>
        </div>
        <div className="h-px bg-sidebar-border" />
        <div className="space-y-1.5">
          <span className="text-[9px] font-medium text-muted-foreground/50 uppercase tracking-wider">Border</span>
          <div className="grid grid-cols-2 gap-1">
            <ColorField label="Color" value={get("borderColor")} onChange={(v) => set("borderColor", v)} />
            <Tooltip><TooltipTrigger asChild><div className="relative"><MIcon name="line_weight" size={10} className="absolute left-1 top-1/2 -translate-y-1/2 text-muted-foreground/40" /><Input value={get("borderWidth")} onChange={(e) => set("borderWidth", e.target.value)} className="h-6 text-[10px] pl-5" placeholder="0px" /></div></TooltipTrigger><TooltipContent className="text-[10px]">Border Width</TooltipContent></Tooltip>
          </div>
          <IconToggle value={get("borderStyle")} options={borderStyleOpts} onChange={(v) => set("borderStyle", v)} />
          <Tooltip><TooltipTrigger asChild><div className="relative"><MIcon name="rounded_corner" size={10} className="absolute left-1 top-1/2 -translate-y-1/2 text-muted-foreground/40" /><Input value={get("borderRadius")} onChange={(e) => set("borderRadius", e.target.value)} className="h-6 text-[10px] pl-5" placeholder="0px" /></div></TooltipTrigger><TooltipContent className="text-[10px]">Border Radius</TooltipContent></Tooltip>
        </div>
        <div className="h-px bg-sidebar-border" />
        <div className="space-y-1.5">
          <span className="text-[9px] font-medium text-muted-foreground/50 uppercase tracking-wider">Effects</span>
          <div className="flex items-center gap-2">
            <MIcon name="opacity" size={12} className="text-muted-foreground/40 shrink-0" />
            <Slider value={[parseFloat(get("opacity") || "1")]} min={0} max={1} step={0.05} onValueChange={([v]) => set("opacity", String(v))} className="flex-1" />
            <span className="text-[9px] w-6 text-right text-muted-foreground/50 tabular-nums">{get("opacity") || "1"}</span>
          </div>
          <Tooltip><TooltipTrigger asChild><div className="relative"><MIcon name="blur_on" size={10} className="absolute left-1 top-1/2 -translate-y-1/2 text-muted-foreground/40" /><Input value={get("boxShadow")} onChange={(e) => set("boxShadow", e.target.value)} className="h-6 text-[10px] pl-5" placeholder="0 2px 4px rgba(0,0,0,.1)" /></div></TooltipTrigger><TooltipContent className="text-[10px]">Box Shadow</TooltipContent></Tooltip>
          <div className="grid grid-cols-2 gap-1">
            <SelectField label="" value={get("cursor")} options={selectOptions.cursor} onChange={(v) => set("cursor", v)} />
            <Tooltip><TooltipTrigger asChild><div className="relative"><MIcon name="animation" size={10} className="absolute left-1 top-1/2 -translate-y-1/2 text-muted-foreground/40" /><Input value={get("transition")} onChange={(e) => set("transition", e.target.value)} className="h-6 text-[10px] pl-5" placeholder="all 0.2s" /></div></TooltipTrigger><TooltipContent className="text-[10px]">Transition</TooltipContent></Tooltip>
          </div>
        </div>
      </div>
    </Section>
  );
}
