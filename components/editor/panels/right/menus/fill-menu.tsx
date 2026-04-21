"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Section, ColorField, SelectField, selectOptions, type StyleProps } from "../shared";
import { MIcon } from "../../../ui/m-icon";
import { cn } from "@/lib/utils";

type GradientStop = { color: string; pos: number };

function parseGradient(val: string): { type: 'linear' | 'radial'; angle: number; stops: GradientStop[] } | null {
  const linear = val.match(/^linear-gradient\((\d+)deg,\s*(.+)\)$/);
  if (linear) return { type: 'linear', angle: +linear[1], stops: parseStops(linear[2]) };
  const radial = val.match(/^radial-gradient\(circle,\s*(.+)\)$/);
  if (radial) return { type: 'radial', angle: 0, stops: parseStops(radial[1]) };
  return null;
}

function parseStops(raw: string): GradientStop[] {
  // Split on commas not inside parens
  const parts: string[] = [];
  let depth = 0, cur = '';
  for (const ch of raw) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ',' && depth === 0) { parts.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());

  return parts.map((p, i, arr) => {
    const m = p.match(/^(.+?)\s+(\d+)%$/);
    if (m) return { color: m[1], pos: +m[2] };
    return { color: p, pos: Math.round((i / Math.max(1, arr.length - 1)) * 100) };
  });
}

function buildGradient(type: 'linear' | 'radial', angle: number, stops: GradientStop[]): string {
  const s = stops.map(st => `${st.color} ${st.pos}%`).join(', ');
  return type === 'linear' ? `linear-gradient(${angle}deg, ${s})` : `radial-gradient(circle, ${s})`;
}

export function FillMenu({ get, set }: StyleProps) {
  const bgColor = get("backgroundColor");
  const bgImage = get("backgroundImage");
  const gradient = parseGradient(bgImage);
  const mode = gradient ? gradient.type : bgImage && !bgImage.includes("gradient") && bgImage ? "image" : "solid";
  const [enabled, setEnabled] = useState(!!bgColor || !!bgImage);

  const setMode = (m: 'solid' | 'linear' | 'radial' | 'image') => {
    setEnabled(true);
    if (m === 'solid') { set("backgroundImage", ""); }
    else if (m === 'linear') { set("backgroundImage", buildGradient('linear', 180, [{ color: bgColor || "#6366f1", pos: 0 }, { color: "#000000", pos: 100 }])); }
    else if (m === 'radial') { set("backgroundImage", buildGradient('radial', 0, [{ color: bgColor || "#6366f1", pos: 0 }, { color: "#000000", pos: 100 }])); }
    else { set("backgroundImage", ""); }
  };

  const toggleFill = () => {
    if (enabled) { set("backgroundColor", "transparent"); set("backgroundImage", ""); setEnabled(false); }
    else { set("backgroundColor", bgColor || "#ffffff"); setEnabled(true); }
  };

  // Gradient stop helpers
  const updateStop = (i: number, patch: Partial<GradientStop>) => {
    if (!gradient) return;
    const stops = gradient.stops.map((s, j) => j === i ? { ...s, ...patch } : s);
    set("backgroundImage", buildGradient(gradient.type, gradient.angle, stops));
  };
  const addStop = () => {
    if (!gradient) return;
    const stops = [...gradient.stops, { color: "#888888", pos: 50 }].sort((a, b) => a.pos - b.pos);
    set("backgroundImage", buildGradient(gradient.type, gradient.angle, stops));
  };
  const removeStop = (i: number) => {
    if (!gradient || gradient.stops.length <= 2) return;
    const stops = gradient.stops.filter((_, j) => j !== i);
    set("backgroundImage", buildGradient(gradient.type, gradient.angle, stops));
  };

  return (
    <Section title="Fill" icon="format_color_fill" action={
      <button onClick={toggleFill} className={cn("size-4 flex items-center justify-center rounded transition-colors", enabled ? "text-primary" : "text-muted-foreground/30")}>
        <MIcon name={enabled ? "visibility" : "visibility_off"} size={11} />
      </button>
    }>
      <div className="space-y-1.5">
        {/* Mode tabs */}
        <div className="flex gap-0.5 rounded-md border border-sidebar-border p-0.5">
          {(["solid", "linear", "radial", "image"] as const).map((t) => (
            <button key={t} onClick={() => setMode(t)} className={cn("flex-1 h-5 rounded text-[9px] font-medium capitalize transition-colors", mode === t ? "bg-primary text-primary-foreground" : "text-muted-foreground/50 hover:text-foreground")}>{t}</button>
          ))}
        </div>

        {/* Solid */}
        {mode === "solid" && (
          <ColorField label="" value={bgColor} onChange={(v) => set("backgroundColor", v)} />
        )}

        {/* Gradient */}
        {gradient && (
          <div className="space-y-1.5">
            {/* Preview bar */}
            <div className="h-4 rounded border border-sidebar-border" style={{ background: bgImage }} />

            {/* Angle (linear only) */}
            {gradient.type === 'linear' && (
              <div className="flex items-center gap-1">
                <MIcon name="rotate_right" size={11} className="text-muted-foreground/40 shrink-0" />
                <Input className="h-5 text-[10px] w-14" type="number" value={gradient.angle} onChange={(e) => set("backgroundImage", buildGradient('linear', +e.target.value, gradient.stops))} />
                <span className="text-[9px] text-muted-foreground/30">deg</span>
              </div>
            )}

            {/* Stops */}
            <div className="space-y-1">
              {gradient.stops.map((stop, i) => (
                <div key={i} className="flex items-center gap-1">
                  <ColorField label="" value={stop.color} onChange={(v) => updateStop(i, { color: v })} />
                  <Input className="h-5 text-[10px] w-12 shrink-0" type="number" min={0} max={100} value={stop.pos} onChange={(e) => updateStop(i, { pos: +e.target.value })} />
                  <span className="text-[9px] text-muted-foreground/30">%</span>
                  {gradient.stops.length > 2 && (
                    <button onClick={() => removeStop(i)} className="size-4 flex items-center justify-center text-muted-foreground/30 hover:text-destructive shrink-0">
                      <MIcon name="close" size={10} />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addStop} className="flex items-center gap-1 text-[9px] text-muted-foreground/40 hover:text-foreground transition-colors">
                <MIcon name="add" size={10} /> Add stop
              </button>
            </div>
          </div>
        )}

        {/* Image */}
        {mode === "image" && (
          <div className="space-y-1">
            <Input value={bgImage} onChange={(e) => set("backgroundImage", e.target.value)} className="h-6 text-[10px]" placeholder="url(https://...)" />
            <div className="grid grid-cols-2 gap-1">
              <SelectField label="" value={get("backgroundSize")} options={selectOptions.backgroundSize} onChange={(v) => set("backgroundSize", v)} />
              <SelectField label="" value={get("backgroundPosition") || "center"} options={["center","top","bottom","left","right"]} onChange={(v) => set("backgroundPosition", v)} />
            </div>
            <SelectField label="" value={get("backgroundRepeat") || "no-repeat"} options={["no-repeat","repeat","repeat-x","repeat-y"]} onChange={(v) => set("backgroundRepeat", v)} />
          </div>
        )}
      </div>
    </Section>
  );
}
