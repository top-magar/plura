"use client";

import { useState } from "react";
import { MIcon } from "../../../ui/m-icon";
import { Section, px, type StyleProps } from "../shared";
import { N } from "./measures-menu";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";


function num(v: string): string {
  return String(parseInt(v) || 0);
}

export function RadiusMenu({ get, set }: StyleProps) {
  const [linked, setLinked] = useState(true);

  // Read: individual corners fall back to shorthand
  const br = get("borderRadius");
  const tl = get("borderTopLeftRadius") || br;
  const tr = get("borderTopRightRadius") || br;
  const bl = get("borderBottomLeftRadius") || br;
  const brr = get("borderBottomRightRadius") || br;

  const setAll = (v: string) => set("borderRadius", px(v));

  const setCorner = (prop: string, v: string) => {
    // When unlinking, first expand shorthand to individual corners
    if (!get("borderTopLeftRadius") && br) {
      set("borderTopLeftRadius", br);
      set("borderTopRightRadius", br);
      set("borderBottomLeftRadius", br);
      set("borderBottomRightRadius", br);
    }
    set(prop, px(v));
  };

  return (
    <TooltipProvider delayDuration={200}>
    <Section title="Radius" icon="rounded_corner" defaultOpen={false}>
      <div className="flex items-center gap-1">
        {linked ? (
          <div className="flex-1">
            <N icon="R" value={num(br)} onChange={setAll} placeholder="0" tip="All corners" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1 flex-1">
            <N icon="┌" value={num(tl)} onChange={(v) => setCorner("borderTopLeftRadius", v)} placeholder="0" tip="Top Left" />
            <N icon="┐" value={num(tr)} onChange={(v) => setCorner("borderTopRightRadius", v)} placeholder="0" tip="Top Right" />
            <N icon="└" value={num(bl)} onChange={(v) => setCorner("borderBottomLeftRadius", v)} placeholder="0" tip="Bottom Left" />
            <N icon="┘" value={num(brr)} onChange={(v) => setCorner("borderBottomRightRadius", v)} placeholder="0" tip="Bottom Right" />
          </div>
        )}
        <button onClick={() => {
          if (linked) {
            // Expanding: write shorthand to all corners
            if (br) { set("borderTopLeftRadius", br); set("borderTopRightRadius", br); set("borderBottomLeftRadius", br); set("borderBottomRightRadius", br); }
          }
          setLinked(!linked);
        }} className={cn("flex size-5 items-center justify-center rounded transition-colors shrink-0", linked ? "text-primary" : "text-muted-foreground/30")}>
          <MIcon name={linked ? "link" : "link_off"} size={11} />
        </button>
      </div>
    </Section>
    </TooltipProvider>
  );
}
