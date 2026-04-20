"use client";

import { useState } from "react";
import { MIcon } from "../../ui/m-icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Section, IconToggle, SelectField, selectOptions, justifyOpts, alignOpts, directionOpts, wrapOpts, type StyleProps } from "./shared";
import { cn } from "@/lib/utils";

function NumInput({ icon, value, onChange, placeholder = "auto", tip }: { icon: string; value: string; onChange: (v: string) => void; placeholder?: string; tip: string }) {
  return (
    <Tooltip><TooltipTrigger asChild>
      <div className="relative">
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[9px] font-medium text-muted-foreground/40 select-none">{icon}</span>
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-6 text-[10px] pl-5 tabular-nums" placeholder={placeholder} />
      </div>
    </TooltipTrigger><TooltipContent className="text-[10px]">{tip}</TooltipContent></Tooltip>
  );
}

export default function LayoutSection({ get, set }: StyleProps) {
  const [padLinked, setPadLinked] = useState(true);

  const setPad = (side: string, v: string) => {
    if (padLinked) { set("paddingTop", v); set("paddingRight", v); set("paddingBottom", v); set("paddingLeft", v); }
    else set(side, v);
  };

  return (
    <>
    {/* ── Size ── */}
    <Section title="Size" icon="straighten">
      <div className="space-y-2">
        {/* Sizing mode */}
        <IconToggle
          value={get("width") === "fit-content" ? "hug" : get("width") === "100%" || get("flex") === "1" ? "fill" : "fixed"}
          options={[
            { value: "hug", label: "Hug", icon: <MIcon name="fit_screen" size={14} /> },
            { value: "fill", label: "Fill", icon: <MIcon name="expand" size={14} /> },
            { value: "fixed", label: "Fixed", icon: <MIcon name="width" size={14} /> },
          ]}
          onChange={(v) => {
            if (v === "hug") { set("width", "fit-content"); set("flex", ""); }
            else if (v === "fill") { set("width", "100%"); set("flex", ""); }
            else { set("width", "auto"); set("flex", ""); }
          }}
        />
        {/* W × H — Penpot 2-column grid */}
        <div className="grid grid-cols-2 gap-1">
          <NumInput icon="W" value={get("width")} onChange={(v) => set("width", v)} tip="Width" />
          <NumInput icon="H" value={get("height")} onChange={(v) => set("height", v)} tip="Height" />
        </div>
        <div className="grid grid-cols-2 gap-1">
          <NumInput icon="↕" value={get("minHeight")} onChange={(v) => set("minHeight", v)} placeholder="none" tip="Min Height" />
          <NumInput icon="↔" value={get("maxWidth")} onChange={(v) => set("maxWidth", v)} placeholder="none" tip="Max Width" />
        </div>
        <div className="grid grid-cols-2 gap-1">
          <SelectField label="" value={get("overflow")} options={selectOptions.overflow} onChange={(v) => set("overflow", v)} />
          <SelectField label="" value={get("objectFit")} options={selectOptions.objectFit} onChange={(v) => set("objectFit", v)} />
        </div>
      </div>
    </Section>

    {/* ── Padding — Penpot linked/unlinked toggle ── */}
    <Section title="Padding" icon="padding">
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          {padLinked ? (
            <div className="flex-1">
              <NumInput icon="⊞" value={get("paddingTop")} onChange={(v) => setPad("paddingTop", v)} placeholder="0" tip="All sides" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1 flex-1">
              <NumInput icon="↑" value={get("paddingTop")} onChange={(v) => set("paddingTop", v)} placeholder="0" tip="Top" />
              <NumInput icon="→" value={get("paddingRight")} onChange={(v) => set("paddingRight", v)} placeholder="0" tip="Right" />
              <NumInput icon="↓" value={get("paddingBottom")} onChange={(v) => set("paddingBottom", v)} placeholder="0" tip="Bottom" />
              <NumInput icon="←" value={get("paddingLeft")} onChange={(v) => set("paddingLeft", v)} placeholder="0" tip="Left" />
            </div>
          )}
          <Tooltip><TooltipTrigger asChild>
            <button onClick={() => setPadLinked(!padLinked)} className={cn("flex size-6 items-center justify-center rounded border transition-colors", padLinked ? "border-primary/30 bg-primary/10 text-primary" : "border-sidebar-border text-muted-foreground/40 hover:text-foreground")}>
              <MIcon name={padLinked ? "link" : "link_off"} size={13} />
            </button>
          </TooltipTrigger><TooltipContent className="text-[10px]">{padLinked ? "Unlink sides" : "Link all sides"}</TooltipContent></Tooltip>
        </div>
      </div>
    </Section>

    {/* ── Flex Layout ── */}
    <Section title="Layout" icon="grid_view">
      <div className="space-y-2">
        <SelectField label="" value={get("display")} options={selectOptions.display} onChange={(v) => set("display", v)} />
        <IconToggle value={get("flexDirection")} options={directionOpts} onChange={(v) => set("flexDirection", v)} />
        <div className="grid grid-cols-2 gap-1">
          <IconToggle value={get("justifyContent")} options={justifyOpts} onChange={(v) => set("justifyContent", v)} />
          <IconToggle value={get("alignItems")} options={alignOpts} onChange={(v) => set("alignItems", v)} />
        </div>
        <div className="grid grid-cols-2 gap-1">
          <IconToggle value={get("flexWrap")} options={wrapOpts} onChange={(v) => set("flexWrap", v)} />
          <NumInput icon="⊟" value={get("gap")} onChange={(v) => set("gap", v)} placeholder="0px" tip="Gap" />
        </div>
      </div>
    </Section>
    </>
  );
}
