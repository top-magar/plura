"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import {
  Type, ChevronRight, ChevronDown,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd,
  AlignHorizontalJustifyStart, AlignHorizontalSpaceBetween, AlignHorizontalSpaceAround,
  AlignVerticalJustifyCenter, AlignVerticalJustifyStart, AlignVerticalJustifyEnd,
  ChevronsLeftRight,
  ArrowRight, ArrowDown, ArrowLeft, ArrowUp,
  WrapText,
  Italic, Underline, Strikethrough,
  CaseUpper, CaseLower, CaseSensitive,
  Minus, Minus as MinusIcon, SquareDashed, SeparatorHorizontal,
  BoxSelect, Scan, Palette, Radius, LayoutGrid, Move, Sparkles, Layers, Space,
  Pencil, Copy, Trash2, Star,
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
import type { El } from "../types";
import { useEditor } from "../editor-provider";
import { findParentId } from "../tree-helpers";

// ── Shared ──────────────────────────────────────────────

const selectOptions: Record<string, string[]> = {
  display: ["block", "flex", "grid", "inline", "inline-block", "none"],
  overflow: ["visible", "hidden", "auto", "scroll"],
  position: ["static", "relative", "absolute", "fixed", "sticky"],
  cursor: ["default", "pointer", "text", "move", "not-allowed"],
  borderStyle: ["none", "solid", "dashed", "dotted"],
  backgroundSize: ["auto", "cover", "contain"],
  backgroundPosition: ["center", "top", "bottom", "left", "right"],
  backgroundRepeat: ["no-repeat", "repeat", "repeat-x", "repeat-y"],
  objectFit: ["fill", "contain", "cover", "none"],
};

type IconOpt = { value: string; label: string; icon: ReactNode };

function IconToggle({ value, options, onChange }: { value: string; options: IconOpt[]; onChange: (v: string) => void }) {
  return (
    <TooltipProvider delayDuration={200}>
      <ToggleGroup type="single" value={value} onValueChange={(v) => { if (v) onChange(v); }} className="flex w-full gap-px rounded-md overflow-hidden border border-sidebar-border">
        {options.map((o) => (
          <Tooltip key={o.value}>
            <TooltipTrigger asChild>
              <ToggleGroupItem value={o.value} className="flex h-7 min-w-0 flex-1 items-center justify-center rounded-none border-0 bg-sidebar p-0 text-sidebar-foreground/60 transition-colors hover:text-sidebar-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground" aria-label={o.label}>
                {o.icon}
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-[10px] px-2 py-0.5">{o.label}</TooltipContent>
          </Tooltip>
        ))}
      </ToggleGroup>
    </TooltipProvider>
  );
}

