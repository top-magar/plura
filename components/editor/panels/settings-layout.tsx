"use client";

import { MIcon } from "../ui/m-icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Section, IconToggle, SelectField, selectOptions, justifyOpts, alignOpts, directionOpts, wrapOpts, type StyleProps } from "./settings-shared";

export default function LayoutSection({ get, set }: StyleProps) {
  return (
    <Section title="Layout" icon="grid_view">
      <div className="space-y-2.5">
        <IconToggle
          value={get("width") === "fit-content" ? "hug" : get("width") === "100%" || get("flex") === "1" ? "fill" : "fixed"}
          options={[
            { value: "hug", label: "Hug Content", icon: <MIcon name="fit_screen" /> },
            { value: "fill", label: "Fill Container", icon: <MIcon name="expand" /> },
            { value: "fixed", label: "Fixed Width", icon: <MIcon name="remove" /> },
          ]}
          onChange={(v) => {
            if (v === "hug") { set("width", "fit-content"); set("flex", ""); }
            else if (v === "fill") { set("width", "100%"); set("flex", ""); }
            else { set("width", "auto"); set("flex", ""); }
          }}
        />
        <div className="grid grid-cols-2 gap-1">
          <Tooltip><TooltipTrigger asChild><div className="relative"><span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[9px] font-medium text-muted-foreground/40">W</span><Input value={get("width")} onChange={(e) => set("width", e.target.value)} className="h-6 text-[10px] pl-6 text-center" placeholder="auto" /></div></TooltipTrigger><TooltipContent className="text-[10px]">Width</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><div className="relative"><span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[9px] font-medium text-muted-foreground/40">H</span><Input value={get("height")} onChange={(e) => set("height", e.target.value)} className="h-6 text-[10px] pl-6 text-center" placeholder="auto" /></div></TooltipTrigger><TooltipContent className="text-[10px]">Height</TooltipContent></Tooltip>
        </div>
        <div className="h-px bg-sidebar-border" />
        <div>
          <span className="text-[9px] font-medium text-emerald-500/60 uppercase tracking-wider mb-1 block">Padding</span>
          <div className="grid grid-cols-2 gap-1">
            {([["paddingTop","border_top"],["paddingRight","border_right"],["paddingBottom","border_bottom"],["paddingLeft","border_left"]] as const).map(([p, ic]) => (
              <Tooltip key={p}><TooltipTrigger asChild><div className="relative"><MIcon name={ic} size={10} className="absolute left-1 top-1/2 -translate-y-1/2 text-emerald-500/40" /><Input value={get(p)} onChange={(e) => set(p, e.target.value)} className="h-6 text-[10px] pl-5 text-center" placeholder="0" /></div></TooltipTrigger><TooltipContent className="text-[10px]">{{paddingTop:"Top",paddingRight:"Right",paddingBottom:"Bottom",paddingLeft:"Left"}[p]}</TooltipContent></Tooltip>
            ))}
          </div>
        </div>
        <div className="h-px bg-sidebar-border" />
        <div className="grid grid-cols-2 gap-1">
          <SelectField label="" value={get("overflow")} options={selectOptions.overflow} onChange={(v) => set("overflow", v)} />
          <SelectField label="" value={get("objectFit")} options={selectOptions.objectFit} onChange={(v) => set("objectFit", v)} />
        </div>
        <div className="h-px bg-sidebar-border" />
        <SelectField label="" value={get("display")} options={selectOptions.display} onChange={(v) => set("display", v)} />
        <IconToggle value={get("flexDirection")} options={directionOpts} onChange={(v) => set("flexDirection", v)} />
        <div className="grid grid-cols-2 gap-1">
          <IconToggle value={get("justifyContent")} options={justifyOpts} onChange={(v) => set("justifyContent", v)} />
          <IconToggle value={get("alignItems")} options={alignOpts} onChange={(v) => set("alignItems", v)} />
        </div>
        <div className="grid grid-cols-2 gap-1">
          <IconToggle value={get("flexWrap")} options={wrapOpts} onChange={(v) => set("flexWrap", v)} />
          <Tooltip><TooltipTrigger asChild><div className="relative"><MIcon name="space_bar" size={10} className="absolute left-1 top-1/2 -translate-y-1/2 text-muted-foreground/40" /><Input value={get("gap")} onChange={(e) => set("gap", e.target.value)} className="h-6 text-[10px] pl-5" placeholder="0px" /></div></TooltipTrigger><TooltipContent className="text-[10px]">Gap</TooltipContent></Tooltip>
        </div>
      </div>
    </Section>
  );
}
