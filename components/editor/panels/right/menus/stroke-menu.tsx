"use client";

import { useState } from "react";
import { MIcon } from "../../../ui/m-icon";
import { Section, ColorField, type StyleProps } from "../shared";
import { N } from "./measures-menu";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const styles = [
  { value: "none", label: "None", icon: "block" },
  { value: "solid", label: "Solid", icon: "remove" },
  { value: "dashed", label: "Dash", icon: "line_style" },
  { value: "dotted", label: "Dot", icon: "more_horiz" },
] as const;

type Side = "Top" | "Right" | "Bottom" | "Left";
const sides: { side: Side; icon: string }[] = [
  { side: "Top", icon: "border_top" },
  { side: "Right", icon: "border_right" },
  { side: "Bottom", icon: "border_bottom" },
  { side: "Left", icon: "border_left" },
];

export function StrokeMenu({ get, set }: StyleProps) {
  const style = get("borderStyle") || "none";
  const hasStroke = style !== "none";
  const [perSide, setPerSide] = useState(false);
  const [tab, setTab] = useState<"border" | "outline">("border");

  const toggle = () => {
    if (hasStroke) { set("borderStyle", "none"); set("borderWidth", "0"); }
    else { set("borderStyle", "solid"); set("borderWidth", "1px"); set("borderColor", get("borderColor") || "#d4d4d8"); }
  };

  const px = (prop: string, v: string) => set(prop, /^\d+$/.test(v) ? `${v}px` : v);
  const strip = (v: string) => v?.replace("px", "") || "";

  const hasOutline = get("outlineStyle") && get("outlineStyle") !== "none";

  return (
    <TooltipProvider delayDuration={200}>
    <Section title="Stroke" icon="border_style" defaultOpen={false} action={
      <button onClick={toggle} className={cn("size-4 flex items-center justify-center rounded transition-colors", hasStroke || hasOutline ? "text-primary" : "text-muted-foreground/30")}>
        <MIcon name={hasStroke || hasOutline ? "visibility" : "visibility_off"} size={11} />
      </button>
    }>
      <div className="space-y-1.5">
        {/* Border / Outline tabs */}
        <div className="flex gap-0.5 rounded-md border border-sidebar-border p-0.5">
          {(["border", "outline"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn("flex-1 h-5 rounded text-[9px] font-medium capitalize transition-colors", tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground/50 hover:text-foreground")}>{t}</button>
          ))}
        </div>

        {/* ─── Border tab ─── */}
        {tab === "border" && (<>
          {/* Preview */}
          {hasStroke && (
            <div className="flex items-center justify-center h-8 rounded border border-sidebar-border bg-sidebar">
              <div className="size-5 rounded-sm" style={{
                borderStyle: style,
                borderWidth: get("borderWidth") || "1px",
                borderColor: get("borderColor") || "#d4d4d8",
              }} />
            </div>
          )}

          {/* Style */}
          <div className="flex gap-0.5 rounded-md border border-sidebar-border p-0.5">
            {styles.map((s) => (
              <button key={s.value} onClick={() => {
                set("borderStyle", s.value);
                if (s.value !== "none" && !get("borderWidth")) set("borderWidth", "1px");
                if (s.value !== "none" && !get("borderColor")) set("borderColor", "#d4d4d8");
              }} className={cn("flex-1 h-5 rounded flex items-center justify-center transition-colors", style === s.value ? "bg-primary text-primary-foreground" : "text-muted-foreground/40 hover:text-foreground")}>
                <MIcon name={s.icon} size={12} />
              </button>
            ))}
          </div>

          {hasStroke && (<>
            {/* Color + Width */}
            <div className="flex items-center gap-1">
              <div className="flex-1">
                <ColorField label="" value={get("borderColor")} onChange={(v) => set("borderColor", v)} />
              </div>
              {!perSide && (
                <div className="w-14 shrink-0">
                  <N icon="W" value={strip(get("borderWidth"))} onChange={(v) => px("borderWidth", v)} placeholder="1" tip="Width" />
                </div>
              )}
              <button onClick={() => setPerSide(!perSide)} className={cn("flex size-5 items-center justify-center rounded transition-colors shrink-0", perSide ? "text-primary" : "text-muted-foreground/30")} title="Per-side">
                <MIcon name={perSide ? "select_all" : "crop_square"} size={11} />
              </button>
            </div>

            {/* Per-side */}
            {perSide && (
              <div className="space-y-1">
                {sides.map(({ side, icon }) => {
                  const wProp = `border${side}Width`;
                  const sProp = `border${side}Style`;
                  const sideStyle = get(sProp) || style;
                  const sideActive = sideStyle !== "none";
                  return (
                    <div key={side} className="flex items-center gap-1">
                      <button onClick={() => set(sProp, sideActive ? "none" : style)} className={cn("flex size-5 items-center justify-center rounded transition-colors shrink-0", sideActive ? "text-primary" : "text-muted-foreground/20")}>
                        <MIcon name={icon} size={12} />
                      </button>
                      <div className="flex-1">
                        <N icon="" value={strip(get(wProp) || get("borderWidth"))} onChange={(v) => px(wProp, v)} placeholder="1" tip={side} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>)}
        </>)}

        {/* ─── Outline tab ─── */}
        {tab === "outline" && (<>
          <div className="flex gap-0.5 rounded-md border border-sidebar-border p-0.5">
            {styles.map((s) => (
              <button key={s.value} onClick={() => {
                set("outlineStyle", s.value);
                if (s.value !== "none" && !get("outlineWidth")) set("outlineWidth", "2px");
                if (s.value !== "none" && !get("outlineColor")) set("outlineColor", "#6366f1");
              }} className={cn("flex-1 h-5 rounded flex items-center justify-center transition-colors", (get("outlineStyle") || "none") === s.value ? "bg-primary text-primary-foreground" : "text-muted-foreground/40 hover:text-foreground")}>
                <MIcon name={s.icon} size={12} />
              </button>
            ))}
          </div>

          {hasOutline && (
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <div className="flex-1">
                  <ColorField label="" value={get("outlineColor")} onChange={(v) => set("outlineColor", v)} />
                </div>
                <div className="w-14 shrink-0">
                  <N icon="W" value={strip(get("outlineWidth"))} onChange={(v) => px("outlineWidth", v)} placeholder="2" tip="Width" />
                </div>
              </div>
              <N icon="↔" value={strip(get("outlineOffset"))} onChange={(v) => px("outlineOffset", v)} placeholder="0" tip="Offset" />
            </div>
          )}
        </>)}
      </div>
    </Section>
    </TooltipProvider>
  );
}
