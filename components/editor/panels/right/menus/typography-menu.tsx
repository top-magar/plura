"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Section, ColorField, IconToggle, textAlignOpts, fontStyleOpts, textDecoOpts, type StyleProps } from "../shared";
import { MIcon } from "../../../ui/m-icon";
import { N } from "./measures-menu";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const fonts = ["Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Raleway", "Nunito", "Playfair Display", "Merriweather", "Source Code Pro", "Fira Code", "DM Sans", "Space Grotesk", "Outfit", "Geist"];

const weights = [
  { value: "100", label: "Thin" }, { value: "200", label: "Extra Light" },
  { value: "300", label: "Light" }, { value: "400", label: "Regular" },
  { value: "500", label: "Medium" }, { value: "600", label: "Semi Bold" },
  { value: "700", label: "Bold" }, { value: "800", label: "Extra Bold" },
  { value: "900", label: "Black" },
];

const loadedFonts = new Set<string>();
function loadFont(family: string) {
  if (loadedFonts.has(family)) return;
  loadedFonts.add(family);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}&display=swap`;
  document.head.appendChild(link);
}

export function TypographyMenu({ get, set }: StyleProps) {
  return (
    <TooltipProvider delayDuration={200}>
    <Section title="Typography" icon="text_fields">
      <div className="space-y-1.5">
        {/* Font family */}
        <Select value={get("fontFamily") || "Inter"} onValueChange={(v) => { set("fontFamily", v); loadFont(v); }}>
          <SelectTrigger className="h-5 text-[10px]"><SelectValue /></SelectTrigger>
          <SelectContent>{fonts.map((f) => <SelectItem key={f} value={f} className="text-xs" style={{ fontFamily: f }}>{f}</SelectItem>)}</SelectContent>
        </Select>

        {/* Size + Weight */}
        <div className="grid grid-cols-2 gap-1">
          <N icon="Sz" value={get("fontSize")?.replace("px", "")} onChange={(v) => set("fontSize", /^\d+$/.test(v) ? `${v}px` : v)} placeholder="16" tip="Font size" />
          <Select value={get("fontWeight") || "400"} onValueChange={(v) => set("fontWeight", v)}>
            <SelectTrigger className="h-5 text-[10px]"><SelectValue /></SelectTrigger>
            <SelectContent>{weights.map((w) => <SelectItem key={w.value} value={w.value} className="text-xs"><span className="font-mono text-[9px] text-muted-foreground/40 mr-1">{w.value}</span>{w.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        {/* Line height + Letter spacing */}
        <div className="grid grid-cols-2 gap-1">
          <N icon="Lh" value={get("lineHeight")} onChange={(v) => set("lineHeight", v)} placeholder="1.5" tip="Line height" />
          <N icon="Ls" value={get("letterSpacing")?.replace("px", "")} onChange={(v) => set("letterSpacing", /^\d+$/.test(v) ? `${v}px` : v)} placeholder="0" tip="Letter spacing" />
        </div>

        {/* Color */}
        <div>
          <span className="text-[9px] text-muted-foreground/30 mb-0.5 block">Color</span>
          <ColorField label="" value={get("color")} onChange={(v) => set("color", v)} />
        </div>

        {/* Align */}
        <IconToggle value={get("textAlign")} options={textAlignOpts} onChange={(v) => set("textAlign", v)} />

        {/* Style + Decoration */}
        <div className="grid grid-cols-2 gap-1">
          <IconToggle value={get("fontStyle")} options={fontStyleOpts} onChange={(v) => set("fontStyle", v)} />
          <IconToggle value={get("textDecoration")} options={textDecoOpts} onChange={(v) => set("textDecoration", v)} />
        </div>

        {/* Text transform */}
        <div>
          <span className="text-[9px] text-muted-foreground/30 mb-0.5 block">Transform</span>
          <div className="flex gap-0.5 rounded-md border border-sidebar-border p-0.5">
            {([["none", "—"], ["uppercase", "AA"], ["lowercase", "aa"], ["capitalize", "Aa"]] as const).map(([val, label]) => (
              <button key={val} onClick={() => set("textTransform", val)} className={cn("flex-1 h-5 rounded text-[9px] font-medium transition-colors", (get("textTransform") || "none") === val ? "bg-primary text-primary-foreground" : "text-muted-foreground/50 hover:text-foreground")}>{label}</button>
            ))}
          </div>
        </div>
      </div>
    </Section>
    </TooltipProvider>
  );
}
