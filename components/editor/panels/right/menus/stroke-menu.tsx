"use client";

import { useState } from "react";
import { MIcon } from "../../../ui/m-icon";
import { Section, ColorField, IconToggle, borderStyleOpts, type StyleProps } from "../shared";
import { N } from "./measures-menu";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function StrokeMenu({ get, set }: StyleProps) {
  const hasStroke = get("borderStyle") && get("borderStyle") !== "none";
  const [perSide, setPerSide] = useState(false);

  const toggle = () => {
    if (hasStroke) { set("borderStyle", "none"); set("borderWidth", "0"); }
    else { set("borderStyle", "solid"); set("borderWidth", "1px"); set("borderColor", get("borderColor") || "#d4d4d8"); }
  };

  const setWidth = (prop: string, v: string) => set(prop, /^\d+$/.test(v) ? `${v}px` : v);

  return (
    <TooltipProvider delayDuration={200}>
    <Section title="Stroke" icon="border_style" defaultOpen={false} action={
      <button onClick={toggle} className={cn("size-4 flex items-center justify-center rounded transition-colors", hasStroke ? "text-primary" : "text-muted-foreground/30")}>
        <MIcon name={hasStroke ? "visibility" : "visibility_off"} size={11} />
      </button>
    }>
      <div className="space-y-1.5">
        {/* Style */}
        <IconToggle value={get("borderStyle") || "none"} options={borderStyleOpts} onChange={(v) => {
          set("borderStyle", v);
          if (v !== "none" && !get("borderWidth")) set("borderWidth", "1px");
        }} />

        {hasStroke && (<>
          {/* Color + Width */}
          <div className="flex items-center gap-1">
            <div className="flex-1">
              <ColorField label="" value={get("borderColor")} onChange={(v) => set("borderColor", v)} />
            </div>
            {!perSide && (
              <div className="w-14 shrink-0">
                <N icon="W" value={get("borderWidth")?.replace("px", "")} onChange={(v) => setWidth("borderWidth", v)} placeholder="1" tip="Width" />
              </div>
            )}
            <button onClick={() => setPerSide(!perSide)} className={cn("flex size-5 items-center justify-center rounded transition-colors shrink-0", perSide ? "text-primary" : "text-muted-foreground/30")} title="Per-side widths">
              <MIcon name={perSide ? "select_all" : "crop_square"} size={11} />
            </button>
          </div>

          {/* Per-side widths */}
          {perSide && (
            <div className="grid grid-cols-4 gap-1">
              <N icon="↑" value={get("borderTopWidth")?.replace("px", "") || get("borderWidth")?.replace("px", "")} onChange={(v) => setWidth("borderTopWidth", v)} placeholder="0" tip="Top" />
              <N icon="→" value={get("borderRightWidth")?.replace("px", "") || get("borderWidth")?.replace("px", "")} onChange={(v) => setWidth("borderRightWidth", v)} placeholder="0" tip="Right" />
              <N icon="↓" value={get("borderBottomWidth")?.replace("px", "") || get("borderWidth")?.replace("px", "")} onChange={(v) => setWidth("borderBottomWidth", v)} placeholder="0" tip="Bottom" />
              <N icon="←" value={get("borderLeftWidth")?.replace("px", "") || get("borderWidth")?.replace("px", "")} onChange={(v) => setWidth("borderLeftWidth", v)} placeholder="0" tip="Left" />
            </div>
          )}
        </>)}
      </div>
    </Section>
    </TooltipProvider>
  );
}
