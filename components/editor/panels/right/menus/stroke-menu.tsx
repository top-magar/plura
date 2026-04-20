"use client";

import { Section, ColorField, IconToggle, borderStyleOpts, type StyleProps } from "../shared";
import { N } from "./measures-menu";
import { TooltipProvider } from "@/components/ui/tooltip";

export function StrokeMenu({ get, set }: StyleProps) {
  return (
    <TooltipProvider delayDuration={200}>
    <Section title="Stroke" icon="border_style" defaultOpen={false}>
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-1">
          <ColorField label="" value={get("borderColor")} onChange={(v) => set("borderColor", v)} />
          <N icon="W" value={get("borderWidth")} onChange={(v) => set("borderWidth", v)} placeholder="0" tip="Width" />
        </div>
        <IconToggle value={get("borderStyle")} options={borderStyleOpts} onChange={(v) => set("borderStyle", v)} />
      </div>
    </Section>
    </TooltipProvider>
  );
}
