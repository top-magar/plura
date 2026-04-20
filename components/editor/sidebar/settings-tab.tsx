"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { MIcon } from "../m-icon";
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
import { cn } from "@/lib/utils";
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

function Section({ title, icon, defaultOpen = true, children }: { title: string; icon: string; defaultOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border-b border-sidebar-border">
      <CollapsibleTrigger className="flex w-full items-center gap-1.5 bg-transparent px-3 py-2 text-[11px] font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground cursor-pointer">
        <MIcon name={open ? "expand_more" : "chevron_right"} size={12} />
        <MIcon name={icon} size={14} />
        {title}
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [saved, setSaved] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('editor-palette') ?? '[]'); } catch { return []; }
  });
  const saveColor = () => {
    if (!value || saved.includes(value)) return;
    const next = [value, ...saved].slice(0, 16);
    setSaved(next);
    localStorage.setItem('editor-palette', JSON.stringify(next));
  };
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
              <button key={c} onClick={() => onChange(c)} className="size-5 rounded-sm border border-sidebar-border cursor-pointer hover:scale-110 transition-transform" style={{ background: c }} />
            ))}
          </div>
          {saved.length > 0 && (
            <div className="mt-2 pt-2 border-t border-sidebar-border">
              <span className="text-[9px] text-sidebar-foreground/40 mb-1 block">Saved</span>
              <div className="grid grid-cols-8 gap-1">
                {saved.map((c) => (
                  <button key={c} onClick={() => onChange(c)} className="size-5 rounded-sm border border-sidebar-border cursor-pointer hover:scale-110 transition-transform" style={{ background: c }} />
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-1 mt-2">
            <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-6 text-[10px] flex-1" placeholder="#hex" />
            <button onClick={saveColor} className="h-6 px-2 rounded border border-sidebar-border text-[9px] text-sidebar-foreground/60 hover:bg-sidebar-accent transition-colors">+</button>
          </div>
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
  { value: "left", label: "Left", icon: <MIcon name="format_align_left" /> },
  { value: "center", label: "Center", icon: <MIcon name="format_align_center" /> },
  { value: "right", label: "Right", icon: <MIcon name="format_align_right" /> },
  { value: "justify", label: "Justify", icon: <MIcon name="format_align_justify" /> },
];
const fontStyleOpts: IconOpt[] = [
  { value: "normal", label: "Normal", icon: <MIcon name="text_fields" /> },
  { value: "italic", label: "Italic", icon: <MIcon name="format_italic" /> },
];
const textDecoOpts: IconOpt[] = [
  { value: "none", label: "None", icon: <MIcon name="text_fields" /> },
  { value: "underline", label: "Underline", icon: <MIcon name="format_underlined" /> },
  { value: "line-through", label: "Strike", icon: <MIcon name="format_strikethrough" /> },
];
const textTransOpts: IconOpt[] = [
  { value: "none", label: "None", icon: <MIcon name="horizontal_rule" /> },
  { value: "uppercase", label: "Upper", icon: <MIcon name="title" /> },
  { value: "lowercase", label: "Lower", icon: <MIcon name="text_fields" /> },
  { value: "capitalize", label: "Cap", icon: <MIcon name="format_size" /> },
];
const justifyOpts: IconOpt[] = [
  { value: "flex-start", label: "Start", icon: <MIcon name="align_horizontal_left" /> },
  { value: "center", label: "Center", icon: <MIcon name="align_horizontal_center" /> },
  { value: "flex-end", label: "End", icon: <MIcon name="align_horizontal_right" /> },
  { value: "space-between", label: "Between", icon: <MIcon name="horizontal_distribute" /> },
  { value: "space-around", label: "Around", icon: <MIcon name="horizontal_distribute" /> },
];
const alignOpts: IconOpt[] = [
  { value: "flex-start", label: "Start", icon: <MIcon name="align_vertical_top" /> },
  { value: "center", label: "Center", icon: <MIcon name="align_vertical_center" /> },
  { value: "flex-end", label: "End", icon: <MIcon name="align_vertical_bottom" /> },
  { value: "stretch", label: "Stretch", icon: <MIcon name="expand" /> },
];
const directionOpts: IconOpt[] = [
  { value: "row", label: "Row", icon: <MIcon name="arrow_forward" /> },
  { value: "column", label: "Column", icon: <MIcon name="arrow_downward" /> },
  { value: "row-reverse", label: "Row Rev", icon: <MIcon name="arrow_back" /> },
  { value: "column-reverse", label: "Col Rev", icon: <MIcon name="arrow_upward" /> },
];
const wrapOpts: IconOpt[] = [
  { value: "nowrap", label: "No Wrap", icon: <MIcon name="arrow_forward" /> },
  { value: "wrap", label: "Wrap", icon: <MIcon name="wrap_text" /> },
];
const borderStyleOpts: IconOpt[] = [
  { value: "none", label: "None", icon: <MIcon name="horizontal_rule" /> },
  { value: "solid", label: "Solid", icon: <MIcon name="remove" /> },
  { value: "dashed", label: "Dashed", icon: <MIcon name="line_style" /> },
];

// ── Main component ──────────────────────────────────────

function ItemsEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items: { title: string; body: string }[] = (() => { try { return JSON.parse(value || "[]"); } catch { return []; } })();
  const update = (idx: number, field: "title" | "body", v: string) => {
    const next = items.map((item, i) => i === idx ? { ...item, [field]: v } : item);
    onChange(JSON.stringify(next));
  };
  const add = () => onChange(JSON.stringify([...items, { title: "New Item", body: "Content here" }]));
  const remove = (idx: number) => onChange(JSON.stringify(items.filter((_, i) => i !== idx)));

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="rounded-md border border-sidebar-border p-2 space-y-1">
          <div className="flex items-center gap-1">
            <Input value={item.title} onChange={(e) => update(i, "title", e.target.value)} className="h-6 text-[10px] flex-1" placeholder="Title" />
            <button onClick={() => remove(i)} className="text-[10px] text-destructive hover:underline shrink-0 px-1">×</button>
          </div>
          <textarea value={item.body} onChange={(e) => update(i, "body", e.target.value)} className="w-full rounded border border-sidebar-border bg-transparent p-1.5 text-[10px] outline-none resize-y focus:border-primary min-h-[32px]" rows={2} placeholder="Content" />
        </div>
      ))}
      <button onClick={add} className="w-full rounded-md border border-dashed border-sidebar-border py-1 text-[10px] text-sidebar-foreground/50 hover:border-primary hover:text-primary transition-colors">
        + Add Item
      </button>
    </div>
  );
}

