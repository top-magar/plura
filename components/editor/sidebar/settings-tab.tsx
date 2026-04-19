"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import {
  Type, ChevronRight, ChevronDown, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  ArrowRight, ArrowDown, ArrowLeft, ArrowUp, MoveHorizontal, MoveVertical, WrapText,
  Italic, Underline, Strikethrough, CaseSensitive, CaseUpper, CaseLower,
  Minus, Minus as MinusIcon, SeparatorHorizontal, Box, Maximize, Palette, Frame,
  LayoutGrid, Move, Sparkles, Layers,
} from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Copy, Star, Pencil } from "lucide-react";
import type { El } from "../types";
import { useEditor } from "../editor-provider";
import { findParentId } from "../tree-helpers";

const selectOptions: Record<string, string[]> = {
  display: ["block", "flex", "grid", "inline", "inline-block", "inline-flex", "none"],
  flexDirection: ["row", "column", "row-reverse", "column-reverse"],
  justifyContent: ["flex-start", "center", "flex-end", "space-between", "space-around", "space-evenly"],
  alignItems: ["flex-start", "center", "flex-end", "stretch", "baseline"],
  textAlign: ["left", "center", "right", "justify"],
  fontWeight: ["300", "400", "500", "600", "700", "800", "900"],
  fontStyle: ["normal", "italic"],
  textDecoration: ["none", "underline", "line-through"],
  textTransform: ["none", "uppercase", "lowercase", "capitalize"],
  overflow: ["visible", "hidden", "auto", "scroll"],
  position: ["static", "relative", "absolute", "fixed", "sticky"],
  cursor: ["default", "pointer", "text", "move", "not-allowed", "grab"],
  borderStyle: ["none", "solid", "dashed", "dotted", "double"],
  backgroundSize: ["auto", "cover", "contain"],
  backgroundPosition: ["center", "top", "bottom", "left", "right"],
  backgroundRepeat: ["no-repeat", "repeat", "repeat-x", "repeat-y"],
  flexWrap: ["nowrap", "wrap", "wrap-reverse"],
  objectFit: ["fill", "contain", "cover", "none", "scale-down"],
};

const propGroups = [
  { title: "Typography", icon: Type, props: ["fontSize", "fontWeight", "fontStyle", "color", "textAlign", "textDecoration", "textTransform", "lineHeight", "letterSpacing"] },
  { title: "Spacing", icon: Box, props: ["_spacing_box"] },
  { title: "Size", icon: Maximize, props: ["_size_box"] },
  { title: "Background", icon: Palette, props: ["backgroundColor", "backgroundImage", "backgroundSize", "backgroundPosition", "backgroundRepeat"] },
  { title: "Border", icon: Frame, props: ["_border_box"] },
  { title: "Layout", icon: LayoutGrid, props: ["display", "flexDirection", "flexWrap", "justifyContent", "alignItems", "gap", "flex"] },
  { title: "Position", icon: Move, props: ["_position_box"] },
  { title: "Effects", icon: Sparkles, props: ["opacity", "boxShadow", "cursor", "transition"] },
];

const colorProps = new Set(["color", "backgroundColor", "borderColor"]);

type IconOpt = { value: string; label: string; icon: ReactNode };

