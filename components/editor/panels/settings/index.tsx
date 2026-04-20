"use client";

import { useState, type CSSProperties } from "react";
import { MIcon } from "../../ui/m-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { El } from "../../core/types";
import { cn } from "@/lib/utils";
import { useEditor } from "../../core/provider";
import { findParentId } from "../../core/tree-helpers";
import { Section, ColorField, IconToggle, Field, SelectField, selectOptions, justifyOpts, alignOpts, directionOpts, wrapOpts, borderStyleOpts, textAlignOpts, fontStyleOpts, textDecoOpts, textTransOpts, type StyleProps } from "./shared";

// ── Context-aware visibility ────────────────────────────
const textTypes = new Set(["text", "heading", "subheading", "quote", "code", "list", "badge", "icon", "footer"]);
const containerTypes = new Set(["__body", "container", "section", "row", "column", "2Col", "3Col", "4Col", "grid", "hero", "header", "card", "sidebar", "modal", "form"]);
const simpleTypes = new Set(["divider", "spacer"]);

// ── Penpot-style numeric input with icon label ──────────
function N({ icon, value, onChange, placeholder = "auto", tip, disabled }: { icon: string; value: string; onChange: (v: string) => void; placeholder?: string; tip: string; disabled?: boolean }) {
  return (
    <Tooltip><TooltipTrigger asChild>
      <div className={cn("relative", disabled && "opacity-40 pointer-events-none")}>
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[9px] font-medium text-muted-foreground/40 select-none">{icon}</span>
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-6 text-[10px] pl-5 tabular-nums" placeholder={placeholder} />
      </div>
    </TooltipTrigger><TooltipContent className="text-[10px]">{tip}</TooltipContent></Tooltip>
  );
}

// ── Google Fonts ────────────────────────────────────────
const fonts = ["Inter","Roboto","Open Sans","Lato","Montserrat","Poppins","Raleway","Nunito","Playfair Display","Merriweather","Source Code Pro","Fira Code","DM Sans","Space Grotesk","Outfit","Geist"];

