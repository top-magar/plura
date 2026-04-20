"use client";

import { Input } from "@/components/ui/input";
import { Section, type StyleProps } from "../shared";

export function ShadowMenu({ get, set }: StyleProps) {
  return (
    <Section title="Shadow" icon="blur_on" defaultOpen={!!get("boxShadow")}>
      <div className="space-y-2">
        <Input value={get("boxShadow")} onChange={(e) => set("boxShadow", e.target.value)} className="h-6 text-[10px]" placeholder="0 2px 4px rgba(0,0,0,.1)" />
        {!get("boxShadow") && <button onClick={() => set("boxShadow", "0 2px 8px rgba(0,0,0,0.1)")} className="w-full h-6 rounded border border-dashed border-sidebar-border text-[10px] text-muted-foreground/50 hover:border-primary hover:text-primary transition-colors">+ Add shadow</button>}
      </div>
    </Section>
  );
}
