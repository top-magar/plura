"use client";

import { Input } from "@/components/ui/input";
import { Section, ColorField, SelectField, selectOptions, type StyleProps } from "../shared";
import { N } from "./measures-menu";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

export function FillMenu({ get, set }: StyleProps) {
  const current = get("backgroundImage")?.startsWith("linear-gradient") ? "linear" : get("backgroundImage")?.startsWith("radial-gradient") ? "radial" : "solid";
  return (
    <Section title="Fill" icon="format_color_fill">
      <div className="space-y-2">
        <div className="flex gap-1">
          {(["solid", "linear", "radial"] as const).map((t) => (
            <button key={t} onClick={() => {
              if (t === "solid") set("backgroundImage", "");
              else if (t === "linear") set("backgroundImage", `linear-gradient(180deg, ${get("backgroundColor") || "#6366f1"}, #000000)`);
              else set("backgroundImage", `radial-gradient(circle, ${get("backgroundColor") || "#6366f1"}, #000000)`);
            }} className={cn("flex-1 h-6 rounded border text-[9px] font-medium capitalize transition-colors", current === t ? "bg-primary text-primary-foreground border-primary" : "border-sidebar-border text-muted-foreground/60 hover:text-foreground")}>{t}</button>
          ))}
        </div>
        <ColorField label="" value={get("backgroundColor")} onChange={(v) => set("backgroundColor", v)} />
        {current === "linear" && (
          <TooltipProvider delayDuration={200}>
            <N icon="∠" value={get("backgroundImage")?.match(/(\d+)deg/)?.[1] || "180"} onChange={(v) => {
              const stops = get("backgroundImage").replace(/linear-gradient\([^,]+,/, "").replace(/\)$/, "");
              set("backgroundImage", `linear-gradient(${v}deg,${stops})`);
            }} placeholder="180" tip="Gradient angle" />
          </TooltipProvider>
        )}
        {!get("backgroundImage")?.includes("gradient") && (
          <div className="grid grid-cols-2 gap-1">
            <Input value={get("backgroundImage")} onChange={(e) => set("backgroundImage", e.target.value)} className="h-6 text-[10px]" placeholder="url()" />
            <SelectField label="" value={get("backgroundSize")} options={selectOptions.backgroundSize} onChange={(v) => set("backgroundSize", v)} />
          </div>
        )}
      </div>
    </Section>
  );
}
