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
import type { El } from "./types";
import { useEditor } from "./editor-provider";
import { findParentId } from "./tree-helpers";

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

export function IconToggle({ value, options, onChange }: { value: string; options: IconOpt[]; onChange: (v: string) => void }) {
  return (
    <TooltipProvider delayDuration={200}>
      <ToggleGroup type="single" value={value} onValueChange={(v) => { if (v) onChange(v); }} className="editor-icon-toggle">
        {options.map((o) => (
          <Tooltip key={o.value}>
            <TooltipTrigger asChild>
              <ToggleGroupItem value={o.value} className="editor-icon-toggle-btn" aria-label={o.label}>
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

export function PropGroup({ title, icon: Icon, props, selected, onUpdate }: { title: string; icon: React.ComponentType<{ size?: number }>; props: string[]; selected: El; onUpdate: (el: El) => void }) {
  const [open, setOpen] = useState(true);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mb-1">
      <CollapsibleTrigger className="editor-prop-group-toggle">
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
        <div className="editor-style-grid">
          {props.map((p) => {
            const val = String((selected.styles as Record<string, unknown>)[p] ?? "");
            const isColor = colorProps.has(p);
            const options = selectOptions[p];
            const update = (v: string) => onUpdate({ ...selected, styles: { ...selected.styles, [p]: v } as CSSProperties });

            if (p === "opacity") {
              return (
                <div key={p} className="editor-style-full">
                  <label className="editor-prop-label">opacity</label>
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
                  <label className="editor-prop-label">{p.replace(/([A-Z])/g, " $1")}</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="editor-color-btn">
                        <span className="editor-color-swatch" style={{ background: val || "transparent" }} />
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
                <div key={p} className="editor-style-full">
                  <label className="editor-prop-label">{p.replace(/([A-Z])/g, " $1")}</label>
                  <IconToggle value={val} options={iconOptions[p]} onChange={update} />
                </div>
              );
            }

            if (options) {
              return (
                <div key={p}>
                  <label className="editor-prop-label">{p.replace(/([A-Z])/g, " $1")}</label>
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
                <label className="editor-prop-label">{p.replace(/([A-Z])/g, " $1")}</label>
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

export function SpacingBox({ selected, onUpdate }: { selected: El; onUpdate: (el: El) => void }) {
  const s = selected.styles as Record<string, unknown>;
  const get = (p: string) => String(s[p] ?? "");
  const set = (p: string, v: string) => onUpdate({ ...selected, styles: { ...selected.styles, [p]: v } as CSSProperties });

  return (
    <div className="spacing-box-wrap">
      <div className="spacing-box-margin">
        <span className="spacing-box-label">margin</span>
        <input className="spacing-box-input top" value={get("marginTop")} onChange={(e) => set("marginTop", e.target.value)} placeholder="0" title="margin-top" />
        <input className="spacing-box-input right" value={get("marginRight")} onChange={(e) => set("marginRight", e.target.value)} placeholder="0" title="margin-right" />
        <input className="spacing-box-input bottom" value={get("marginBottom")} onChange={(e) => set("marginBottom", e.target.value)} placeholder="0" title="margin-bottom" />
        <input className="spacing-box-input left" value={get("marginLeft")} onChange={(e) => set("marginLeft", e.target.value)} placeholder="0" title="margin-left" />
        <div className="spacing-box-padding">
          <span className="spacing-box-label">padding</span>
          <input className="spacing-box-input top" value={get("paddingTop")} onChange={(e) => set("paddingTop", e.target.value)} placeholder="0" title="padding-top" />
          <input className="spacing-box-input right" value={get("paddingRight")} onChange={(e) => set("paddingRight", e.target.value)} placeholder="0" title="padding-right" />
          <input className="spacing-box-input bottom" value={get("paddingBottom")} onChange={(e) => set("paddingBottom", e.target.value)} placeholder="0" title="padding-bottom" />
          <input className="spacing-box-input left" value={get("paddingLeft")} onChange={(e) => set("paddingLeft", e.target.value)} placeholder="0" title="padding-left" />
          <div className="spacing-box-center" />
        </div>
      </div>
    </div>
  );
}

export function SizeBox({ selected, onUpdate }: { selected: El; onUpdate: (el: El) => void }) {
  const s = selected.styles as Record<string, unknown>;
  const get = (p: string) => String(s[p] ?? "");
  const set = (p: string, v: string) => onUpdate({ ...selected, styles: { ...selected.styles, [p]: v } as CSSProperties });
  return (
    <div className="visual-box-wrap">
      <div className="visual-box-row">
        <div className="visual-box-field">
          <Maximize size={10} className="visual-box-icon" />
          <label className="visual-box-flabel">W</label>
          <input className="visual-box-finput" value={get("width")} onChange={(e) => set("width", e.target.value)} placeholder="auto" />
        </div>
        <span className="visual-box-x">x</span>
        <div className="visual-box-field">
          <label className="visual-box-flabel">H</label>
          <input className="visual-box-finput" value={get("height")} onChange={(e) => set("height", e.target.value)} placeholder="auto" />
        </div>
      </div>
      <div className="visual-box-grid4">
        <div className="visual-box-field"><label className="visual-box-flabel">Min W</label><input className="visual-box-finput" value={get("minWidth")} onChange={(e) => set("minWidth", e.target.value)} placeholder="—" /></div>
        <div className="visual-box-field"><label className="visual-box-flabel">Max W</label><input className="visual-box-finput" value={get("maxWidth")} onChange={(e) => set("maxWidth", e.target.value)} placeholder="—" /></div>
        <div className="visual-box-field"><label className="visual-box-flabel">Min H</label><input className="visual-box-finput" value={get("minHeight")} onChange={(e) => set("minHeight", e.target.value)} placeholder="—" /></div>
        <div className="visual-box-field"><label className="visual-box-flabel">Max H</label><input className="visual-box-finput" value={get("maxHeight")} onChange={(e) => set("maxHeight", e.target.value)} placeholder="—" /></div>
      </div>
      <div className="visual-box-grid2">
        <div><label className="editor-prop-label">overflow</label>
          <Select value={get("overflow") || undefined} onValueChange={(v) => set("overflow", v)}><SelectTrigger className="h-6 text-[10px] px-2"><SelectValue placeholder="—" /></SelectTrigger><SelectContent>{selectOptions.overflow.map((o) => <SelectItem key={o} value={o} className="text-[11px]">{o}</SelectItem>)}</SelectContent></Select>
        </div>
        <div><label className="editor-prop-label">object fit</label>
          <Select value={get("objectFit") || undefined} onValueChange={(v) => set("objectFit", v)}><SelectTrigger className="h-6 text-[10px] px-2"><SelectValue placeholder="—" /></SelectTrigger><SelectContent>{selectOptions.objectFit.map((o) => <SelectItem key={o} value={o} className="text-[11px]">{o}</SelectItem>)}</SelectContent></Select>
        </div>
      </div>
    </div>
  );
}

export function BorderBox({ selected, onUpdate }: { selected: El; onUpdate: (el: El) => void }) {
  const s = selected.styles as Record<string, unknown>;
  const get = (p: string) => String(s[p] ?? "");
  const set = (p: string, v: string) => onUpdate({ ...selected, styles: { ...selected.styles, [p]: v } as CSSProperties });
  return (
    <div className="visual-box-wrap">
      <div><label className="editor-prop-label">style</label>
        <IconToggle value={get("borderStyle")} options={iconOptions.borderStyle} onChange={(v) => set("borderStyle", v)} />
      </div>
      <div className="visual-box-row" style={{ marginTop: 8 }}>
        <div className="visual-box-field">
          <Frame size={10} className="visual-box-icon" />
          <label className="visual-box-flabel">Width</label>
          <input className="visual-box-finput" value={get("borderWidth")} onChange={(e) => set("borderWidth", e.target.value)} placeholder="0" />
        </div>
        <div className="visual-box-field">
          <Popover>
            <PopoverTrigger asChild>
              <button className="editor-color-btn" style={{ height: 22 }}>
                <span className="editor-color-swatch" style={{ background: get("borderColor") || "transparent" }} />
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
      <div className="spacing-box-margin" style={{ marginTop: 8, minHeight: 50 }}>
        <span className="spacing-box-label">sides</span>
        <input className="spacing-box-input top" value={get("borderTop")} onChange={(e) => set("borderTop", e.target.value)} placeholder="—" title="border-top" />
        <input className="spacing-box-input right" value={get("borderRight")} onChange={(e) => set("borderRight", e.target.value)} placeholder="—" title="border-right" />
        <input className="spacing-box-input bottom" value={get("borderBottom")} onChange={(e) => set("borderBottom", e.target.value)} placeholder="—" title="border-bottom" />
        <input className="spacing-box-input left" value={get("borderLeft")} onChange={(e) => set("borderLeft", e.target.value)} placeholder="—" title="border-left" />
        <div className="spacing-box-center" />
      </div>
    </div>
  );
}

export function PositionBox({ selected, onUpdate }: { selected: El; onUpdate: (el: El) => void }) {
  const s = selected.styles as Record<string, unknown>;
  const get = (p: string) => String(s[p] ?? "");
  const set = (p: string, v: string) => onUpdate({ ...selected, styles: { ...selected.styles, [p]: v } as CSSProperties });
  return (
    <div className="visual-box-wrap">
      <div><label className="editor-prop-label">position</label>
        <Select value={get("position") || undefined} onValueChange={(v) => set("position", v)}><SelectTrigger className="h-6 text-[10px] px-2"><SelectValue placeholder="static" /></SelectTrigger><SelectContent>{selectOptions.position.map((o) => <SelectItem key={o} value={o} className="text-[11px]">{o}</SelectItem>)}</SelectContent></Select>
      </div>
      <div className="spacing-box-margin" style={{ marginTop: 8, minHeight: 50, background: "hsl(var(--primary) / 0.04)" }}>
        <span className="spacing-box-label">offsets</span>
        <input className="spacing-box-input top" value={get("top")} onChange={(e) => set("top", e.target.value)} placeholder="—" title="top" />
        <input className="spacing-box-input right" value={get("right")} onChange={(e) => set("right", e.target.value)} placeholder="—" title="right" />
        <input className="spacing-box-input bottom" value={get("bottom")} onChange={(e) => set("bottom", e.target.value)} placeholder="—" title="bottom" />
        <input className="spacing-box-input left" value={get("left")} onChange={(e) => set("left", e.target.value)} placeholder="—" title="left" />
        <div className="spacing-box-center">
          <Move size={10} style={{ margin: "auto", display: "block", opacity: 0.3, marginTop: 6 }} />
        </div>
      </div>
      <div style={{ marginTop: 8 }}>
        <div className="visual-box-field">
          <Layers size={10} className="visual-box-icon" />
          <label className="visual-box-flabel">z-index</label>
          <input className="visual-box-finput" value={get("zIndex")} onChange={(e) => set("zIndex", e.target.value)} placeholder="auto" />
        </div>
      </div>
    </div>
  );
}

export function DesignPanel({ propsTab, setPropsTab }: {
  propsTab: "design" | "content";
  setPropsTab: (v: "design" | "content") => void;
}) {
  const { state, dispatch } = useEditor();
  const selected = state.editor.selected;
  if (!selected) return null;
  const onUpdate = (el: El) => dispatch({ type: 'UPDATE_ELEMENT', payload: { element: el } });
  const onDuplicate = () => {
    if (selected.type === "__body") return;
    const parentId = findParentId(state.editor.elements, selected.id);
    if (!parentId) return;
    dispatch({ type: 'DUPLICATE_ELEMENT', payload: { elId: selected.id, containerId: parentId } });
  };
  const onDelete = (id: string) => dispatch({ type: 'DELETE_ELEMENT', payload: { id } });
  return (
    <div className="editor-props">
      {/* Header */}
      <div className="editor-props-header">
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Pencil size={11} className="text-muted-foreground shrink-0" />
          <input className="editor-props-name-input" value={selected.name} onChange={(e) => onUpdate({ ...selected, name: e.target.value })} />
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 shrink-0">{selected.type}</Badge>
        </div>
      </div>

      {/* Actions */}
      <TooltipProvider delayDuration={200}>
        <div className="editor-props-actions">
          <Tooltip><TooltipTrigger asChild>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={onDuplicate}><Copy size={13} /></Button>
          </TooltipTrigger><TooltipContent side="bottom" className="text-[10px]">Duplicate (Cmd+D)</TooltipContent></Tooltip>
          {selected.type !== "__body" && (
            <Tooltip><TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive hover:border-destructive" onClick={() => onDelete(selected.id)}><Trash2 size={13} /></Button>
            </TooltipTrigger><TooltipContent side="bottom" className="text-[10px]">Delete</TooltipContent></Tooltip>
          )}
        </div>
      </TooltipProvider>

      {/* Tabs */}
      <Tabs defaultValue="design" value={propsTab} onValueChange={(v) => setPropsTab(v as "design" | "content")} className="flex flex-col flex-1 min-h-0">
        <TabsList className="w-full rounded-none border-b h-8 bg-transparent p-0">
          <TabsTrigger value="design" className="flex-1 rounded-none h-full text-xs data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary gap-1"><Star size={11} /> Design</TabsTrigger>
          <TabsTrigger value="content" className="flex-1 rounded-none h-full text-xs data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary gap-1"><Type size={11} /> Content</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="editor-scroll-panel mt-0 p-0">
          <div className="editor-props-section">
            {!Array.isArray(selected.content) ? (
              Object.entries(selected.content as Record<string, string>).map(([key, val]) => (
                <div key={key} className="editor-content-field">
                  <label className="editor-content-label">{key}</label>
                  {key === "innerText" ? (
                    <textarea value={val} onChange={(e) => onUpdate({ ...selected, content: { ...(selected.content as Record<string, string>), [key]: e.target.value } })} className="editor-textarea" rows={3} />
                  ) : (
                    <Input value={val} onChange={(e) => onUpdate({ ...selected, content: { ...(selected.content as Record<string, string>), [key]: e.target.value } })} className="h-7 text-[11px]" />
                  )}
                </div>
              ))
            ) : (
              <div className="editor-empty-state">Container element — drag child elements from the sidebar.</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="design" className="editor-scroll-panel mt-0 p-0">
          <div className="editor-props-section">
            {propGroups.map((g) => (
              <PropGroup key={g.title} title={g.title} icon={g.icon} props={g.props} selected={selected} onUpdate={onUpdate} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
