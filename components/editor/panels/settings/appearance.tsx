"use client";

import { MIcon } from "../../ui/m-icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Section, ColorField, IconToggle, SelectField, selectOptions, borderStyleOpts, type StyleProps } from "./shared";

export default function AppearanceSection({ get, set }: StyleProps) {
  return (
    <>
    {/* ── Fill — Penpot shows each fill as a row with color + opacity ── */}
    <Section title="Fill" icon="format_color_fill">
      <div className="space-y-2">
        <ColorField label="" value={get("backgroundColor")} onChange={(v) => set("backgroundColor", v)} />
        <div className="grid grid-cols-2 gap-1">
          <div className="relative">
            <MIcon name="image" size={10} className="absolute left-1 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
            <Input value={get("backgroundImage")} onChange={(e) => set("backgroundImage", e.target.value)} className="h-6 text-[10px] pl-5" placeholder="url()" />
          </div>
          <SelectField label="" value={get("backgroundSize")} options={selectOptions.backgroundSize} onChange={(v) => set("backgroundSize", v)} />
        </div>
        {/* Opacity — like Penpot's layer opacity */}
        <div className="flex items-center gap-2">
          <MIcon name="opacity" size={12} className="text-muted-foreground/40 shrink-0" />
          <Slider value={[parseFloat(get("opacity") || "1")]} min={0} max={1} step={0.05} onValueChange={([v]) => set("opacity", String(v))} className="flex-1" />
          <span className="text-[9px] w-7 text-right text-muted-foreground/50 tabular-nums">{Math.round(parseFloat(get("opacity") || "1") * 100)}%</span>
        </div>
      </div>
    </Section>

    {/* ── Stroke — Penpot: color + width + style per stroke ── */}
    <Section title="Stroke" icon="border_style">
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-1">
          <ColorField label="" value={get("borderColor")} onChange={(v) => set("borderColor", v)} />
          <Tooltip><TooltipTrigger asChild>
            <div className="relative">
              <MIcon name="line_weight" size={10} className="absolute left-1 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
              <Input value={get("borderWidth")} onChange={(e) => set("borderWidth", e.target.value)} className="h-6 text-[10px] pl-5" placeholder="0px" />
            </div>
          </TooltipTrigger><TooltipContent className="text-[10px]">Width</TooltipContent></Tooltip>
        </div>
        <IconToggle value={get("borderStyle")} options={borderStyleOpts} onChange={(v) => set("borderStyle", v)} />
        <Tooltip><TooltipTrigger asChild>
          <div className="relative">
            <MIcon name="rounded_corner" size={10} className="absolute left-1 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
            <Input value={get("borderRadius")} onChange={(e) => set("borderRadius", e.target.value)} className="h-6 text-[10px] pl-5" placeholder="0px" />
          </div>
        </TooltipTrigger><TooltipContent className="text-[10px]">Border Radius</TooltipContent></Tooltip>
      </div>
    </Section>

    {/* ── Shadow — Penpot: each shadow as a row ── */}
    <Section title="Shadow" icon="blur_on" defaultOpen={!!get("boxShadow")}>
      <div className="space-y-2">
        <Tooltip><TooltipTrigger asChild>
          <Input value={get("boxShadow")} onChange={(e) => set("boxShadow", e.target.value)} className="h-6 text-[10px]" placeholder="0 2px 4px rgba(0,0,0,.1)" />
        </TooltipTrigger><TooltipContent className="text-[10px]">CSS box-shadow</TooltipContent></Tooltip>
        {!get("boxShadow") && (
          <button onClick={() => set("boxShadow", "0 2px 8px rgba(0,0,0,0.1)")} className="w-full h-6 rounded border border-dashed border-sidebar-border text-[10px] text-muted-foreground/50 hover:border-primary hover:text-primary transition-colors">
            + Add shadow
          </button>
        )}
      </div>
    </Section>
    </>
  );
}