const iconOptions: Record<string, IconOpt[]> = {
  textAlign: [
    { value: "left", label: "Left", icon: <AlignLeft size={12} /> },
    { value: "center", label: "Center", icon: <AlignCenter size={12} /> },
    { value: "right", label: "Right", icon: <AlignRight size={12} /> },
    { value: "justify", label: "Justify", icon: <AlignJustify size={12} /> },
  ],
  flexDirection: [
    { value: "row", label: "Row", icon: <ArrowRight size={12} /> },
    { value: "column", label: "Column", icon: <ArrowDown size={12} /> },
    { value: "row-reverse", label: "Row Reverse", icon: <ArrowLeft size={12} /> },
    { value: "column-reverse", label: "Col Reverse", icon: <ArrowUp size={12} /> },
  ],
  justifyContent: [
    { value: "flex-start", label: "Start", icon: <AlignLeft size={12} /> },
    { value: "center", label: "Center", icon: <AlignCenter size={12} /> },
    { value: "flex-end", label: "End", icon: <AlignRight size={12} /> },
    { value: "space-between", label: "Between", icon: <MoveHorizontal size={12} /> },
  ],
  alignItems: [
    { value: "flex-start", label: "Start", icon: <ArrowUp size={12} /> },
    { value: "center", label: "Center", icon: <Minus size={12} /> },
    { value: "flex-end", label: "End", icon: <ArrowDown size={12} /> },
    { value: "stretch", label: "Stretch", icon: <MoveVertical size={12} /> },
  ],
  fontStyle: [
    { value: "normal", label: "Normal", icon: <Type size={12} /> },
    { value: "italic", label: "Italic", icon: <Italic size={12} /> },
  ],
  textDecoration: [
    { value: "none", label: "None", icon: <Type size={12} /> },
    { value: "underline", label: "Underline", icon: <Underline size={12} /> },
    { value: "line-through", label: "Strikethrough", icon: <Strikethrough size={12} /> },
  ],
  textTransform: [
    { value: "none", label: "None", icon: <MinusIcon size={12} /> },
    { value: "uppercase", label: "Uppercase", icon: <CaseUpper size={12} /> },
    { value: "lowercase", label: "Lowercase", icon: <CaseLower size={12} /> },
    { value: "capitalize", label: "Capitalize", icon: <CaseSensitive size={12} /> },
  ],
  flexWrap: [
    { value: "nowrap", label: "No Wrap", icon: <ArrowRight size={12} /> },
    { value: "wrap", label: "Wrap", icon: <WrapText size={12} /> },
  ],
  borderStyle: [
    { value: "none", label: "None", icon: <MinusIcon size={12} /> },
    { value: "solid", label: "Solid", icon: <Minus size={12} /> },
    { value: "dashed", label: "Dashed", icon: <SeparatorHorizontal size={12} /> },
  ],
};

function IconToggle({ value, options, onChange }: { value: string; options: IconOpt[]; onChange: (v: string) => void }) {
  return (
    <TooltipProvider delayDuration={200}>
      <ToggleGroup type="single" value={value} onValueChange={(v) => { if (v) onChange(v); }} className="flex w-full gap-px bg-border">
        {options.map((o) => (
          <Tooltip key={o.value}>
            <TooltipTrigger asChild>
              <ToggleGroupItem value={o.value} className="flex h-6 min-w-0 flex-1 items-center justify-center rounded-none border-0 bg-muted p-0 text-[10px] text-muted-foreground transition-colors hover:text-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground" aria-label={o.label}>
                {o.icon}
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-[10px] px-2 py-1">{o.label}</TooltipContent>
          </Tooltip>
        ))}
      </ToggleGroup>
    </TooltipProvider>
  );
}

