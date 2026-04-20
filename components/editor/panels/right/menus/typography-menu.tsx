"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Section, ColorField, IconToggle, textAlignOpts, fontStyleOpts, textDecoOpts, type StyleProps } from "../shared";
import { N } from "./measures-menu";
import { TooltipProvider } from "@/components/ui/tooltip";

const fonts = ["Inter","Roboto","Open Sans","Lato","Montserrat","Poppins","Raleway","Nunito","Playfair Display","Merriweather","Source Code Pro","Fira Code","DM Sans","Space Grotesk","Outfit","Geist"];

export function TypographyMenu({ get, set }: StyleProps) {
  return (
    <TooltipProvider delayDuration={200}>
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
    </TooltipProvider>
  );
}
