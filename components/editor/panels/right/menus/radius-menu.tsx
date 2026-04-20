"use client";

import { useState } from "react";
import { MIcon } from "../../../ui/m-icon";
import { Section, type StyleProps } from "../shared";
import { N } from "./measures-menu";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

export function RadiusMenu({ get, set }: StyleProps) {
  const [linked, setLinked] = useState(true);
  const setAll = (v: string) => { set("borderRadius", v); set("borderTopLeftRadius", v); set("borderTopRightRadius", v); set("borderBottomRightRadius", v); set("borderBottomLeftRadius", v); };
  return (
    <TooltipProvider delayDuration={200}>
    <Section title="Radius" icon="rounded_corner" defaultOpen={false}>
      <div className="flex items-center gap-1">
        {linked ? (
          <div className="flex-1"><N icon="R" value={get("borderRadius") || get("borderTopLeftRadius")} onChange={setAll} placeholder="0" tip="All corners" /></div>
        ) : (
          <div className="grid grid-cols-2 gap-1 flex-1">
            <N icon="┌" value={get("borderTopLeftRadius")} onChange={(v) => set("borderTopLeftRadius", v)} placeholder="0" tip="Top Left" />
            <N icon="┐" value={get("borderTopRightRadius")} onChange={(v) => set("borderTopRightRadius", v)} placeholder="0" tip="Top Right" />
            <N icon="└" value={get("borderBottomLeftRadius")} onChange={(v) => set("borderBottomLeftRadius", v)} placeholder="0" tip="Bottom Left" />
            <N icon="┘" value={get("borderBottomRightRadius")} onChange={(v) => set("borderBottomRightRadius", v)} placeholder="0" tip="Bottom Right" />
          </div>
        )}
        <button onClick={() => setLinked(!linked)} className={cn("flex size-6 items-center justify-center rounded border transition-colors shrink-0", linked ? "border-primary/30 bg-primary/10 text-primary" : "border-sidebar-border text-muted-foreground/40")}><MIcon name={linked ? "link" : "link_off"} size={13} /></button>
      </div>
    </Section>
    </TooltipProvider>
  );
}