export default function SettingsTab() {
  const { state, dispatch } = useEditor();
  const selected = state.editor.selected;
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
  const parentId = findParentId(state.editor.elements, selected.id);
  const isContainer = containerTypes.has(selected.type);
  const isText = textTypes.has(selected.type) || selected.type === "button" || selected.type === "link" || selected.type === "navbar";
  const isSimple = simpleTypes.has(selected.type);
  const isBody = selected.type === "__body";

  const [padLinked, setPadLinked] = useState(true);
  const [radiusLinked, setRadiusLinked] = useState(true);
  const [propsTab, setPropsTab] = useState<"design" | "content">("design");

  const setPad = (side: string, v: string) => {
    if (padLinked) { set("paddingTop", v); set("paddingRight", v); set("paddingBottom", v); set("paddingLeft", v); }
    else set(side, v);
  };
  const setRadius = (corner: string, v: string) => {
    if (radiusLinked) { set("borderTopLeftRadius", v); set("borderTopRightRadius", v); set("borderBottomRightRadius", v); set("borderBottomLeftRadius", v); }
    else set(corner, v);
  };

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
      {/* ── Header: name + actions ── */}
      <div className="border-b border-sidebar-border px-3 py-2 space-y-1.5 shrink-0">
        <div className="flex items-center gap-1">
          <input className="h-6 min-w-0 flex-1 rounded border border-sidebar-border bg-transparent px-2 text-[11px] outline-none focus:border-primary" value={selected.name} onChange={(e) => onUpdate({ ...selected, name: e.target.value })} />
          {device !== "Desktop" && <Badge className="shrink-0 px-1.5 py-0 text-[9px] h-4 bg-primary/10 text-primary border-primary/20">{device}</Badge>}
        </div>
        <div className="flex items-center gap-0.5">
          {parentId && <Button variant="ghost" size="icon" className="size-6" onClick={() => dispatch({ type: "DUPLICATE_ELEMENT", payload: { elId: selected.id, containerId: parentId } })}><MIcon name="content_copy" size={13} /></Button>}
          <Button variant="ghost" size="icon" className={cn("size-6", selected.locked && "text-amber-500")} onClick={() => onUpdate({ ...selected, locked: !selected.locked })}><MIcon name={selected.locked ? "lock" : "lock_open"} size={13} /></Button>
          <Button variant="ghost" size="icon" className={cn("size-6", selected.hidden && "text-muted-foreground/40")} onClick={() => onUpdate({ ...selected, hidden: !selected.hidden })}><MIcon name={selected.hidden ? "visibility_off" : "visibility"} size={13} /></Button>
          <div className="flex-1" />
          {!isBody && <Button variant="ghost" size="icon" className="size-6 text-muted-foreground/50 hover:text-destructive" onClick={() => dispatch({ type: "DELETE_ELEMENT", payload: { id: selected.id } })}><MIcon name="delete" size={13} /></Button>}
        </div>
      </div>

      {/* ── Tabs: Design / Content ── */}
      <div className="flex border-b border-sidebar-border shrink-0">
        {(["design", "content"] as const).map((t) => (
          <button key={t} onClick={() => setPropsTab(t)} className={cn("flex-1 h-7 text-[10px] font-medium capitalize transition-colors", propsTab === t ? "text-foreground border-b-2 border-primary" : "text-muted-foreground/50 hover:text-foreground")}>{t}</button>
        ))}
      </div>

      {/* ── Design Tab ── */}
      {propsTab === "design" && (
        <div className="flex-1 overflow-y-auto">
          <TooltipProvider delayDuration={200}>

          {/* ─── 1. Layer: opacity + blend mode (Penpot: first section) ─── */}
          {!isSimple && (
            <Section title="Layer" icon="layers" defaultOpen={false}>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Slider value={[parseFloat(get("opacity") || "1")]} min={0} max={1} step={0.01} onValueChange={([v]) => set("opacity", String(v))} className="flex-1" />
                  <span className="text-[9px] w-7 text-right text-muted-foreground/50 tabular-nums">{Math.round(parseFloat(get("opacity") || "1") * 100)}%</span>
                </div>
                <Select value={get("mixBlendMode") || "normal"} onValueChange={(v) => set("mixBlendMode", v)}>
                  <SelectTrigger className="h-6 text-[10px]"><SelectValue /></SelectTrigger>
                  <SelectContent>{["normal","multiply","screen","overlay","darken","lighten","color-dodge","color-burn","hard-light","soft-light","difference","exclusion"].map((m) => <SelectItem key={m} value={m} className="text-xs capitalize">{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </Section>
          )}

          {/* ─── 2. Size: W/H + proportion lock (Penpot: measures-menu) ─── */}
          {!isSimple && (
            <Section title="Size" icon="straighten">
              <div className="space-y-2">
                {/* Sizing mode toggle */}
                <IconToggle
                  value={get("width") === "fit-content" ? "hug" : get("width") === "100%" || get("flex") === "1" ? "fill" : "fixed"}
                  options={[
                    { value: "hug", label: "Hug content", icon: <MIcon name="fit_screen" size={14} /> },
                    { value: "fill", label: "Fill container", icon: <MIcon name="expand" size={14} /> },
                    { value: "fixed", label: "Fixed size", icon: <MIcon name="width" size={14} /> },
                  ]}
                  onChange={(v) => {
                    if (v === "hug") { set("width", "fit-content"); set("flex", ""); }
                    else if (v === "fill") { set("width", "100%"); set("flex", ""); }
                    else { set("width", "auto"); set("flex", ""); }
                  }}
                />
                {/* W × H — Penpot 2-col grid with lock icon */}
                <div className="flex items-center gap-1">
                  <div className="grid grid-cols-2 gap-1 flex-1">
                    <N icon="W" value={get("width")} onChange={(v) => set("width", v)} tip="Width" />
                    <N icon="H" value={get("height")} onChange={(v) => set("height", v)} tip="Height" />
                  </div>
                </div>
                {/* Min/Max */}
                <div className="grid grid-cols-2 gap-1">
                  <N icon="↕" value={get("minHeight")} onChange={(v) => set("minHeight", v)} placeholder="—" tip="Min Height" />
                  <N icon="↔" value={get("maxWidth")} onChange={(v) => set("maxWidth", v)} placeholder="—" tip="Max Width" />
                </div>
              </div>
            </Section>
          )}

          {/* ─── 3. Border Radius (Penpot: inside measures, linked/unlinked) ─── */}
          {!isSimple && !isBody && (
            <Section title="Radius" icon="rounded_corner" defaultOpen={false}>
              <div className="flex items-center gap-1">
                {radiusLinked ? (
                  <div className="flex-1">
                    <N icon="R" value={get("borderRadius") || get("borderTopLeftRadius")} onChange={(v) => { set("borderRadius", v); setRadius("borderTopLeftRadius", v); }} placeholder="0" tip="All corners" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-1 flex-1">
                    <N icon="┌" value={get("borderTopLeftRadius")} onChange={(v) => set("borderTopLeftRadius", v)} placeholder="0" tip="Top Left" />
                    <N icon="┐" value={get("borderTopRightRadius")} onChange={(v) => set("borderTopRightRadius", v)} placeholder="0" tip="Top Right" />
                    <N icon="└" value={get("borderBottomLeftRadius")} onChange={(v) => set("borderBottomLeftRadius", v)} placeholder="0" tip="Bottom Left" />
                    <N icon="┘" value={get("borderBottomRightRadius")} onChange={(v) => set("borderBottomRightRadius", v)} placeholder="0" tip="Bottom Right" />
                  </div>
                )}
                <button onClick={() => setRadiusLinked(!radiusLinked)} className={cn("flex size-6 items-center justify-center rounded border transition-colors shrink-0", radiusLinked ? "border-primary/30 bg-primary/10 text-primary" : "border-sidebar-border text-muted-foreground/40")}>
                  <MIcon name={radiusLinked ? "link" : "link_off"} size={13} />
                </button>
              </div>
            </Section>
          )}

          {/* ─── 4. Flex Layout (Penpot: layout-container-menu) ─── */}
          {!isSimple && (
            <Section title="Layout" icon="grid_view">
              <div className="space-y-2">
                <SelectField label="" value={get("display")} options={selectOptions.display} onChange={(v) => set("display", v)} />
                {/* Direction + Wrap — Penpot: icon row + wrap toggle */}
                <div className="flex gap-1">
                  <div className="flex-1"><IconToggle value={get("flexDirection")} options={directionOpts} onChange={(v) => set("flexDirection", v)} /></div>
                  <button onClick={() => set("flexWrap", get("flexWrap") === "wrap" ? "nowrap" : "wrap")} className={cn("flex size-6 items-center justify-center rounded border transition-colors shrink-0", get("flexWrap") === "wrap" ? "border-primary/30 bg-primary/10 text-primary" : "border-sidebar-border text-muted-foreground/40")}>
                    <MIcon name="wrap_text" size={13} />
                  </button>
                </div>
                {/* Justify + Align — Penpot: two icon toggle rows */}
                <IconToggle value={get("justifyContent")} options={justifyOpts} onChange={(v) => set("justifyContent", v)} />
                <IconToggle value={get("alignItems")} options={alignOpts} onChange={(v) => set("alignItems", v)} />
                {/* Gap — Penpot: single input */}
                <N icon="⊟" value={get("gap")} onChange={(v) => set("gap", v)} placeholder="0" tip="Gap between children" />
                {/* Padding — Penpot: linked/unlinked */}
                <div className="flex items-center gap-1">
                  {padLinked ? (
                    <div className="flex-1"><N icon="⊞" value={get("paddingTop")} onChange={(v) => setPad("paddingTop", v)} placeholder="0" tip="Padding (all)" /></div>
                  ) : (
                    <div className="grid grid-cols-4 gap-1 flex-1">
                      <N icon="↑" value={get("paddingTop")} onChange={(v) => set("paddingTop", v)} placeholder="0" tip="Top" />
                      <N icon="→" value={get("paddingRight")} onChange={(v) => set("paddingRight", v)} placeholder="0" tip="Right" />
                      <N icon="↓" value={get("paddingBottom")} onChange={(v) => set("paddingBottom", v)} placeholder="0" tip="Bottom" />
                      <N icon="←" value={get("paddingLeft")} onChange={(v) => set("paddingLeft", v)} placeholder="0" tip="Left" />
                    </div>
                  )}
                  <button onClick={() => setPadLinked(!padLinked)} className={cn("flex size-6 items-center justify-center rounded border transition-colors shrink-0", padLinked ? "border-primary/30 bg-primary/10 text-primary" : "border-sidebar-border text-muted-foreground/40")}>
                    <MIcon name={padLinked ? "link" : "link_off"} size={13} />
                  </button>
                </div>
                {/* Overflow */}
                <SelectField label="" value={get("overflow")} options={selectOptions.overflow} onChange={(v) => set("overflow", v)} />
              </div>
            </Section>
          )}

          {/* ─── 5. Typography (Penpot: text-menu) ─── */}
          {isText && (
            <Section title="Typography" icon="text_fields">
              <div className="space-y-2">
                <Select value={get("fontFamily") || "Inter"} onValueChange={(v) => { set("fontFamily", v); const link = document.createElement("link"); link.rel = "stylesheet"; link.href = `https://fonts.googleapis.com/css2?family=${v.replace(/ /g, "+")}&display=swap`; document.head.appendChild(link); }}>
                  <SelectTrigger className="h-6 text-[10px]"><SelectValue /></SelectTrigger>
                  <SelectContent>{fonts.map((f) => <SelectItem key={f} value={f} className="text-xs" style={{ fontFamily: f }}>{f}</SelectItem>)}</SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-1">
                  <N icon="Sz" value={get("fontSize")} onChange={(v) => set("fontSize", v)} placeholder="16px" tip="Font Size" />
                  <Select value={get("fontWeight") || "400"} onValueChange={(v) => set("fontWeight", v)}>
                    <SelectTrigger className="h-6 text-[10px]"><SelectValue /></SelectTrigger>
                    <SelectContent>{["100","200","300","400","500","600","700","800","900"].map((w) => <SelectItem key={w} value={w} className="text-xs">{w}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <N icon="Lh" value={get("lineHeight")} onChange={(v) => set("lineHeight", v)} placeholder="1.5" tip="Line Height" />
                  <N icon="Ls" value={get("letterSpacing")} onChange={(v) => set("letterSpacing", v)} placeholder="0" tip="Letter Spacing" />
                </div>
                <ColorField label="" value={get("color")} onChange={(v) => set("color", v)} />
                <IconToggle value={get("textAlign")} options={textAlignOpts} onChange={(v) => set("textAlign", v)} />
                <div className="grid grid-cols-2 gap-1">
                  <IconToggle value={get("fontStyle")} options={fontStyleOpts} onChange={(v) => set("fontStyle", v)} />
                  <IconToggle value={get("textDecoration")} options={textDecoOpts} onChange={(v) => set("textDecoration", v)} />
                </div>
              </div>
            </Section>
          )}

          {/* ─── 6. Fill (Penpot: fill-menu) ─── */}
          {!isSimple && (
            <Section title="Fill" icon="format_color_fill">
              <div className="space-y-2">
                <ColorField label="" value={get("backgroundColor")} onChange={(v) => set("backgroundColor", v)} />
                <div className="grid grid-cols-2 gap-1">
                  <N icon="🖼" value={get("backgroundImage")} onChange={(v) => set("backgroundImage", v)} placeholder="url()" tip="Background Image" />
                  <SelectField label="" value={get("backgroundSize")} options={selectOptions.backgroundSize} onChange={(v) => set("backgroundSize", v)} />
                </div>
              </div>
            </Section>
          )}

          {/* ─── 7. Stroke (Penpot: stroke-menu) ─── */}
          {!isSimple && !isBody && (
            <Section title="Stroke" icon="border_style" defaultOpen={false}>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-1">
                  <ColorField label="" value={get("borderColor")} onChange={(v) => set("borderColor", v)} />
                  <N icon="W" value={get("borderWidth")} onChange={(v) => set("borderWidth", v)} placeholder="0" tip="Stroke Width" />
                </div>
                <IconToggle value={get("borderStyle")} options={borderStyleOpts} onChange={(v) => set("borderStyle", v)} />
              </div>
            </Section>
          )}

          {/* ─── 8. Shadow (Penpot: shadow-menu) ─── */}
          {!isSimple && !isBody && (
            <Section title="Shadow" icon="blur_on" defaultOpen={!!get("boxShadow")}>
              <div className="space-y-2">
                <Input value={get("boxShadow")} onChange={(e) => set("boxShadow", e.target.value)} className="h-6 text-[10px]" placeholder="0 2px 4px rgba(0,0,0,.1)" />
                {!get("boxShadow") && (
                  <button onClick={() => set("boxShadow", "0 2px 8px rgba(0,0,0,0.1)")} className="w-full h-6 rounded border border-dashed border-sidebar-border text-[10px] text-muted-foreground/50 hover:border-primary hover:text-primary transition-colors">+ Add shadow</button>
                )}
              </div>
            </Section>
          )}

          {/* ─── 9. Blur (Penpot: blur-menu) ─── */}
          {!isSimple && !isBody && (
            <Section title="Blur" icon="blur_on" defaultOpen={false}>
              <N icon="B" value={get("filter")?.replace("blur(", "").replace(")", "") || ""} onChange={(v) => set("filter", v ? `blur(${v})` : "")} placeholder="0px" tip="Blur amount" />
            </Section>
          )}

          {/* ─── 10. Quick Columns (our addition for row containers) ─── */}
          {Array.isArray(selected.content) && (get("flexDirection") === "row" || get("flexDirection") === "row-reverse") && (
            <Section title="Columns" icon="view_column">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((n) => (
                  <button key={n} onClick={() => {
                    const cols = selected.content as El[];
                    if (n === cols.length) return;
                    if (n > cols.length) {
                      let updated = selected;
                      for (let i = cols.length; i < n; i++) {
                        const col: El = { id: crypto.randomUUID(), type: "column", name: `Col ${i + 1}`, styles: { display: "flex", flexDirection: "column", gap: "8px", flex: "1", padding: "8px" }, content: [] };
                        updated = { ...updated, content: [...(updated.content as El[]), col] };
                      }
                      onUpdate(updated);
                    } else onUpdate({ ...selected, content: cols.slice(0, n) });
                  }} className={cn("flex-1 h-7 rounded border text-[10px] font-medium transition-colors", (selected.content as El[]).length === n ? "bg-primary text-primary-foreground border-primary" : "border-sidebar-border hover:bg-sidebar-accent")}>{n}</button>
                ))}
              </div>
            </Section>
          )}

          </TooltipProvider>
        </div>
      )}

      {/* ── Content Tab ── */}
      {propsTab === "content" && (
        <div className="flex-1 overflow-y-auto p-3">
          {!Array.isArray(selected.content) && Object.keys(selected.content as Record<string, string>).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(selected.content as Record<string, string>).map(([key, val]) => {
                const setVal = (v: string) => onUpdate({ ...selected, content: { ...(selected.content as Record<string, string>), [key]: v } });
                if (key === "innerText") return (
                  <div key={key}>
                    <label className="mb-0.5 block text-[10px] text-sidebar-foreground/50">Text</label>
                    <textarea value={val} onChange={(e) => setVal(e.target.value)} className="w-full rounded border border-sidebar-border bg-transparent p-2 text-xs outline-none resize-y focus:border-primary min-h-[48px]" rows={3} />
                  </div>
                );
                if (key === "src") return (
                  <div key={key}>
                    <Field label="Source" value={val} onChange={setVal} placeholder="https://..." />
                    {val && <img src={val} alt="" className="mt-1 rounded border border-sidebar-border max-h-16 w-full object-cover" />}
                  </div>
                );
                return <Field key={key} label={key} value={val} onChange={setVal} />;
              })}
            </div>
          ) : Array.isArray(selected.content) ? (
            <div className="py-8 text-center">
              <MIcon name="dashboard_customize" size={24} className="text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-[10px] text-muted-foreground/50">Container — {(selected.content as El[]).length} children</p>
            </div>
          ) : (
            <div className="py-8 text-center">
              <MIcon name="block" size={24} className="text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-[10px] text-muted-foreground/50">No editable content</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