export default function SettingsTab() {
  const { state, dispatch } = useEditor();
  const selected = state.editor.selected;
  const [propsTab, setPropsTab] = useState<"design" | "content">("design");

  if (!selected) return null;

  const device = state.editor.device;
  const resolved = device === "Desktop" ? selected.styles : { ...selected.styles, ...selected.responsiveStyles?.[device] };
  const s = resolved as Record<string, unknown>;
  const get = (p: string) => String(s[p] ?? "");
  const set = (p: string, v: string) => {
    if (device === "Desktop") {
      dispatch({ type: "UPDATE_ELEMENT", payload: { element: { ...selected, styles: { ...selected.styles, [p]: v } as CSSProperties } } });
    } else {
      const prev = selected.responsiveStyles ?? {};
      dispatch({ type: "UPDATE_ELEMENT", payload: { element: { ...selected, responsiveStyles: { ...prev, [device]: { ...prev[device], [p]: v } } } } });
    }
  };
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
        <MIcon name="edit" size={12} className="shrink-0 text-sidebar-foreground/50" />
        <input className="h-7 min-w-0 flex-1 rounded-md border border-sidebar-border bg-transparent px-2 text-xs outline-none focus:border-primary" value={selected.name} onChange={(e) => onUpdate({ ...selected, name: e.target.value })} />
        <Badge variant="outline" className="shrink-0 px-1.5 py-0 text-[9px] h-4">{selected.type}</Badge>
        {device !== "Desktop" && <Badge className="shrink-0 px-1.5 py-0 text-[9px] h-4 bg-primary/10 text-primary border-primary/20">{device}</Badge>}
      </div>

      {/* Actions */}
      <TooltipProvider delayDuration={200}>
        <div className="flex gap-1 border-b border-sidebar-border px-3 py-1.5">
          <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" className="size-7" onClick={onDuplicate}><MIcon name="content_copy" size={14} /></Button></TooltipTrigger><TooltipContent side="bottom" className="text-[10px]">Duplicate</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild>
            <Button variant="outline" size="icon" className={cn("size-7", selected.locked && "bg-amber-500/10 text-amber-500 border-amber-500/30")} onClick={() => onUpdate({ ...selected, locked: !selected.locked })}>
              <MIcon name="lock" size={14} />
            </Button>
          </TooltipTrigger><TooltipContent side="bottom" className="text-[10px]">{selected.locked ? "Unlock" : "Lock"}</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild>
            <Button variant="outline" size="icon" className={cn("size-7", selected.hidden && "bg-muted text-muted-foreground")} onClick={() => onUpdate({ ...selected, hidden: !selected.hidden })}>
              <MIcon name="visibility" size={14} />
            </Button>
          </TooltipTrigger><TooltipContent side="bottom" className="text-[10px]">{selected.hidden ? "Show" : "Hide"}</TooltipContent></Tooltip>
          {selected.type !== "__body" && (
            <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive hover:border-destructive" onClick={() => dispatch({ type: "DELETE_ELEMENT", payload: { id: selected.id } })}><MIcon name="delete" size={14} /></Button></TooltipTrigger><TooltipContent side="bottom" className="text-[10px]">Delete</TooltipContent></Tooltip>
          )}
        </div>
      </TooltipProvider>

      {/* Tabs */}
      <Tabs value={propsTab} onValueChange={(v) => setPropsTab(v as "design" | "content")} className="flex flex-1 flex-col min-h-0">
        <TabsList className="w-full rounded-none border-b border-sidebar-border h-8 bg-transparent p-0">
          <TabsTrigger value="design" className="flex-1 rounded-none h-full text-xs data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary gap-1"><MIcon name="design_services" size={12} /> Design</TabsTrigger>
          <TabsTrigger value="content" className="flex-1 rounded-none h-full text-xs data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary gap-1"><MIcon name="text_fields" size={12} /> Content</TabsTrigger>
        </TabsList>

        {/* Content tab */}
        <TabsContent value="content" className="flex-1 overflow-y-auto mt-0 p-3">
          {!Array.isArray(selected.content) ? (
            Object.keys(selected.content as Record<string, string>).length === 0 ? (
              <div className="py-8 text-center text-xs text-sidebar-foreground/50">No editable content for this element.</div>
            ) : (
              Object.entries(selected.content as Record<string, string>).map(([key, val]) => (
                <div key={key} className="mb-3">
                  <label className="mb-1 block text-[10px] font-medium text-sidebar-foreground/50">{key}</label>
                  {key === "innerText" || key === "code" ? (
                    <textarea value={val} onChange={(e) => onUpdate({ ...selected, content: { ...(selected.content as Record<string, string>), [key]: e.target.value } })} className="w-full rounded-md border border-sidebar-border bg-transparent p-2 text-xs outline-none resize-y focus:border-primary min-h-[60px] font-mono" rows={key === "code" ? 6 : 3} />
                  ) : key === "targetDate" ? (
                    <Input type="datetime-local" value={val} onChange={(e) => onUpdate({ ...selected, content: { ...(selected.content as Record<string, string>), [key]: e.target.value } })} className="h-7 text-xs" />
                  ) : key === "images" ? (
                    <textarea value={val} onChange={(e) => onUpdate({ ...selected, content: { ...(selected.content as Record<string, string>), [key]: e.target.value } })} className="w-full rounded-md border border-sidebar-border bg-transparent p-2 text-xs outline-none resize-y focus:border-primary min-h-[60px]" rows={4} placeholder="One URL per line or comma-separated" />
                  ) : key === "items" ? (
                    <ItemsEditor value={val} onChange={(v) => onUpdate({ ...selected, content: { ...(selected.content as Record<string, string>), [key]: v } })} />
                  ) : (
                    <Input value={val} onChange={(e) => onUpdate({ ...selected, content: { ...(selected.content as Record<string, string>), [key]: e.target.value } })} className="h-7 text-xs" />
                  )}
                </div>
              ))
            )
          ) : (
            <div className="py-8 text-center text-xs text-sidebar-foreground/50">Container — drag children from sidebar.</div>
          )}
        </TabsContent>

        {/* Design tab */}
        <TabsContent value="design" className="flex-1 overflow-y-auto mt-0">

          {/* Custom */}
          {!Array.isArray(selected.content) && Object.keys(selected.content as Record<string, string>).some((k) => k === "href" || k === "src") && (
            <Section title="Custom" icon="edit">
              {(selected.content as Record<string, string>).href !== undefined && (
                <Field label="Link URL" value={(selected.content as Record<string, string>).href ?? ""} onChange={(v) => onUpdate({ ...selected, content: { ...(selected.content as Record<string, string>), href: v } })} placeholder="https://..." />
              )}
              {(selected.content as Record<string, string>).src !== undefined && (
                <Field label="Source URL" value={(selected.content as Record<string, string>).src ?? ""} onChange={(v) => onUpdate({ ...selected, content: { ...(selected.content as Record<string, string>), src: v } })} placeholder="https://..." />
              )}
            </Section>
          )}

          {/* Typography */}
          <Section title="Typography" icon="text_fields">
            <div className="space-y-2">
              {/* Font Family */}
              <div>
                <label className="mb-0.5 block text-[10px] text-sidebar-foreground/50">Font Family</label>
                <Select value={get("fontFamily") || undefined} onValueChange={(v) => {
                  set("fontFamily", v);
                  // Load Google Font
                  if (typeof document !== 'undefined' && !document.querySelector(`link[data-font="${v}"]`)) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = `https://fonts.googleapis.com/css2?family=${v.replace(/\s+/g, '+')}&display=swap`;
                    link.setAttribute('data-font', v);
                    document.head.appendChild(link);
                  }
                }}>
                  <SelectTrigger className="h-7 text-xs px-2"><SelectValue placeholder="Default" /></SelectTrigger>
                  <SelectContent className="max-h-60">
                    {["Inter","Roboto","Open Sans","Lato","Montserrat","Poppins","Raleway","Nunito","Playfair Display","Merriweather","Source Sans 3","DM Sans","Space Grotesk","Outfit","Sora","Geist"].map((f) => (
                      <SelectItem key={f} value={f} className="text-xs" style={{ fontFamily: f }}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
          <Section title="Layout" icon="grid_view">
            <div className="space-y-2.5">
              {/* Sizing Mode */}
              <div>
                <label className="mb-1 block text-[10px] text-sidebar-foreground/50">Width Sizing</label>
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
              </div>
              {/* W × H */}
              <div className="flex gap-1.5">
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-[9px] font-medium text-sidebar-foreground/40 w-3">W</span>
                  </div>
                  <Input value={get("width")} onChange={(e) => set("width", e.target.value)} className="h-7 text-xs" placeholder="auto" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-[9px] font-medium text-sidebar-foreground/40 w-3">H</span>
                  </div>
                  <Input value={get("height")} onChange={(e) => set("height", e.target.value)} className="h-7 text-xs" placeholder="auto" />
                </div>
              </div>

              {/* Min / Max row */}
              <div className="flex gap-1.5">
                <div className="flex-1">
                  <span className="text-[8px] text-sidebar-foreground/35 mb-0.5 block">Min W</span>
                  <Input value={get("minWidth")} onChange={(e) => set("minWidth", e.target.value)} className="h-6 text-[10px]" placeholder="—" />
                </div>
                <div className="flex-1">
                  <span className="text-[8px] text-sidebar-foreground/35 mb-0.5 block">Max W</span>
                  <Input value={get("maxWidth")} onChange={(e) => set("maxWidth", e.target.value)} className="h-6 text-[10px]" placeholder="—" />
                </div>
                <div className="flex-1">
                  <span className="text-[8px] text-sidebar-foreground/35 mb-0.5 block">Min H</span>
                  <Input value={get("minHeight")} onChange={(e) => set("minHeight", e.target.value)} className="h-6 text-[10px]" placeholder="—" />
                </div>
                <div className="flex-1">
                  <span className="text-[8px] text-sidebar-foreground/35 mb-0.5 block">Max H</span>
                  <Input value={get("maxHeight")} onChange={(e) => set("maxHeight", e.target.value)} className="h-6 text-[10px]" placeholder="—" />
                </div>
              </div>

              <div className="h-px bg-sidebar-border" />

              {/* Padding — 4 inputs in a row */}
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <MIcon name="padding" size={12} className="text-emerald-500/60" />
                  <span className="text-[10px] text-sidebar-foreground/50">Padding</span>
                </div>
                <div className="flex gap-1">
                  {(["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"] as const).map((p, i) => (
                    <div key={p} className="flex-1 relative">
                      <span className="absolute left-1 top-0.5 text-[7px] text-emerald-500/40 pointer-events-none">{"↑→↓←"[i]}</span>
                      <Input value={get(p)} onChange={(e) => set(p, e.target.value)} className="h-7 text-[10px] text-center pt-2" placeholder="0" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Margin — 4 inputs in a row */}
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <MIcon name="select_all" size={12} className="text-primary/60" />
                  <span className="text-[10px] text-sidebar-foreground/50">Margin</span>
                </div>
                <div className="flex gap-1">
                  {(["marginTop", "marginRight", "marginBottom", "marginLeft"] as const).map((p, i) => (
                    <div key={p} className="flex-1 relative">
                      <span className="absolute left-1 top-0.5 text-[7px] text-primary/40 pointer-events-none">{"↑→↓←"[i]}</span>
                      <Input value={get(p)} onChange={(e) => set(p, e.target.value)} className="h-7 text-[10px] text-center pt-2" placeholder="0" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-sidebar-border" />

              {/* Overflow / Object Fit */}
              <div className="grid grid-cols-2 gap-1.5">
                <SelectField label="Overflow" value={get("overflow")} options={selectOptions.overflow} onChange={(v) => set("overflow", v)} />
                <SelectField label="Object Fit" value={get("objectFit")} options={selectOptions.objectFit} onChange={(v) => set("objectFit", v)} />
              </div>

              <div className="h-px bg-sidebar-border" />

              {/* Flex */}
              <SelectField label="Display" value={get("display")} options={selectOptions.display} onChange={(v) => set("display", v)} />
              <div>
                <label className="mb-0.5 block text-[10px] text-sidebar-foreground/50">Direction</label>
                <IconToggle value={get("flexDirection")} options={directionOpts} onChange={(v) => set("flexDirection", v)} />
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div><label className="mb-0.5 block text-[10px] text-sidebar-foreground/50">Justify</label><IconToggle value={get("justifyContent")} options={justifyOpts} onChange={(v) => set("justifyContent", v)} /></div>
                <div><label className="mb-0.5 block text-[10px] text-sidebar-foreground/50">Align</label><IconToggle value={get("alignItems")} options={alignOpts} onChange={(v) => set("alignItems", v)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div><label className="mb-0.5 block text-[10px] text-sidebar-foreground/50">Wrap</label><IconToggle value={get("flexWrap")} options={wrapOpts} onChange={(v) => set("flexWrap", v)} /></div>
                <Field label="Gap" value={get("gap")} onChange={(v) => set("gap", v)} placeholder="0px" />
              </div>
            </div>
          </Section>

          {/* Decorations */}
          <Section title="Appearance" icon="palette">
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
              <SelectField label="Cursor" value={get("cursor")} options={selectOptions.cursor} onChange={(v) => set("cursor", v)} />
              <Field label="Transition" value={get("transition")} onChange={(v) => set("transition", v)} placeholder="all 0.2s" />
            </div>
          </Section>

          {/* Quick Columns — for row containers */}
          {Array.isArray(selected.content) && (get("flexDirection") === "row" || get("flexDirection") === "row-reverse") && (
            <Section title="Columns" icon="view_column">
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((n) => (
                    <button
                      key={n}
                      onClick={() => {
                        const cols = Array.isArray(selected.content) ? selected.content as El[] : [];
                        const current = cols.length;
                        if (n === current) return;
                        if (n > current) {
                          let updated = selected;
                          for (let i = current; i < n; i++) {
                            const col: El = { id: crypto.randomUUID(), type: "column", name: `Col ${i + 1}`, styles: { display: "flex", flexDirection: "column", gap: "8px", flex: "1", padding: "8px" }, content: [] };
                            updated = { ...updated, content: [...(updated.content as El[]), col] };
                          }
                          onUpdate(updated);
                        } else {
                          onUpdate({ ...selected, content: cols.slice(0, n) });
                        }
                      }}
                      className={cn(
                        "flex-1 h-8 rounded border text-[10px] font-medium transition-colors",
                        (selected.content as El[]).length === n
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-sidebar-border hover:bg-sidebar-accent"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1">
                  {(selected.content as El[]).map((col, i) => (
                    <div key={col.id} className="flex-1">
                      <label className="text-[9px] text-sidebar-foreground/40 mb-0.5 block">Col {i + 1}</label>
                      <Input
                        value={col.styles.flex ?? "1"}
                        onChange={(e) => {
                          const cols = [...(selected.content as El[])];
                          cols[i] = { ...cols[i], styles: { ...cols[i].styles, flex: e.target.value } };
                          onUpdate({ ...selected, content: cols });
                        }}
                        className="h-6 text-[10px]"
                        placeholder="1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          )}

          {/* Flexbox */}
          {/* Position */}
          <Section title="Position" icon="open_with" defaultOpen={false}>
            <div className="space-y-2">
              {/* Align self */}
              <div className="flex gap-1">
                <div className="flex gap-px rounded-md border border-sidebar-border overflow-hidden flex-1">
                  {(["flex-start","center","flex-end"] as const).map((v, i) => (
                    <button key={v} onClick={() => set("alignSelf", v)} className={cn("flex flex-1 h-6 items-center justify-center text-muted-foreground transition-colors hover:text-foreground", get("alignSelf") === v && "bg-primary/10 text-primary")}>
                      <MIcon name={["align_horizontal_left","align_horizontal_center","align_horizontal_right"][i]} size={14} />
                    </button>
                  ))}
                </div>
                <div className="flex gap-px rounded-md border border-sidebar-border overflow-hidden flex-1">
                  {(["flex-start","center","flex-end"] as const).map((v, i) => (
                    <button key={v} onClick={() => set("justifySelf", v)} className={cn("flex flex-1 h-6 items-center justify-center text-muted-foreground transition-colors hover:text-foreground", get("justifySelf") === v && "bg-primary/10 text-primary")}>
                      <MIcon name={["align_vertical_top","align_vertical_center","align_vertical_bottom"][i]} size={14} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Position type as icon toggle */}
              <div className="flex gap-px rounded-md border border-sidebar-border overflow-hidden">
                {(["static","relative","absolute","fixed","sticky"] as const).map((v) => (
                  <button key={v} onClick={() => set("position", v)} className={cn("flex flex-1 h-6 items-center justify-center text-[9px] text-muted-foreground transition-colors hover:text-foreground", get("position") === v && "bg-primary/10 text-primary font-medium")}>
                    {v.slice(0, 3)}
                  </button>
                ))}
              </div>

              {/* Offsets — icon-labeled compact row */}
              <div className="grid grid-cols-4 gap-1">
                {([["top","arrow_upward"],["right","arrow_forward"],["bottom","arrow_downward"],["left","arrow_back"]] as const).map(([p, ic]) => (
                  <div key={p} className="relative">
                    <MIcon name={ic} size={10} className="absolute left-1 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                    <Input value={get(p)} onChange={(e) => set(p, e.target.value)} className="h-6 text-[10px] pl-5 text-center" placeholder="—" />
                  </div>
                ))}
              </div>

              {/* Z-index + Rotate — icon-labeled */}
              <div className="grid grid-cols-2 gap-1">
                <div className="relative">
                  <MIcon name="layers" size={10} className="absolute left-1 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                  <Input value={get("zIndex")} onChange={(e) => set("zIndex", e.target.value)} className="h-6 text-[10px] pl-5" placeholder="auto" />
                </div>
                <div className="relative">
                  <MIcon name="rotate_right" size={10} className="absolute left-1 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                  <Input value={get("transform")} onChange={(e) => set("transform", e.target.value)} className="h-6 text-[10px] pl-5" placeholder="0deg" />
                </div>
              </div>
            </div>
          </Section>

        </TabsContent>
      </Tabs>
    </div>
  );
}
