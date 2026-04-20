"use client";

import { MIcon } from "../../ui/m-icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Section, ColorField, IconToggle, textAlignOpts, fontStyleOpts, textDecoOpts, textTransOpts, type StyleProps } from "./shared";

const fonts = ["Inter","Roboto","Open Sans","Lato","Montserrat","Poppins","Raleway","Nunito","Playfair Display","Merriweather","Source Sans 3","DM Sans","Space Grotesk","Outfit","Sora","Geist"];

export default function TypographySection({ get, set }: StyleProps) {
  return (
    <Section title="Typography" icon="text_fields">
      <div className="space-y-2">
        <Select value={get("fontFamily") || undefined} onValueChange={(v) => {
          set("fontFamily", v);
          if (typeof document !== 'undefined' && !document.querySelector(`link[data-font="${v}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `https://fonts.googleapis.com/css2?family=${v.replace(/\s+/g, '+')}&display=swap`;
            link.setAttribute('data-font', v);
            document.head.appendChild(link);
          }
        }}>
          <SelectTrigger className="h-6 text-[10px] px-2"><SelectValue placeholder="Default font" /></SelectTrigger>
          <SelectContent className="max-h-60">
            {fonts.map((f) => <SelectItem key={f} value={f} className="text-xs" style={{ fontFamily: f }}>{f}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="grid grid-cols-4 gap-1">
          {([["fontSize","format_size","16px"],["fontWeight","line_weight","400"],["lineHeight","format_line_spacing","1.5"],["letterSpacing","space_bar","0"]] as const).map(([p, ic, ph]) => (
            <Tooltip key={p}><TooltipTrigger asChild>
              <div className="relative">
                <MIcon name={ic} size={10} className="absolute left-1 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                <Input value={get(p)} onChange={(e) => set(p, e.target.value)} className="h-6 text-[10px] pl-5 text-center" placeholder={ph} />
              </div>
            </TooltipTrigger><TooltipContent className="text-[10px]">{{fontSize:"Font Size",fontWeight:"Weight",lineHeight:"Line Height",letterSpacing:"Spacing"}[p]}</TooltipContent></Tooltip>
          ))}
        </div>
        <ColorField label="Color" value={get("color")} onChange={(v) => set("color", v)} />
        <div className="grid grid-cols-2 gap-1">
          <IconToggle value={get("textAlign")} options={textAlignOpts} onChange={(v) => set("textAlign", v)} />
          <IconToggle value={get("textTransform")} options={textTransOpts} onChange={(v) => set("textTransform", v)} />
          <IconToggle value={get("fontStyle")} options={fontStyleOpts} onChange={(v) => set("fontStyle", v)} />
          <IconToggle value={get("textDecoration")} options={textDecoOpts} onChange={(v) => set("textDecoration", v)} />
        </div>
      </div>
    </Section>
  );
}
