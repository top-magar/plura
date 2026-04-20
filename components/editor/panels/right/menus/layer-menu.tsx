"use client";

import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Section, type StyleProps } from "../shared";

const blendModes = ["normal","multiply","screen","overlay","darken","lighten","color-dodge","color-burn","hard-light","soft-light","difference","exclusion"];

export function LayerMenu({ get, set }: StyleProps) {
  return (
    <Section title="Layer" icon="layers" defaultOpen={false}>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Slider value={[parseFloat(get("opacity") || "1")]} min={0} max={1} step={0.01} onValueChange={([v]) => set("opacity", String(v))} className="flex-1" />
          <span className="text-[9px] w-7 text-right text-muted-foreground/50 tabular-nums">{Math.round(parseFloat(get("opacity") || "1") * 100)}%</span>
        </div>
        <Select value={get("mixBlendMode") || "normal"} onValueChange={(v) => set("mixBlendMode", v)}>
          <SelectTrigger className="h-6 text-[10px]"><SelectValue /></SelectTrigger>
          <SelectContent>{blendModes.map((m) => <SelectItem key={m} value={m} className="text-xs capitalize">{m}</SelectItem>)}</SelectContent>
        </Select>
      </div>
    </Section>
  );
}
