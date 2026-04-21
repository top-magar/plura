"use client";

import { useState, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Section, ColorField, SelectField, selectOptions, type StyleProps } from "../shared";
import { MIcon } from "../../../ui/m-icon";
import { cn } from "@/lib/utils";

type Stop = { color: string; pos: number };

// ─── Gradient parsing ───────────────────────────────────────

function parseGradient(val: string): { type: 'linear' | 'radial'; angle: number; stops: Stop[] } | null {
  const linear = val.match(/^linear-gradient\((\d+)deg,\s*(.+)\)$/);
  if (linear) return { type: 'linear', angle: +linear[1], stops: parseStops(linear[2]) };
  const radial = val.match(/^radial-gradient\(circle,\s*(.+)\)$/);
  if (radial) return { type: 'radial', angle: 0, stops: parseStops(radial[1]) };
  return null;
}

function parseStops(raw: string): Stop[] {
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
    return m ? { color: m[1], pos: +m[2] } : { color: p, pos: Math.round((i / Math.max(1, arr.length - 1)) * 100) };
  });
}

function build(type: 'linear' | 'radial', angle: number, stops: Stop[]): string {
  const s = stops.map(st => `${st.color} ${st.pos}%`).join(', ');
  return type === 'linear' ? `linear-gradient(${angle}deg, ${s})` : `radial-gradient(circle, ${s})`;
}

// ─── Draggable stop bar ─────────────────────────────────────

function StopBar({ stops, gradient, activeStop, onSelect, onMove, onAdd }: {
  stops: Stop[]; gradient: string; activeStop: number;
  onSelect: (i: number) => void; onMove: (i: number, pos: number) => void; onAdd: (pos: number) => void;
}) {
  const barRef = useRef<HTMLDivElement>(null);

  const getPos = useCallback((e: React.PointerEvent | PointerEvent) => {
    const r = barRef.current?.getBoundingClientRect();
    return r ? Math.round(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100))) : 0;
  }, []);

  const onStopDown = (i: number, e: React.PointerEvent) => {
    e.stopPropagation();
    onSelect(i);
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => onMove(i, getPos(ev));
    const up = () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
  };

  return (
    <div ref={barRef} className="relative h-5 rounded border border-sidebar-border cursor-crosshair" style={{ background: gradient }}
      onClick={(e) => { if ((e.target as HTMLElement) === barRef.current) onAdd(getPos(e as unknown as React.PointerEvent)); }}>
      {/* Checkerboard for transparency */}
      <div className="absolute inset-0 rounded -z-10" style={{ background: 'repeating-conic-gradient(#d4d4d4 0% 25%, transparent 0% 50%) 0 0 / 8px 8px' }} />
      {stops.map((s, i) => (
        <div key={i} onPointerDown={(e) => onStopDown(i, e)}
          className={cn("absolute top-1/2 -translate-x-1/2 -translate-y-1/2 size-3.5 rounded-full border-2 cursor-grab active:cursor-grabbing transition-shadow",
            i === activeStop ? "border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.3)] z-10" : "border-white/70 shadow-sm"
          )}
          style={{ left: `${s.pos}%`, background: s.color }}
        />
      ))}
    </div>
  );
}

// ─── Angle dial ─────────────────────────────────────────────

