"use client";

import { useState } from "react";
import { MIcon } from "../../ui/m-icon";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { El } from "../../core/types";
import { cn } from "@/lib/utils";
import { Section, ColorField, IconToggle, SelectField, Field, selectOptions, justifyOpts, alignOpts, directionOpts, borderStyleOpts, textAlignOpts, fontStyleOpts, textDecoOpts, type StyleProps } from "./shared";

const fonts = ["Inter","Roboto","Open Sans","Lato","Montserrat","Poppins","Raleway","Nunito","Playfair Display","Merriweather","Source Code Pro","Fira Code","DM Sans","Space Grotesk","Outfit","Geist"];

const textTypes = new Set(["text","heading","subheading","quote","code","list","badge","icon","footer"]);
const simpleTypes = new Set(["divider","spacer"]);

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

export default function DesignTab({ get, set, selected, onUpdate }: StyleProps & { selected: El; onUpdate: (el: El) => void }) {
  const isText = textTypes.has(selected.type) || selected.type === "button" || selected.type === "link" || selected.type === "navbar";
  const isSimple = simpleTypes.has(selected.type);
  const isBody = selected.type === "__body";
  const [padLinked, setPadLinked] = useState(true);
  const [radiusLinked, setRadiusLinked] = useState(true);

  const setRadius = (corner: string, v: string) => {
    if (radiusLinked) { set("borderTopLeftRadius", v); set("borderTopRightRadius", v); set("borderBottomRightRadius", v); set("borderBottomLeftRadius", v); }
    else set(corner, v);
  };
  const setPad = (side: string, v: string) => {
    if (padLinked) { set("paddingTop", v); set("paddingRight", v); set("paddingBottom", v); set("paddingLeft", v); }
    else set(side, v);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <TooltipProvider delayDuration={200}>

      {/* Layer */}
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

      {/* Size */}
      {!isSimple && (
        <Section title="Size" icon="straighten">
          <div className="space-y-2">
            <IconToggle
              value={get("width") === "fit-content" ? "hug" : get("width") === "100%" || get("flex") === "1" ? "fill" : "fixed"}
              options={[
                { value: "hug", label: "Hug content", icon: <MIcon name="fit_screen" size={14} /> },
                { value: "fill", label: "Fill container", icon: <MIcon name="expand" size={14} /> },
                { value: "fixed", label: "Fixed size", icon: <MIcon name="width" size={14} /> },
              ]}
              onChange={(v) => { if (v === "hug") { set("width", "fit-content"); set("flex", ""); } else if (v === "fill") { set("width", "100%"); set("flex", ""); } else { set("width", "auto"); set("flex", ""); } }}
            />
            <div className="grid grid-cols-2 gap-1">
              <N icon="W" value={get("width")} onChange={(v) => set("width", v)} tip="Width" />
              <N icon="H" value={get("height")} onChange={(v) => set("height", v)} tip="Height" />
            </div>
            <div className="grid grid-cols-2 gap-1">
              <N icon="↕" value={get("minHeight")} onChange={(v) => set("minHeight", v)} placeholder="—" tip="Min Height" />
              <N icon="↔" value={get("maxWidth")} onChange={(v) => set("maxWidth", v)} placeholder="—" tip="Max Width" />
            </div>
          </div>
        </Section>
      )}

      {/* Radius */}
      {!isSimple && !isBody && (
        <Section title="Radius" icon="rounded_corner" defaultOpen={false}>
          <div className="flex items-center gap-1">
            {radiusLinked ? (
              <div className="flex-1"><N icon="R" value={get("borderRadius") || get("borderTopLeftRadius")} onChange={(v) => { set("borderRadius", v); setRadius("borderTopLeftRadius", v); }} placeholder="0" tip="All corners" /></div>
            ) : (
              <div className="grid grid-cols-2 gap-1 flex-1">
                <N icon="┌" value={get("borderTopLeftRadius")} onChange={(v) => set("borderTopLeftRadius", v)} placeholder="0" tip="Top Left" />
                <N icon="┐" value={get("borderTopRightRadius")} onChange={(v) => set("borderTopRightRadius", v)} placeholder="0" tip="Top Right" />
                <N icon="└" value={get("borderBottomLeftRadius")} onChange={(v) => set("borderBottomLeftRadius", v)} placeholder="0" tip="Bottom Left" />
                <N icon="┘" value={get("borderBottomRightRadius")} onChange={(v) => set("borderBottomRightRadius", v)} placeholder="0" tip="Bottom Right" />
              </div>
            )}
            <button onClick={() => setRadiusLinked(!radiusLinked)} className={cn("flex size-6 items-center justify-center rounded border transition-colors shrink-0", radiusLinked ? "border-primary/30 bg-primary/10 text-primary" : "border-sidebar-border text-muted-foreground/40")}><MIcon name={radiusLinked ? "link" : "link_off"} size={13} /></button>
          </div>
        </Section>
      )}

      {/* Layout (flex/grid) */}
      {!isSimple && (() => {
        const layoutType = get("display") === "grid" ? "grid" : get("display") === "flex" ? "flex" : null;
        const isCol = get("flexDirection") === "column" || get("flexDirection") === "column-reverse";
        const isWrap = get("flexWrap") === "wrap";
        return (
        <Section title="Layout" icon="grid_view">
          <div className="space-y-2">
            <div className="flex gap-1">
              {(["flex","grid","block"] as const).map((t) => (
                <button key={t} onClick={() => { set("display", t === "block" ? "block" : t); if (t === "grid" && !get("gridTemplateColumns")) set("gridTemplateColumns", "1fr 1fr"); }} className={cn("flex-1 h-6 rounded border text-[10px] font-medium capitalize transition-colors", (t === "block" && !layoutType) || get("display") === t ? "bg-primary text-primary-foreground border-primary" : "border-sidebar-border text-muted-foreground/60 hover:text-foreground")}>{t}</button>
              ))}
              {layoutType && <Tooltip><TooltipTrigger asChild><button onClick={() => { set("display", "block"); set("flexDirection", ""); set("gridTemplateColumns", ""); set("gridTemplateRows", ""); }} className="flex size-6 items-center justify-center rounded border border-sidebar-border text-muted-foreground/40 hover:text-destructive transition-colors shrink-0"><MIcon name="close" size={12} /></button></TooltipTrigger><TooltipContent className="text-[10px]">Remove layout</TooltipContent></Tooltip>}
            </div>
            {layoutType === "flex" && (<>
              <div className="flex gap-1">
                <div className="flex-1"><IconToggle value={get("flexDirection")} options={directionOpts} onChange={(v) => set("flexDirection", v)} /></div>
                <button onClick={() => set("flexWrap", isWrap ? "nowrap" : "wrap")} className={cn("flex size-6 items-center justify-center rounded border transition-colors shrink-0", isWrap ? "border-primary/30 bg-primary/10 text-primary" : "border-sidebar-border text-muted-foreground/40")}><MIcon name="wrap_text" size={13} /></button>
              </div>
              <div><span className="text-[9px] text-muted-foreground/40 mb-0.5 block">Align</span><IconToggle value={get("alignItems")} options={alignOpts} onChange={(v) => set("alignItems", v)} /></div>
              <div><span className="text-[9px] text-muted-foreground/40 mb-0.5 block">Justify</span><IconToggle value={get("justifyContent")} options={justifyOpts} onChange={(v) => set("justifyContent", v)} /></div>
              {isWrap && <div><span className="text-[9px] text-muted-foreground/40 mb-0.5 block">Align content</span><IconToggle value={get("alignContent")} options={justifyOpts} onChange={(v) => set("alignContent", v)} /></div>}
              <div className="grid grid-cols-2 gap-1">
                <N icon="↕" value={get("rowGap") || get("gap")} onChange={(v) => set("rowGap", v)} placeholder="0" tip="Row gap" disabled={!isWrap && !isCol} />
                <N icon="↔" value={get("columnGap") || get("gap")} onChange={(v) => set("columnGap", v)} placeholder="0" tip="Column gap" disabled={!isWrap && isCol} />
              </div>
            </>)}
            {layoutType === "grid" && (<>
              <IconToggle value={get("gridAutoFlow") || "row"} options={[{ value: "row", label: "Row", icon: <MIcon name="arrow_forward" size={14} /> }, { value: "column", label: "Column", icon: <MIcon name="arrow_downward" size={14} /> }]} onChange={(v) => set("gridAutoFlow", v)} />
              <div><span className="text-[9px] text-muted-foreground/40 mb-0.5 block">Align items</span><IconToggle value={get("alignItems")} options={alignOpts} onChange={(v) => set("alignItems", v)} /></div>
              <div><span className="text-[9px] text-muted-foreground/40 mb-0.5 block">Justify items</span><IconToggle value={get("justifyItems") || "stretch"} options={[{ value: "start", label: "Start", icon: <MIcon name="align_horizontal_left" size={14} /> }, { value: "center", label: "Center", icon: <MIcon name="align_horizontal_center" size={14} /> }, { value: "end", label: "End", icon: <MIcon name="align_horizontal_right" size={14} /> }, { value: "stretch", label: "Stretch", icon: <MIcon name="expand" size={14} /> }]} onChange={(v) => set("justifyItems", v)} /></div>
              <div className="grid grid-cols-2 gap-1">
                <N icon="↕" value={get("rowGap") || get("gap")} onChange={(v) => set("rowGap", v)} placeholder="0" tip="Row gap" />
                <N icon="↔" value={get("columnGap") || get("gap")} onChange={(v) => set("columnGap", v)} placeholder="0" tip="Column gap" />
              </div>
              <div><span className="text-[9px] text-muted-foreground/40 mb-0.5 block">Columns</span><Input value={get("gridTemplateColumns")} onChange={(e) => set("gridTemplateColumns", e.target.value)} className="h-6 text-[10px] font-mono" placeholder="1fr 1fr" /><div className="flex gap-0.5 mt-1 flex-wrap">{["1fr","1fr 1fr","1fr 1fr 1fr","1fr 2fr","repeat(3, 1fr)"].map((p) => <button key={p} onClick={() => set("gridTemplateColumns", p)} className={cn("h-5 px-1.5 rounded border text-[8px] font-mono transition-colors", get("gridTemplateColumns") === p ? "bg-primary/10 border-primary/30 text-primary" : "border-sidebar-border text-muted-foreground/50 hover:text-foreground")}>{p}</button>)}</div></div>
              <div><span className="text-[9px] text-muted-foreground/40 mb-0.5 block">Rows</span><Input value={get("gridTemplateRows")} onChange={(e) => set("gridTemplateRows", e.target.value)} className="h-6 text-[10px] font-mono" placeholder="auto" /></div>
            </>)}
            {layoutType && (
              <div className="flex items-center gap-1">
                {padLinked ? (
                  <div className="grid grid-cols-2 gap-1 flex-1">
                    <N icon="↕" value={get("paddingTop")} onChange={(v) => { set("paddingTop", v); set("paddingBottom", v); }} placeholder="0" tip="Vertical" />
                    <N icon="↔" value={get("paddingRight")} onChange={(v) => { set("paddingRight", v); set("paddingLeft", v); }} placeholder="0" tip="Horizontal" />
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-1 flex-1">
                    <N icon="↑" value={get("paddingTop")} onChange={(v) => set("paddingTop", v)} placeholder="0" tip="Top" />
                    <N icon="→" value={get("paddingRight")} onChange={(v) => set("paddingRight", v)} placeholder="0" tip="Right" />
                    <N icon="↓" value={get("paddingBottom")} onChange={(v) => set("paddingBottom", v)} placeholder="0" tip="Bottom" />
                    <N icon="←" value={get("paddingLeft")} onChange={(v) => set("paddingLeft", v)} placeholder="0" tip="Left" />
                  </div>
                )}
                <button onClick={() => setPadLinked(!padLinked)} className={cn("flex size-6 items-center justify-center rounded border transition-colors shrink-0", padLinked ? "border-primary/30 bg-primary/10 text-primary" : "border-sidebar-border text-muted-foreground/40")}><MIcon name={padLinked ? "link" : "link_off"} size={13} /></button>
              </div>
            )}
            <SelectField label="" value={get("overflow")} options={selectOptions.overflow} onChange={(v) => set("overflow", v)} />
          </div>
        </Section>
        );
      })()}

      {/* Typography */}
      {isText && (
        <Section title="Typography" icon="text_fields">
          <div className="space-y-2">
            <Select value={get("fontFamily") || "Inter"} onValueChange={(v) => { set("fontFamily", v); const link = document.createElement("link"); link.rel = "stylesheet"; link.href = `https://fonts.googleapis.com/css2?family=${v.replace(/ /g, "+")}&display=swap`; document.head.appendChild(link); }}>
              <SelectTrigger className="h-6 text-[10px]"><SelectValue /></SelectTrigger>
              <SelectContent>{fonts.map((f) => <SelectItem key={f} value={f} className="text-xs" style={{ fontFamily: f }}>{f}</SelectItem>)}</SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-1">
              <N icon="Sz" value={get("fontSize")} onChange={(v) => set("fontSize", v)} placeholder="16px" tip="Font Size" />
              <Select value={get("fontWeight") || "400"} onValueChange={(v) => set("fontWeight", v)}><SelectTrigger className="h-6 text-[10px]"><SelectValue /></SelectTrigger><SelectContent>{["100","200","300","400","500","600","700","800","900"].map((w) => <SelectItem key={w} value={w} className="text-xs">{w}</SelectItem>)}</SelectContent></Select>
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

      {/* Fill */}
      {!isSimple && (
        <Section title="Fill" icon="format_color_fill">
          <div className="space-y-2">
            {/* Fill type toggle: solid / linear / radial */}
            <div className="flex gap-1">
              {(["solid", "linear", "radial"] as const).map((t) => {
                const current = get("backgroundImage")?.startsWith("linear-gradient") ? "linear" : get("backgroundImage")?.startsWith("radial-gradient") ? "radial" : "solid";
                return (
                  <button key={t} onClick={() => {
                    if (t === "solid") { set("backgroundImage", ""); }
                    else if (t === "linear") { set("backgroundImage", `linear-gradient(180deg, ${get("backgroundColor") || "#6366f1"}, #000000)`); }
                    else { set("backgroundImage", `radial-gradient(circle, ${get("backgroundColor") || "#6366f1"}, #000000)`); }
                  }} className={cn("flex-1 h-6 rounded border text-[9px] font-medium capitalize transition-colors", current === t ? "bg-primary text-primary-foreground border-primary" : "border-sidebar-border text-muted-foreground/60 hover:text-foreground")}>{t}</button>
                );
              })}
            </div>
            <ColorField label="" value={get("backgroundColor")} onChange={(v) => set("backgroundColor", v)} />
            {/* Gradient angle (linear only) */}
            {get("backgroundImage")?.startsWith("linear-gradient") && (
              <N icon="∠" value={get("backgroundImage")?.match(/(\d+)deg/)?.[1] || "180"} onChange={(v) => {
                const stops = get("backgroundImage").replace(/linear-gradient\([^,]+,/, "").replace(/\)$/, "");
                set("backgroundImage", `linear-gradient(${v}deg,${stops})`);
              }} placeholder="180" tip="Gradient angle (deg)" />
            )}
            {/* Background image URL (when not gradient) */}
            {!get("backgroundImage")?.includes("gradient") && (
              <div className="grid grid-cols-2 gap-1">
                <N icon="🖼" value={get("backgroundImage")} onChange={(v) => set("backgroundImage", v)} placeholder="url()" tip="Background Image" />
                <SelectField label="" value={get("backgroundSize")} options={selectOptions.backgroundSize} onChange={(v) => set("backgroundSize", v)} />
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Stroke */}
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

      {/* Shadow */}
      {!isSimple && !isBody && (
        <Section title="Shadow" icon="blur_on" defaultOpen={!!get("boxShadow")}>
          <div className="space-y-2">
            <Input value={get("boxShadow")} onChange={(e) => set("boxShadow", e.target.value)} className="h-6 text-[10px]" placeholder="0 2px 4px rgba(0,0,0,.1)" />
            {!get("boxShadow") && <button onClick={() => set("boxShadow", "0 2px 8px rgba(0,0,0,0.1)")} className="w-full h-6 rounded border border-dashed border-sidebar-border text-[10px] text-muted-foreground/50 hover:border-primary hover:text-primary transition-colors">+ Add shadow</button>}
          </div>
        </Section>
      )}

      {/* Blur */}
      {!isSimple && !isBody && (
        <Section title="Blur" icon="blur_on" defaultOpen={false}>
          <N icon="B" value={get("filter")?.replace("blur(", "").replace(")", "") || ""} onChange={(v) => set("filter", v ? `blur(${v})` : "")} placeholder="0px" tip="Blur amount" />
        </Section>
      )}

      {/* Columns */}
      {Array.isArray(selected.content) && (get("flexDirection") === "row" || get("flexDirection") === "row-reverse") && (
        <Section title="Columns" icon="view_column">
          <div className="flex gap-1">
            {[1,2,3,4].map((n) => (
              <button key={n} onClick={() => {
                const cols = selected.content as El[];
                if (n === cols.length) return;
                if (n > cols.length) { let u = selected; for (let i = cols.length; i < n; i++) { u = { ...u, content: [...(u.content as El[]), { id: crypto.randomUUID(), type: "column", name: `Col ${i+1}`, styles: { display: "flex", flexDirection: "column", gap: "8px", flex: "1", padding: "8px" }, content: [] }] }; } onUpdate(u); }
                else onUpdate({ ...selected, content: cols.slice(0, n) });
              }} className={cn("flex-1 h-7 rounded border text-[10px] font-medium transition-colors", (selected.content as El[]).length === n ? "bg-primary text-primary-foreground border-primary" : "border-sidebar-border hover:bg-sidebar-accent")}>{n}</button>
            ))}
          </div>
        </Section>
      )}

      </TooltipProvider>
    </div>
  );
}