function PropGroup({ title, icon: Icon, props, selected, onUpdate }: { title: string; icon: React.ComponentType<{ size?: number }>; props: string[]; selected: El; onUpdate: (el: El) => void }) {
  const [open, setOpen] = useState(true);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mb-1">
      <CollapsibleTrigger className="flex w-full items-center gap-1 border-0 bg-transparent py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground cursor-pointer">
        {open ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
        <Icon size={11} />
        {title}
      </CollapsibleTrigger>
      <CollapsibleContent>
        {props[0] === "_spacing_box" ? (
          <SpacingBox selected={selected} onUpdate={onUpdate} />
        ) : props[0] === "_size_box" ? (
          <SizeBox selected={selected} onUpdate={onUpdate} />
        ) : props[0] === "_border_box" ? (
          <BorderBox selected={selected} onUpdate={onUpdate} />
        ) : props[0] === "_position_box" ? (
          <PositionBox selected={selected} onUpdate={onUpdate} />
        ) : (
        <div className="grid grid-cols-2 gap-1 pb-2">
          {props.map((p) => {
            const val = String((selected.styles as Record<string, unknown>)[p] ?? "");
            const isColor = colorProps.has(p);
            const options = selectOptions[p];
            const update = (v: string) => onUpdate({ ...selected, styles: { ...selected.styles, [p]: v } as CSSProperties });

            if (p === "opacity") {
              return (
                <div key={p} className="col-span-2">
                  <label className="mb-0.5 block text-[10px] capitalize text-muted-foreground">opacity</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Slider value={[parseFloat(val || "1")]} min={0} max={1} step={0.05} onValueChange={([v]) => update(String(v))} className="flex-1" />
                    <span className="text-[10px] w-7 text-right text-muted-foreground">{val || "1"}</span>
                  </div>
                </div>
              );
            }

            if (isColor) {
              return (
                <div key={p}>
                  <label className="mb-0.5 block text-[10px] capitalize text-muted-foreground">{p.replace(/([A-Z])/g, " $1")}</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex h-6 w-full items-center gap-2 border border-border bg-muted px-2 hover:border-foreground cursor-pointer">
                        <span className="size-3.5 shrink-0 border border-border" style={{ background: val || "transparent" }} />
                        <span className="text-[10px] text-muted-foreground truncate">{val || "none"}</span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-52 p-3" side="left" align="start">
                      <input type="color" value={val || "#000000"} onChange={(e) => update(e.target.value)} style={{ width: "100%", height: 32, border: 0, cursor: "pointer", background: "transparent" }} />
                      <div className="grid grid-cols-8 gap-1 mt-2">
                        {["#000000","#ffffff","#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#6366f1","#8b5cf6","#ec4899","#14b8a6","#64748b","#1e293b","#f1f5f9","#fef2f2","#fefce8"].map((c) => (
                          <button key={c} onClick={() => update(c)} className="w-5 h-5 border border-border cursor-pointer" style={{ background: c }} />
                        ))}
                      </div>
                      <Input value={val} onChange={(e) => update(e.target.value)} className="h-6 text-[10px] mt-2" placeholder="#hex or rgb()" />
                    </PopoverContent>
                  </Popover>
                </div>
              );
            }

            if (iconOptions[p]) {
              return (
                <div key={p} className="col-span-2">
                  <label className="mb-0.5 block text-[10px] capitalize text-muted-foreground">{p.replace(/([A-Z])/g, " $1")}</label>
                  <IconToggle value={val} options={iconOptions[p]} onChange={update} />
                </div>
              );
            }

            if (options) {
              return (
                <div key={p}>
                  <label className="mb-0.5 block text-[10px] capitalize text-muted-foreground">{p.replace(/([A-Z])/g, " $1")}</label>
                  <Select value={val || undefined} onValueChange={update}>
                    <SelectTrigger className="h-6 text-[10px] px-2"><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      {options.map((o) => <SelectItem key={o} value={o} className="text-[11px]">{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              );
            }

            return (
              <div key={p}>
                <label className="mb-0.5 block text-[10px] capitalize text-muted-foreground">{p.replace(/([A-Z])/g, " $1")}</label>
                <Input value={val} onChange={(e) => update(e.target.value)} className="h-6 text-[10px]" />
              </div>
            );
          })}
        </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

function SpacingBox({ selected, onUpdate }: { selected: El; onUpdate: (el: El) => void }) {
  const s = selected.styles as Record<string, unknown>;
  const get = (p: string) => String(s[p] ?? "");
  const set = (p: string, v: string) => onUpdate({ ...selected, styles: { ...selected.styles, [p]: v } as CSSProperties });

  return (
    <div className="py-2">
      <div className="relative grid grid-cols-[1fr_auto_1fr] grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-[40px] border border-dashed border-primary/20 bg-primary/[0.06] p-1">
        <span className="absolute left-1 top-px pointer-events-none text-[8px] uppercase tracking-wide text-muted-foreground">margin</span>
        <input className="col-start-2 row-start-1 h-[18px] w-8 border-0 bg-transparent text-center text-[9px] text-foreground outline-none focus:bg-muted focus:outline-1 focus:outline-primary font-[inherit] placeholder:text-muted-foreground" value={get("marginTop")} onChange={(e) => set("marginTop", e.target.value)} placeholder="0" title="margin-top" />
        <input className="col-start-3 row-start-2 h-[18px] w-8 border-0 bg-transparent text-center text-[9px] text-foreground outline-none focus:bg-muted focus:outline-1 focus:outline-primary font-[inherit] placeholder:text-muted-foreground" value={get("marginRight")} onChange={(e) => set("marginRight", e.target.value)} placeholder="0" title="margin-right" />
        <input className="col-start-2 row-start-3 h-[18px] w-8 border-0 bg-transparent text-center text-[9px] text-foreground outline-none focus:bg-muted focus:outline-1 focus:outline-primary font-[inherit] placeholder:text-muted-foreground" value={get("marginBottom")} onChange={(e) => set("marginBottom", e.target.value)} placeholder="0" title="margin-bottom" />
        <input className="col-start-1 row-start-2 h-[18px] w-8 border-0 bg-transparent text-center text-[9px] text-foreground outline-none focus:bg-muted focus:outline-1 focus:outline-primary font-[inherit] placeholder:text-muted-foreground" value={get("marginLeft")} onChange={(e) => set("marginLeft", e.target.value)} placeholder="0" title="margin-left" />
        <div className="relative col-span-full row-start-2 grid w-full grid-cols-[1fr_auto_1fr] grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-[40px] border border-dashed border-green-500/20 bg-green-500/[0.06] p-1">
          <span className="absolute left-1 top-px pointer-events-none text-[8px] uppercase tracking-wide text-muted-foreground">padding</span>
          <input className="col-start-2 row-start-1 h-[18px] w-8 border-0 bg-transparent text-center text-[9px] text-foreground outline-none focus:bg-muted focus:outline-1 focus:outline-primary font-[inherit] placeholder:text-muted-foreground" value={get("paddingTop")} onChange={(e) => set("paddingTop", e.target.value)} placeholder="0" title="padding-top" />
          <input className="col-start-3 row-start-2 h-[18px] w-8 border-0 bg-transparent text-center text-[9px] text-foreground outline-none focus:bg-muted focus:outline-1 focus:outline-primary font-[inherit] placeholder:text-muted-foreground" value={get("paddingRight")} onChange={(e) => set("paddingRight", e.target.value)} placeholder="0" title="padding-right" />
          <input className="col-start-2 row-start-3 h-[18px] w-8 border-0 bg-transparent text-center text-[9px] text-foreground outline-none focus:bg-muted focus:outline-1 focus:outline-primary font-[inherit] placeholder:text-muted-foreground" value={get("paddingBottom")} onChange={(e) => set("paddingBottom", e.target.value)} placeholder="0" title="padding-bottom" />
          <input className="col-start-1 row-start-2 h-[18px] w-8 border-0 bg-transparent text-center text-[9px] text-foreground outline-none focus:bg-muted focus:outline-1 focus:outline-primary font-[inherit] placeholder:text-muted-foreground" value={get("paddingLeft")} onChange={(e) => set("paddingLeft", e.target.value)} placeholder="0" title="padding-left" />
          <div className="col-start-2 row-start-2 h-6 w-10 border border-border bg-muted" />
        </div>
      </div>
    </div>
  );
}

function SizeBox({ selected, onUpdate }: { selected: El; onUpdate: (el: El) => void }) {
  const s = selected.styles as Record<string, unknown>;
  const get = (p: string) => String(s[p] ?? "");
  const set = (p: string, v: string) => onUpdate({ ...selected, styles: { ...selected.styles, [p]: v } as CSSProperties });
  return (
    <div className="py-2">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-1">
          <Maximize size={10} className="shrink-0 text-muted-foreground" />
          <label className="min-w-3.5 shrink-0 text-[9px] text-muted-foreground">W</label>
          <input className="h-[22px] min-w-0 flex-1 border-0 border-b border-border bg-transparent px-1 text-[10px] text-foreground outline-none font-[inherit] focus:border-b-primary placeholder:text-muted-foreground" value={get("width")} onChange={(e) => set("width", e.target.value)} placeholder="auto" />
        </div>
        <span className="text-[10px] text-muted-foreground">x</span>
        <div className="flex flex-1 items-center gap-1">
          <label className="min-w-3.5 shrink-0 text-[9px] text-muted-foreground">H</label>
          <input className="h-[22px] min-w-0 flex-1 border-0 border-b border-border bg-transparent px-1 text-[10px] text-foreground outline-none font-[inherit] focus:border-b-primary placeholder:text-muted-foreground" value={get("height")} onChange={(e) => set("height", e.target.value)} placeholder="auto" />
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1"><label className="min-w-3.5 shrink-0 text-[9px] text-muted-foreground">Min W</label><input className="h-[22px] min-w-0 flex-1 border-0 border-b border-border bg-transparent px-1 text-[10px] text-foreground outline-none font-[inherit] focus:border-b-primary placeholder:text-muted-foreground" value={get("minWidth")} onChange={(e) => set("minWidth", e.target.value)} placeholder="—" /></div>
        <div className="flex items-center gap-1"><label className="min-w-3.5 shrink-0 text-[9px] text-muted-foreground">Max W</label><input className="h-[22px] min-w-0 flex-1 border-0 border-b border-border bg-transparent px-1 text-[10px] text-foreground outline-none font-[inherit] focus:border-b-primary placeholder:text-muted-foreground" value={get("maxWidth")} onChange={(e) => set("maxWidth", e.target.value)} placeholder="—" /></div>
        <div className="flex items-center gap-1"><label className="min-w-3.5 shrink-0 text-[9px] text-muted-foreground">Min H</label><input className="h-[22px] min-w-0 flex-1 border-0 border-b border-border bg-transparent px-1 text-[10px] text-foreground outline-none font-[inherit] focus:border-b-primary placeholder:text-muted-foreground" value={get("minHeight")} onChange={(e) => set("minHeight", e.target.value)} placeholder="—" /></div>
        <div className="flex items-center gap-1"><label className="min-w-3.5 shrink-0 text-[9px] text-muted-foreground">Max H</label><input className="h-[22px] min-w-0 flex-1 border-0 border-b border-border bg-transparent px-1 text-[10px] text-foreground outline-none font-[inherit] focus:border-b-primary placeholder:text-muted-foreground" value={get("maxHeight")} onChange={(e) => set("maxHeight", e.target.value)} placeholder="—" /></div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div><label className="mb-0.5 block text-[10px] capitalize text-muted-foreground">overflow</label>
          <Select value={get("overflow") || undefined} onValueChange={(v) => set("overflow", v)}><SelectTrigger className="h-6 text-[10px] px-2"><SelectValue placeholder="—" /></SelectTrigger><SelectContent>{selectOptions.overflow.map((o) => <SelectItem key={o} value={o} className="text-[11px]">{o}</SelectItem>)}</SelectContent></Select>
        </div>
        <div><label className="mb-0.5 block text-[10px] capitalize text-muted-foreground">object fit</label>
          <Select value={get("objectFit") || undefined} onValueChange={(v) => set("objectFit", v)}><SelectTrigger className="h-6 text-[10px] px-2"><SelectValue placeholder="—" /></SelectTrigger><SelectContent>{selectOptions.objectFit.map((o) => <SelectItem key={o} value={o} className="text-[11px]">{o}</SelectItem>)}</SelectContent></Select>
        </div>
      </div>
    </div>
  );
}

function BorderBox({ selected, onUpdate }: { selected: El; onUpdate: (el: El) => void }) {
  const s = selected.styles as Record<string, unknown>;
  const get = (p: string) => String(s[p] ?? "");
  const set = (p: string, v: string) => onUpdate({ ...selected, styles: { ...selected.styles, [p]: v } as CSSProperties });
  return (
    <div className="py-2">
      <div><label className="mb-0.5 block text-[10px] capitalize text-muted-foreground">style</label>
        <IconToggle value={get("borderStyle")} options={iconOptions.borderStyle} onChange={(v) => set("borderStyle", v)} />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="flex flex-1 items-center gap-1">
          <Frame size={10} className="shrink-0 text-muted-foreground" />
          <label className="min-w-3.5 shrink-0 text-[9px] text-muted-foreground">Width</label>
          <input className="h-[22px] min-w-0 flex-1 border-0 border-b border-border bg-transparent px-1 text-[10px] text-foreground outline-none font-[inherit] focus:border-b-primary placeholder:text-muted-foreground" value={get("borderWidth")} onChange={(e) => set("borderWidth", e.target.value)} placeholder="0" />
        </div>
        <div className="flex flex-1 items-center gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex h-[22px] w-full items-center gap-2 border border-border bg-muted px-2 hover:border-foreground cursor-pointer">
                <span className="size-3.5 shrink-0 border border-border" style={{ background: get("borderColor") || "transparent" }} />
                <span className="text-[9px] text-muted-foreground truncate">{get("borderColor") || "none"}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-3" side="left">
              <input type="color" value={get("borderColor") || "#000000"} onChange={(e) => set("borderColor", e.target.value)} style={{ width: "100%", height: 28, border: 0, cursor: "pointer", background: "transparent" }} />
              <Input value={get("borderColor")} onChange={(e) => set("borderColor", e.target.value)} className="h-6 text-[10px] mt-2" placeholder="#hex" />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="relative mt-2 grid grid-cols-[1fr_auto_1fr] grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-[50px] border border-dashed border-primary/20 bg-primary/[0.06] p-1">
        <span className="absolute left-1 top-px pointer-events-none text-[8px] uppercase tracking-wide text-muted-foreground">sides</span>
        <input className="col-start-2 row-start-1 h-[18px] w-8 border-0 bg-transparent text-center text-[9px] text-foreground outline-none focus:bg-muted focus:outline-1 focus:outline-primary font-[inherit] placeholder:text-muted-foreground" value={get("borderTop")} onChange={(e) => set("borderTop", e.target.value)} placeholder="—" title="border-top" />
        <input className="col-start-3 row-start-2 h-[18px] w-8 border-0 bg-transparent text-center text-[9px] text-foreground outline-none focus:bg-muted focus:outline-1 focus:outline-primary font-[inherit] placeholder:text-muted-foreground" value={get("borderRight")} onChange={(e) => set("borderRight", e.target.value)} placeholder="—" title="border-right" />
        <input className="col-start-2 row-start-3 h-[18px] w-8 border-0 bg-transparent text-center text-[9px] text-foreground outline-none focus:bg-muted focus:outline-1 focus:outline-primary font-[inherit] placeholder:text-muted-foreground" value={get("borderBottom")} onChange={(e) => set("borderBottom", e.target.value)} placeholder="—" title="border-bottom" />
        <input className="col-start-1 row-start-2 h-[18px] w-8 border-0 bg-transparent text-center text-[9px] text-foreground outline-none focus:bg-muted focus:outline-1 focus:outline-primary font-[inherit] placeholder:text-muted-foreground" value={get("borderLeft")} onChange={(e) => set("borderLeft", e.target.value)} placeholder="—" title="border-left" />
        <div className="col-start-2 row-start-2 h-6 w-10 border border-border bg-muted" />
      </div>
    </div>
  );
}

function PositionBox({ selected, onUpdate }: { selected: El; onUpdate: (el: El) => void }) {
  const s = selected.styles as Record<string, unknown>;
  const get = (p: string) => String(s[p] ?? "");
  const set = (p: string, v: string) => onUpdate({ ...selected, styles: { ...selected.styles, [p]: v } as CSSProperties });
  return (
    <div className="py-2">
      <div><label className="mb-0.5 block text-[10px] capitalize text-muted-foreground">position</label>
        <Select value={get("position") || undefined} onValueChange={(v) => set("position", v)}><SelectTrigger className="h-6 text-[10px] px-2"><SelectValue placeholder="static" /></SelectTrigger><SelectContent>{selectOptions.position.map((o) => <SelectItem key={o} value={o} className="text-[11px]">{o}</SelectItem>)}</SelectContent></Select>
      </div>
      <div className="relative mt-2 grid grid-cols-[1fr_auto_1fr] grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-[50px] border border-dashed border-primary/20 bg-primary/[0.04] p-1">
        <span className="absolute left-1 top-px pointer-events-none text-[8px] uppercase tracking-wide text-muted-foreground">offsets</span>
        <input className="col-start-2 row-start-1 h-[18px] w-8 border-0 bg-transparent text-center text-[9px] text-foreground outline-none focus:bg-muted focus:outline-1 focus:outline-primary font-[inherit] placeholder:text-muted-foreground" value={get("top")} onChange={(e) => set("top", e.target.value)} placeholder="—" title="top" />
        <input className="col-start-3 row-start-2 h-[18px] w-8 border-0 bg-transparent text-center text-[9px] text-foreground outline-none focus:bg-muted focus:outline-1 focus:outline-primary font-[inherit] placeholder:text-muted-foreground" value={get("right")} onChange={(e) => set("right", e.target.value)} placeholder="—" title="right" />
        <input className="col-start-2 row-start-3 h-[18px] w-8 border-0 bg-transparent text-center text-[9px] text-foreground outline-none focus:bg-muted focus:outline-1 focus:outline-primary font-[inherit] placeholder:text-muted-foreground" value={get("bottom")} onChange={(e) => set("bottom", e.target.value)} placeholder="—" title="bottom" />
        <input className="col-start-1 row-start-2 h-[18px] w-8 border-0 bg-transparent text-center text-[9px] text-foreground outline-none focus:bg-muted focus:outline-1 focus:outline-primary font-[inherit] placeholder:text-muted-foreground" value={get("left")} onChange={(e) => set("left", e.target.value)} placeholder="—" title="left" />
        <div className="col-start-2 row-start-2 h-6 w-10 border border-border bg-muted">
          <Move size={10} style={{ margin: "auto", display: "block", opacity: 0.3, marginTop: 6 }} />
        </div>
      </div>
      <div className="mt-2">
        <div className="flex flex-1 items-center gap-1">
          <Layers size={10} className="shrink-0 text-muted-foreground" />
          <label className="min-w-3.5 shrink-0 text-[9px] text-muted-foreground">z-index</label>
          <input className="h-[22px] min-w-0 flex-1 border-0 border-b border-border bg-transparent px-1 text-[10px] text-foreground outline-none font-[inherit] focus:border-b-primary placeholder:text-muted-foreground" value={get("zIndex")} onChange={(e) => set("zIndex", e.target.value)} placeholder="auto" />
        </div>
      </div>
    </div>
  );
}

export default function SettingsTab() {
  const { state, dispatch } = useEditor();
  const selected = state.editor.selected;
  const [propsTab, setPropsTab] = useState<"design" | "content">("design");

  if (!selected) return null;

  const onUpdate = (el: El) => dispatch({ type: "UPDATE_ELEMENT", payload: { element: el } });
  const onDuplicate = () => {
    if (selected.type === "__body") return;
    const parentId = findParentId(state.editor.elements, selected.id);
    if (!parentId) return;
    dispatch({ type: "DUPLICATE_ELEMENT", payload: { elId: selected.id, containerId: parentId } });
  };
  const onDelete = (id: string) => dispatch({ type: "DELETE_ELEMENT", payload: { id } });

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-1.5 border-b border-sidebar-border px-3 py-2">
        <Pencil size={11} className="shrink-0 text-muted-foreground" />
        <input
          className="h-7 min-w-0 flex-1 rounded border border-sidebar-border bg-transparent px-2 text-xs outline-none focus:border-primary"
          value={selected.name}
          onChange={(e) => onUpdate({ ...selected, name: e.target.value })}
        />
        <Badge variant="outline" className="shrink-0 px-1.5 py-0 text-[9px] h-4">{selected.type}</Badge>
      </div>

      {/* Actions */}
      <TooltipProvider delayDuration={200}>
        <div className="flex gap-1 border-b border-sidebar-border px-3 py-1.5">
          <Tooltip><TooltipTrigger asChild>
            <Button variant="outline" size="icon" className="size-7" onClick={onDuplicate}><Copy size={13} /></Button>
          </TooltipTrigger><TooltipContent side="bottom" className="text-[10px]">Duplicate (Cmd+D)</TooltipContent></Tooltip>
          {selected.type !== "__body" && (
            <Tooltip><TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive hover:border-destructive" onClick={() => onDelete(selected.id)}>
                <Trash2 size={13} />
              </Button>
            </TooltipTrigger><TooltipContent side="bottom" className="text-[10px]">Delete</TooltipContent></Tooltip>
          )}
        </div>
      </TooltipProvider>

      {/* Tabs */}
      <Tabs defaultValue="design" value={propsTab} onValueChange={(v) => setPropsTab(v as "design" | "content")} className="flex flex-1 flex-col min-h-0">
        <TabsList className="w-full rounded-none border-b h-8 bg-transparent p-0">
          <TabsTrigger value="design" className="flex-1 rounded-none h-full text-xs data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary gap-1"><Star size={11} /> Design</TabsTrigger>
          <TabsTrigger value="content" className="flex-1 rounded-none h-full text-xs data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary gap-1"><Type size={11} /> Content</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="flex-1 overflow-y-auto mt-0 p-3">
          {!Array.isArray(selected.content) ? (
            Object.entries(selected.content as Record<string, string>).map(([key, val]) => (
              <div key={key} className="mb-3">
                <label className="mb-1 block text-[10px] font-medium text-muted-foreground">{key}</label>
                {key === "innerText" ? (
                  <textarea value={val} onChange={(e) => onUpdate({ ...selected, content: { ...(selected.content as Record<string, string>), [key]: e.target.value } })} className="w-full border-0 border-b border-border bg-muted p-2 text-xs leading-relaxed text-foreground outline-none resize-y font-[inherit] focus:border-b-primary" rows={3} />
                ) : (
                  <Input value={val} onChange={(e) => onUpdate({ ...selected, content: { ...(selected.content as Record<string, string>), [key]: e.target.value } })} className="h-7 text-xs" />
                )}
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-muted-foreground">Container element — drag child elements from the sidebar.</div>
          )}
        </TabsContent>

        <TabsContent value="design" className="flex-1 overflow-y-auto mt-0 p-3">
          {propGroups.map((g) => (
            <PropGroup key={g.title} title={g.title} icon={g.icon} props={g.props} selected={selected} onUpdate={onUpdate} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}