function AngleDial({ angle, onChange }: { angle: number; onChange: (a: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const calcAngle = (e: PointerEvent | React.PointerEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return angle;
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    return Math.round(((Math.atan2(y, x) * 180) / Math.PI + 90 + 360) % 360);
  };

  const onDown = (e: React.PointerEvent) => {
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    onChange(calcAngle(e));
    const move = (ev: PointerEvent) => onChange(calcAngle(ev));
    const up = () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
  };

  return (
    <div ref={ref} onPointerDown={onDown}
      className="size-6 rounded-full border border-sidebar-border bg-sidebar cursor-pointer shrink-0 relative"
      title={`${angle}°`}>
      <div className="absolute top-1/2 left-1/2 w-px h-2.5 bg-primary origin-bottom" style={{ transform: `translate(-50%, -100%) rotate(${angle}deg)` }} />
      <div className="absolute top-1/2 left-1/2 size-1 rounded-full bg-muted-foreground/30 -translate-x-1/2 -translate-y-1/2" />
    </div>
  );
}

// ─── Presets ─────────────────────────────────────────────────

const presets = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  "linear-gradient(180deg, #0c0c0c 0%, #1a1a2e 100%)",
  "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
];

// ─── Fill Menu ──────────────────────────────────────────────

export function FillMenu({ get, set }: StyleProps) {
  const bgColor = get("backgroundColor");
  const bgImage = get("backgroundImage");
  const gradient = parseGradient(bgImage);
  const mode = gradient ? gradient.type : bgImage && !bgImage.includes("gradient") && bgImage ? "image" : "solid";
  const [enabled, setEnabled] = useState(!!bgColor || !!bgImage);
  const [activeStop, setActiveStop] = useState(0);

  const setMode = (m: 'solid' | 'linear' | 'radial' | 'image') => {
    setEnabled(true);
    if (m === 'solid') set("backgroundImage", "");
    else if (m === 'linear') set("backgroundImage", build('linear', 180, [{ color: bgColor || "#6366f1", pos: 0 }, { color: "#000000", pos: 100 }]));
    else if (m === 'radial') set("backgroundImage", build('radial', 0, [{ color: bgColor || "#6366f1", pos: 0 }, { color: "#000000", pos: 100 }]));
    else set("backgroundImage", "");
  };

  const toggleFill = () => {
    if (enabled) { set("backgroundColor", "transparent"); set("backgroundImage", ""); setEnabled(false); }
    else { set("backgroundColor", bgColor || "#ffffff"); setEnabled(true); }
  };

  const updateStop = (i: number, patch: Partial<Stop>) => {
    if (!gradient) return;
    const stops = gradient.stops.map((s, j) => j === i ? { ...s, ...patch } : s);
    set("backgroundImage", build(gradient.type, gradient.angle, stops));
  };
  const addStopAt = (pos: number) => {
    if (!gradient) return;
    const stops = [...gradient.stops, { color: "#888888", pos }].sort((a, b) => a.pos - b.pos);
    const newIdx = stops.findIndex(s => s.pos === pos && s.color === "#888888");
    setActiveStop(newIdx >= 0 ? newIdx : stops.length - 1);
    set("backgroundImage", build(gradient.type, gradient.angle, stops));
  };
  const removeStop = (i: number) => {
    if (!gradient || gradient.stops.length <= 2) return;
    const stops = gradient.stops.filter((_, j) => j !== i);
    setActiveStop(Math.min(activeStop, stops.length - 1));
    set("backgroundImage", build(gradient.type, gradient.angle, stops));
  };
  const swapStops = () => {
    if (!gradient) return;
    const stops = gradient.stops.map(s => ({ ...s, pos: 100 - s.pos })).reverse();
    set("backgroundImage", build(gradient.type, gradient.angle, stops));
  };

  const active = gradient?.stops[activeStop];

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
            {/* Draggable stop bar */}
            <StopBar stops={gradient.stops} gradient={bgImage} activeStop={activeStop}
              onSelect={setActiveStop}
              onMove={(i, pos) => updateStop(i, { pos })}
              onAdd={addStopAt}
            />

            {/* Active stop controls */}
            {active && (
              <div className="flex items-center gap-1">
                <ColorField label="" value={active.color} onChange={(v) => updateStop(activeStop, { color: v })} />
                <Input className="h-5 text-[10px] w-12 shrink-0" type="number" min={0} max={100} value={active.pos} onChange={(e) => updateStop(activeStop, { pos: +e.target.value })} />
                <span className="text-[9px] text-muted-foreground/30 shrink-0">%</span>
                {gradient.stops.length > 2 && (
                  <button onClick={() => removeStop(activeStop)} className="size-4 flex items-center justify-center text-muted-foreground/30 hover:text-destructive shrink-0">
                    <MIcon name="close" size={10} />
                  </button>
                )}
              </div>
            )}

            {/* Angle + swap */}
            <div className="flex items-center gap-1">
              {gradient.type === 'linear' && (
                <>
                  <AngleDial angle={gradient.angle} onChange={(a) => set("backgroundImage", build('linear', a, gradient.stops))} />
                  <Input className="h-5 text-[10px] w-12" type="number" value={gradient.angle} onChange={(e) => set("backgroundImage", build('linear', +e.target.value, gradient.stops))} />
                  <span className="text-[9px] text-muted-foreground/30">°</span>
                </>
              )}
              <div className="flex-1" />
              <button onClick={swapStops} className="flex items-center gap-0.5 text-[9px] text-muted-foreground/40 hover:text-foreground transition-colors" title="Reverse gradient">
                <MIcon name="swap_horiz" size={12} />
              </button>
            </div>

            {/* Presets */}
            <div>
              <span className="text-[9px] text-muted-foreground/30 mb-1 block">Presets</span>
              <div className="grid grid-cols-8 gap-1">
                {presets.map((p, i) => (
                  <button key={i} onClick={() => set("backgroundImage", p)}
                    className="h-4 rounded-sm border border-sidebar-border hover:scale-110 transition-transform"
                    style={{ background: p }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Image */}
        {mode === "image" && (
          <div className="space-y-1">
            {bgImage && !bgImage.includes("gradient") && bgImage.startsWith("url(") && (
              <div className="h-16 rounded border border-sidebar-border bg-muted overflow-hidden">
                <img src={bgImage.replace(/^url\(["']?|["']?\)$/g, '')} alt="" className="w-full h-full object-cover" />
              </div>
            )}
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