function Section({ title, icon: Icon, defaultOpen = true, children }: { title: string; icon: React.ComponentType<{ size?: number }>; defaultOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border-b border-sidebar-border">
      <CollapsibleTrigger className="flex w-full items-center gap-1.5 bg-transparent px-3 py-2 text-[11px] font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground cursor-pointer">
        {open ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
        <Icon size={12} />
        {title}
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-0.5 block text-[10px] text-sidebar-foreground/50">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex h-7 w-full items-center gap-2 rounded-md border border-sidebar-border bg-sidebar px-2 hover:border-sidebar-foreground/30 cursor-pointer">
            <span className="size-3.5 shrink-0 rounded-sm border border-sidebar-border" style={{ background: value || "transparent" }} />
            <span className="text-[10px] text-sidebar-foreground/60 truncate">{value || "none"}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-52 p-3" side="left" align="start">
          <input type="color" value={value || "#000000"} onChange={(e) => onChange(e.target.value)} className="w-full h-8 border-0 cursor-pointer bg-transparent" />
          <div className="grid grid-cols-8 gap-1 mt-2">
            {["#000000","#ffffff","#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#6366f1","#8b5cf6","#ec4899","#14b8a6","#64748b","#1e293b","#f1f5f9","#fef2f2","#fefce8"].map((c) => (
              <button key={c} onClick={() => onChange(c)} className="size-5 rounded-sm border border-sidebar-border cursor-pointer" style={{ background: c }} />
            ))}
          </div>
          <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-6 text-[10px] mt-2" placeholder="#hex" />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-0.5 block text-[10px] text-sidebar-foreground/50">{label}</label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-7 text-xs" placeholder={placeholder} />
    </div>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-0.5 block text-[10px] text-sidebar-foreground/50">{label}</label>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger className="h-7 text-xs px-2"><SelectValue placeholder="—" /></SelectTrigger>
        <SelectContent>{options.map((o) => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

// ── 4-side box input ────────────────────────────────────

function FourSideInput({ label, color, props, get, set, icon }: { label: string; color: string; props: [string, string, string, string]; get: (p: string) => string; set: (p: string, v: string) => void; icon?: ReactNode }) {
  const inputCls = "h-7 w-full border border-sidebar-border rounded-md bg-transparent text-center text-[10px] outline-none focus:border-primary";
  return (
    <div>
      <label className="mb-1 flex items-center gap-1 text-[10px] text-sidebar-foreground/50">{icon}{label}</label>
      <div className={`relative grid grid-cols-[1fr_auto_1fr] grid-rows-[auto_1fr_auto] items-center justify-items-center gap-1 rounded-md border border-dashed p-2 ${color}`}>
        <input className={`col-start-2 row-start-1 ${inputCls}`} value={get(props[0])} onChange={(e) => set(props[0], e.target.value)} placeholder="↑" title={props[0]} />
        <input className={`col-start-3 row-start-2 ${inputCls}`} value={get(props[1])} onChange={(e) => set(props[1], e.target.value)} placeholder="→" title={props[1]} />
        <input className={`col-start-2 row-start-3 ${inputCls}`} value={get(props[2])} onChange={(e) => set(props[2], e.target.value)} placeholder="↓" title={props[2]} />
        <input className={`col-start-1 row-start-2 ${inputCls}`} value={get(props[3])} onChange={(e) => set(props[3], e.target.value)} placeholder="←" title={props[3]} />
        <div className="col-start-2 row-start-2 size-6 rounded-sm border border-sidebar-border bg-sidebar" />
      </div>
    </div>
  );
}

// ── Icon option sets ────────────────────────────────────

const textAlignOpts: IconOpt[] = [
  { value: "left", label: "Left", icon: <AlignLeft size={14} /> },
  { value: "center", label: "Center", icon: <AlignCenter size={14} /> },
  { value: "right", label: "Right", icon: <AlignRight size={14} /> },
  { value: "justify", label: "Justify", icon: <AlignJustify size={14} /> },
];
const fontStyleOpts: IconOpt[] = [
  { value: "normal", label: "Normal", icon: <Type size={14} /> },
  { value: "italic", label: "Italic", icon: <Italic size={14} /> },
];
const textDecoOpts: IconOpt[] = [
  { value: "none", label: "None", icon: <Type size={14} /> },
  { value: "underline", label: "Underline", icon: <Underline size={14} /> },
  { value: "line-through", label: "Strike", icon: <Strikethrough size={14} /> },
];
const textTransOpts: IconOpt[] = [
  { value: "none", label: "None", icon: <MinusIcon size={14} /> },
  { value: "uppercase", label: "Upper", icon: <CaseUpper size={14} /> },
  { value: "lowercase", label: "Lower", icon: <CaseLower size={14} /> },
  { value: "capitalize", label: "Cap", icon: <CaseSensitive size={14} /> },
];
const justifyOpts: IconOpt[] = [
  { value: "flex-start", label: "Start", icon: <AlignHorizontalJustifyStart size={14} /> },
  { value: "center", label: "Center", icon: <AlignHorizontalJustifyCenter size={14} /> },
  { value: "flex-end", label: "End", icon: <AlignHorizontalJustifyEnd size={14} /> },
  { value: "space-between", label: "Between", icon: <AlignHorizontalSpaceBetween size={14} /> },
  { value: "space-around", label: "Around", icon: <AlignHorizontalSpaceAround size={14} /> },
];
const alignOpts: IconOpt[] = [
  { value: "flex-start", label: "Start", icon: <AlignVerticalJustifyStart size={14} /> },
  { value: "center", label: "Center", icon: <AlignVerticalJustifyCenter size={14} /> },
  { value: "flex-end", label: "End", icon: <AlignVerticalJustifyEnd size={14} /> },
  { value: "stretch", label: "Stretch", icon: <ChevronsLeftRight size={14} className="rotate-90" /> },
];
const directionOpts: IconOpt[] = [
  { value: "row", label: "Row", icon: <ArrowRight size={14} /> },
  { value: "column", label: "Column", icon: <ArrowDown size={14} /> },
  { value: "row-reverse", label: "Row Rev", icon: <ArrowLeft size={14} /> },
  { value: "column-reverse", label: "Col Rev", icon: <ArrowUp size={14} /> },
];
const wrapOpts: IconOpt[] = [
  { value: "nowrap", label: "No Wrap", icon: <ArrowRight size={14} /> },
  { value: "wrap", label: "Wrap", icon: <WrapText size={14} /> },
];
const borderStyleOpts: IconOpt[] = [
  { value: "none", label: "None", icon: <MinusIcon size={14} /> },
  { value: "solid", label: "Solid", icon: <Minus size={14} /> },
  { value: "dashed", label: "Dashed", icon: <SquareDashed size={14} /> },
];

// ── Main component ──────────────────────────────────────

export default function SettingsTab() {
  const { state, dispatch } = useEditor();
  const selected = state.editor.selected;
  const [propsTab, setPropsTab] = useState<"design" | "content">("design");

  if (!selected) return null;

  const s = selected.styles as Record<string, unknown>;
  const get = (p: string) => String(s[p] ?? "");
  const set = (p: string, v: string) => dispatch({ type: "UPDATE_ELEMENT", payload: { element: { ...selected, styles: { ...selected.styles, [p]: v } as CSSProperties } } });
  const onUpdate = (el: El) => dispatch({ type: "UPDATE_ELEMENT", payload: { element: el } });

  const onDuplicate = () => {
    if (selected.type === "__body") return;
    const parentId = findParentId(state.editor.elements, selected.id);
    if (!parentId) return;
    dispatch({ type: "DUPLICATE_ELEMENT", payload: { elId: selected.id, containerId: parentId } });
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-1.5 border-b border-sidebar-border px-3 py-2">
        <Pencil size={11} className="shrink-0 text-sidebar-foreground/50" />
        <input className="h-7 min-w-0 flex-1 rounded-md border border-sidebar-border bg-transparent px-2 text-xs outline-none focus:border-primary" value={selected.name} onChange={(e) => onUpdate({ ...selected, name: e.target.value })} />
        <Badge variant="outline" className="shrink-0 px-1.5 py-0 text-[9px] h-4">{selected.type}</Badge>
      </div>

      {/* Actions */}
      <TooltipProvider delayDuration={200}>
        <div className="flex gap-1 border-b border-sidebar-border px-3 py-1.5">
          <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" className="size-7" onClick={onDuplicate}><Copy size={13} /></Button></TooltipTrigger><TooltipContent side="bottom" className="text-[10px]">Duplicate</TooltipContent></Tooltip>
          {selected.type !== "__body" && (
            <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive hover:border-destructive" onClick={() => dispatch({ type: "DELETE_ELEMENT", payload: { id: selected.id } })}><Trash2 size={13} /></Button></TooltipTrigger><TooltipContent side="bottom" className="text-[10px]">Delete</TooltipContent></Tooltip>
          )}
        </div>
      </TooltipProvider>

      {/* Tabs */}
      <Tabs value={propsTab} onValueChange={(v) => setPropsTab(v as "design" | "content")} className="flex flex-1 flex-col min-h-0">
        <TabsList className="w-full rounded-none border-b border-sidebar-border h-8 bg-transparent p-0">
          <TabsTrigger value="design" className="flex-1 rounded-none h-full text-xs data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary gap-1"><Star size={11} /> Design</TabsTrigger>
          <TabsTrigger value="content" className="flex-1 rounded-none h-full text-xs data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary gap-1"><Type size={11} /> Content</TabsTrigger>
        </TabsList>

        {/* Content tab */}
        <TabsContent value="content" className="flex-1 overflow-y-auto mt-0 p-3">
          {!Array.isArray(selected.content) ? (
            Object.entries(selected.content as Record<string, string>).map(([key, val]) => (
              <div key={key} className="mb-3">
                <label className="mb-1 block text-[10px] font-medium text-sidebar-foreground/50">{key}</label>
                {key === "innerText" ? (
                  <textarea value={val} onChange={(e) => onUpdate({ ...selected, content: { ...(selected.content as Record<string, string>), [key]: e.target.value } })} className="w-full rounded-md border border-sidebar-border bg-transparent p-2 text-xs outline-none resize-y focus:border-primary min-h-[60px]" rows={3} />
                ) : (
                  <Input value={val} onChange={(e) => onUpdate({ ...selected, content: { ...(selected.content as Record<string, string>), [key]: e.target.value } })} className="h-7 text-xs" />
                )}
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-sidebar-foreground/50">Container — drag children from sidebar.</div>
          )}
        </TabsContent>

        {/* Design tab */}
        <TabsContent value="design" className="flex-1 overflow-y-auto mt-0">

          {/* Custom */}
          {!Array.isArray(selected.content) && Object.keys(selected.content as Record<string, string>).some((k) => k === "href" || k === "src") && (
            <Section title="Custom" icon={Pencil}>
              {(selected.content as Record<string, string>).href !== undefined && (
                <Field label="Link URL" value={(selected.content as Record<string, string>).href ?? ""} onChange={(v) => onUpdate({ ...selected, content: { ...(selected.content as Record<string, string>), href: v } })} placeholder="https://..." />
              )}
              {(selected.content as Record<string, string>).src !== undefined && (
                <Field label="Source URL" value={(selected.content as Record<string, string>).src ?? ""} onChange={(v) => onUpdate({ ...selected, content: { ...(selected.content as Record<string, string>), src: v } })} placeholder="https://..." />
              )}
            </Section>
          )}

          {/* Typography */}
          <Section title="Typography" icon={Type}>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-1.5">
                <Field label="Font Size" value={get("fontSize")} onChange={(v) => set("fontSize", v)} placeholder="16px" />
                <Field label="Weight" value={get("fontWeight")} onChange={(v) => set("fontWeight", v)} placeholder="400" />
                <Field label="Line Height" value={get("lineHeight")} onChange={(v) => set("lineHeight", v)} placeholder="1.5" />
                <Field label="Letter Spacing" value={get("letterSpacing")} onChange={(v) => set("letterSpacing", v)} placeholder="0px" />
              </div>
              <ColorField label="Color" value={get("color")} onChange={(v) => set("color", v)} />
              <div>
                <label className="mb-0.5 block text-[10px] text-sidebar-foreground/50">Text Align</label>
                <IconToggle value={get("textAlign")} options={textAlignOpts} onChange={(v) => set("textAlign", v)} />
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className="mb-0.5 block text-[10px] text-sidebar-foreground/50">Style</label>
                  <IconToggle value={get("fontStyle")} options={fontStyleOpts} onChange={(v) => set("fontStyle", v)} />
                </div>
                <div>
                  <label className="mb-0.5 block text-[10px] text-sidebar-foreground/50">Decoration</label>
                  <IconToggle value={get("textDecoration")} options={textDecoOpts} onChange={(v) => set("textDecoration", v)} />
                </div>
              </div>
              <div>
                <label className="mb-0.5 block text-[10px] text-sidebar-foreground/50">Transform</label>
                <IconToggle value={get("textTransform")} options={textTransOpts} onChange={(v) => set("textTransform", v)} />
              </div>
            </div>
          </Section>

          {/* Dimensions */}
          <Section title="Dimensions" icon={Scan}>
            <div className="space-y-3">
              {/* W × H */}
              <div className="flex items-end gap-1.5">
                <div className="flex-1">
                  <label className="mb-0.5 block text-[10px] text-sidebar-foreground/50">W</label>
                  <Input value={get("width")} onChange={(e) => set("width", e.target.value)} className="h-7 text-xs text-center" placeholder="auto" />
                </div>
                <span className="pb-1.5 text-[10px] text-sidebar-foreground/30">×</span>
                <div className="flex-1">
                  <label className="mb-0.5 block text-[10px] text-sidebar-foreground/50">H</label>
                  <Input value={get("height")} onChange={(e) => set("height", e.target.value)} className="h-7 text-xs text-center" placeholder="auto" />
                </div>
              </div>

              {/* Min / Max */}
              <div className="grid grid-cols-4 gap-1">
                {(["minWidth", "maxWidth", "minHeight", "maxHeight"] as const).map((p) => (
                  <div key={p}>
                    <label className="mb-0.5 block text-[8px] text-sidebar-foreground/40 truncate">{p.replace("min", "Min ").replace("max", "Max ").replace("Width", "W").replace("Height", "H")}</label>
                    <Input value={get(p)} onChange={(e) => set(p, e.target.value)} className="h-6 text-[10px] text-center px-1" placeholder="—" />
                  </div>
                ))}
              </div>

              {/* Visual Box Model: Margin → Padding → Element */}
              <div className="relative rounded-md border border-dashed border-primary/30 bg-primary/[0.03] p-1">
                <span className="absolute left-1.5 top-0.5 text-[7px] font-medium uppercase tracking-wider text-primary/40">margin</span>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center justify-items-center gap-px pt-3">
                  <div />
                  <input className="h-5 w-10 rounded border border-sidebar-border bg-transparent text-center text-[9px] outline-none focus:border-primary" value={get("marginTop")} onChange={(e) => set("marginTop", e.target.value)} placeholder="0" />
                  <div />
                  <input className="h-5 w-10 rounded border border-sidebar-border bg-transparent text-center text-[9px] outline-none focus:border-primary justify-self-end" value={get("marginLeft")} onChange={(e) => set("marginLeft", e.target.value)} placeholder="0" />

                  {/* Padding box nested inside */}
                  <div className="relative rounded border border-dashed border-emerald-500/30 bg-emerald-500/[0.03] p-1 w-full">
                    <span className="absolute left-1 top-0 text-[7px] font-medium uppercase tracking-wider text-emerald-500/40">pad</span>
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center justify-items-center gap-px pt-2.5">
                      <div />
                      <input className="h-5 w-10 rounded border border-sidebar-border bg-transparent text-center text-[9px] outline-none focus:border-emerald-500" value={get("paddingTop")} onChange={(e) => set("paddingTop", e.target.value)} placeholder="0" />
                      <div />
                      <input className="h-5 w-10 rounded border border-sidebar-border bg-transparent text-center text-[9px] outline-none focus:border-emerald-500 justify-self-end" value={get("paddingLeft")} onChange={(e) => set("paddingLeft", e.target.value)} placeholder="0" />
                      <div className="size-6 rounded-sm bg-sidebar-accent/50 border border-sidebar-border" />
                      <input className="h-5 w-10 rounded border border-sidebar-border bg-transparent text-center text-[9px] outline-none focus:border-emerald-500 justify-self-start" value={get("paddingRight")} onChange={(e) => set("paddingRight", e.target.value)} placeholder="0" />
                      <div />
                      <input className="h-5 w-10 rounded border border-sidebar-border bg-transparent text-center text-[9px] outline-none focus:border-emerald-500" value={get("paddingBottom")} onChange={(e) => set("paddingBottom", e.target.value)} placeholder="0" />
                      <div />
                    </div>
                  </div>

                  <input className="h-5 w-10 rounded border border-sidebar-border bg-transparent text-center text-[9px] outline-none focus:border-primary justify-self-start" value={get("marginRight")} onChange={(e) => set("marginRight", e.target.value)} placeholder="0" />
                  <div />
                  <input className="h-5 w-10 rounded border border-sidebar-border bg-transparent text-center text-[9px] outline-none focus:border-primary" value={get("marginBottom")} onChange={(e) => set("marginBottom", e.target.value)} placeholder="0" />
                  <div />
                </div>
              </div>

              {/* Overflow / Object Fit */}
              <div className="grid grid-cols-2 gap-1.5">
                <SelectField label="Overflow" value={get("overflow")} options={selectOptions.overflow} onChange={(v) => set("overflow", v)} />
                <SelectField label="Object Fit" value={get("objectFit")} options={selectOptions.objectFit} onChange={(v) => set("objectFit", v)} />
              </div>
            </div>
          </Section>

          {/* Decorations */}
          <Section title="Decorations" icon={Radius}>
            <div className="space-y-2">
              <ColorField label="Background" value={get("backgroundColor")} onChange={(v) => set("backgroundColor", v)} />
              <Field label="Background Image" value={get("backgroundImage")} onChange={(v) => set("backgroundImage", v)} placeholder="url()" />
              <div className="grid grid-cols-2 gap-1.5">
                <SelectField label="BG Size" value={get("backgroundSize")} options={selectOptions.backgroundSize} onChange={(v) => set("backgroundSize", v)} />
                <SelectField label="BG Position" value={get("backgroundPosition")} options={selectOptions.backgroundPosition} onChange={(v) => set("backgroundPosition", v)} />
              </div>
              <div>
                <label className="mb-0.5 block text-[10px] text-sidebar-foreground/50">Border Style</label>
                <IconToggle value={get("borderStyle")} options={borderStyleOpts} onChange={(v) => set("borderStyle", v)} />
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <Field label="Border Width" value={get("borderWidth")} onChange={(v) => set("borderWidth", v)} placeholder="0px" />
                <ColorField label="Border Color" value={get("borderColor")} onChange={(v) => set("borderColor", v)} />
              </div>
              <Field label="Border Radius" value={get("borderRadius")} onChange={(v) => set("borderRadius", v)} placeholder="0px" />
              <div>
                <label className="mb-0.5 block text-[10px] text-sidebar-foreground/50">Opacity</label>
                <div className="flex items-center gap-2">
                  <Slider value={[parseFloat(get("opacity") || "1")]} min={0} max={1} step={0.05} onValueChange={([v]) => set("opacity", String(v))} className="flex-1" />
                  <span className="text-[10px] w-6 text-right text-sidebar-foreground/50">{get("opacity") || "1"}</span>
                </div>
              </div>
              <Field label="Box Shadow" value={get("boxShadow")} onChange={(v) => set("boxShadow", v)} placeholder="0 2px 4px rgba(0,0,0,.1)" />
            </div>
          </Section>

          {/* Flexbox */}
          <Section title="Flexbox" icon={LayoutGrid}>
            <div className="space-y-2">
              <SelectField label="Display" value={get("display")} options={selectOptions.display} onChange={(v) => set("display", v)} />
              <div>
                <label className="mb-0.5 block text-[10px] text-sidebar-foreground/50">Direction</label>
                <IconToggle value={get("flexDirection")} options={directionOpts} onChange={(v) => set("flexDirection", v)} />
              </div>
              <div>
                <label className="mb-0.5 block text-[10px] text-sidebar-foreground/50">Justify Content</label>
                <IconToggle value={get("justifyContent")} options={justifyOpts} onChange={(v) => set("justifyContent", v)} />
              </div>
              <div>
                <label className="mb-0.5 block text-[10px] text-sidebar-foreground/50">Align Items</label>
                <IconToggle value={get("alignItems")} options={alignOpts} onChange={(v) => set("alignItems", v)} />
              </div>
              <div>
                <label className="mb-0.5 block text-[10px] text-sidebar-foreground/50">Wrap</label>
                <IconToggle value={get("flexWrap")} options={wrapOpts} onChange={(v) => set("flexWrap", v)} />
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <Field label="Gap" value={get("gap")} onChange={(v) => set("gap", v)} placeholder="0px" />
                <Field label="Flex" value={get("flex")} onChange={(v) => set("flex", v)} placeholder="none" />
              </div>
            </div>
          </Section>

          {/* Position */}
          <Section title="Position" icon={Move} defaultOpen={false}>
            <div className="space-y-2">
              <SelectField label="Position" value={get("position")} options={selectOptions.position} onChange={(v) => set("position", v)} />
              <FourSideInput label="Offsets" color="border-sidebar-border bg-sidebar" props={["top", "right", "bottom", "left"]} get={get} set={set} />
              <Field label="Z-Index" value={get("zIndex")} onChange={(v) => set("zIndex", v)} placeholder="auto" />
            </div>
          </Section>

          {/* Effects */}
          <Section title="Effects" icon={Sparkles} defaultOpen={false}>
            <div className="space-y-2">
              <SelectField label="Cursor" value={get("cursor")} options={selectOptions.cursor} onChange={(v) => set("cursor", v)} />
              <Field label="Transition" value={get("transition")} onChange={(v) => set("transition", v)} placeholder="all 0.2s" />
            </div>
          </Section>

        </TabsContent>
      </Tabs>
    </div>
  );
}
