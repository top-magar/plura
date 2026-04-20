'use client';

import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { MIcon } from './m-icon';

// ─── Color Math ─────────────────────────────────────────

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const f = (n: number) => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); };
  return [Math.round(f(5) * 255), Math.round(f(3) * 255), Math.round(f(1) * 255)];
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d) { if (max === r) h = ((g - b) / d + 6) % 6; else if (max === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h *= 60; }
  return [h, max ? d / max : 0, max];
}

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace('#', '').match(/.{2}/g);
  return m ? [parseInt(m[0], 16), parseInt(m[1], 16), parseInt(m[2], 16)] : [0, 0, 0];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

// ─── Pointer Drag Hook ──────────────────────────────────

function useDrag(onDrag: (x: number, y: number, rect: DOMRect) => void) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const calc = useCallback((e: PointerEvent | React.PointerEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    onDrag(x, y, rect);
  }, [onDrag]);

  const onDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragging.current = true;
    calc(e);
  }, [calc]);

  const onMove = useCallback((e: React.PointerEvent) => {
    if (dragging.current) calc(e);
  }, [calc]);

  const onUp = useCallback((e: React.PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    dragging.current = false;
  }, []);

  return { ref, onDown, onMove, onUp };
}

// ─── Saturation/Value Area ──────────────────────────────

function SaturationValue({ hue, s, v, onChange }: { hue: number; s: number; v: number; onChange: (s: number, v: number) => void }) {
  const drag = useDrag((x, y) => onChange(x, 1 - y));
  const [r, g, b] = hsvToRgb(hue, 1, 1);

  return (
    <div
      ref={drag.ref}
      className="relative w-full h-[140px] rounded-md cursor-crosshair touch-none select-none"
      style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, rgb(${r},${g},${b}))` }}
      onPointerDown={drag.onDown}
      onPointerMove={drag.onMove}
      onPointerUp={drag.onUp}
    >
      <div
        className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)] pointer-events-none"
        style={{ left: `${s * 100}%`, top: `${(1 - v) * 100}%` }}
      />
    </div>
  );
}

// ─── Hue Slider ─────────────────────────────────────────

function HueSlider({ hue, onChange }: { hue: number; onChange: (h: number) => void }) {
  const drag = useDrag((x) => onChange(x * 360));
  return (
    <div
      ref={drag.ref}
      className="relative h-3 rounded-full cursor-pointer touch-none select-none"
      style={{ background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)' }}
      onPointerDown={drag.onDown}
      onPointerMove={drag.onMove}
      onPointerUp={drag.onUp}
    >
      <div
        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 size-3.5 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.2)] pointer-events-none"
        style={{ left: `${(hue / 360) * 100}%` }}
      />
    </div>
  );
}

// ─── Opacity Slider ─────────────────────────────────────

function OpacitySlider({ color, alpha, onChange }: { color: string; alpha: number; onChange: (a: number) => void }) {
  const drag = useDrag((x) => onChange(Math.round(x * 100) / 100));
  return (
    <div
      ref={drag.ref}
      className="relative h-3 rounded-full cursor-pointer touch-none select-none"
      style={{
        backgroundImage: `linear-gradient(to right, transparent, ${color}), repeating-conic-gradient(#d4d4d4 0% 25%, transparent 0% 50%)`,
        backgroundSize: '100% 100%, 8px 8px',
      }}
      onPointerDown={drag.onDown}
      onPointerMove={drag.onMove}
      onPointerUp={drag.onUp}
    >
      <div
        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 size-3.5 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.2)] pointer-events-none"
        style={{ left: `${alpha * 100}%` }}
      />
    </div>
  );
}

// ─── Harmony Wheel ──────────────────────────────────────

function HarmonyWheel({ hue, s, v, onChange }: { hue: number; s: number; v: number; onChange: (h: number, s: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = 160;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const cx = size / 2, cy = size / 2, radius = size / 2;
    ctx.clearRect(0, 0, size, size);
    for (let deg = 0; deg < 360; deg += 0.5) {
      const rad = (deg * Math.PI) / 180;
      ctx.strokeStyle = `hsl(${deg}, 100%, 50%)`;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(rad) * radius, cy + Math.sin(rad) * radius);
      ctx.stroke();
    }
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const drag = useDrag((x, y) => {
    const px = x * 2 - 1, py = y * 2 - 1;
    const angle = ((Math.atan2(py, px) * 180) / Math.PI + 360) % 360;
    const sat = Math.min(1, Math.sqrt(px * px + py * py));
    onChange(angle, sat);
  });

  const rad = (hue * Math.PI) / 180;
  const hx = 50 + s * 50 * Math.cos(rad);
  const hy = 50 + s * 50 * Math.sin(rad);
  const compRad = ((hue + 180) * Math.PI) / 180;
  const cx = 50 + s * 50 * Math.cos(compRad);
  const cy = 50 + s * 50 * Math.sin(compRad);

  return (
    <div className="flex items-center justify-center py-2">
      <div ref={drag.ref} className="relative touch-none select-none cursor-crosshair" style={{ width: size, height: size }} onPointerDown={drag.onDown} onPointerMove={drag.onMove} onPointerUp={drag.onUp}>
        <canvas ref={canvasRef} width={size} height={size} className="rounded-full" />
        <div className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)] pointer-events-none" style={{ left: `${hx}%`, top: `${hy}%` }} />
        <div className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/50 shadow-[0_0_0_1px_rgba(0,0,0,0.2)] pointer-events-none opacity-60" style={{ left: `${cx}%`, top: `${cy}%` }} />
      </div>
    </div>
  );
}

// ─── HSVA Sliders ───────────────────────────────────────

function HSVASliders({ h, s, v, alpha, onChange }: { h: number; s: number; v: number; alpha: number; onChange: (color: { h?: number; s?: number; v?: number; alpha?: number }) => void }) {
  const hDrag = useDrag((x) => onChange({ h: x * 360 }));
  const sDrag = useDrag((x) => onChange({ s: x }));
  const vDrag = useDrag((x) => onChange({ v: x }));
  const aDrag = useDrag((x) => onChange({ alpha: x }));
  const [r, g, b] = hsvToRgb(h, 1, 1);
  const [sr, sg, sb] = hsvToRgb(h, s, 1);

  const row = (label: string, bg: string, val: number, drag: ReturnType<typeof useDrag>) => (
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-medium text-muted-foreground/60 w-3">{label}</span>
      <div ref={drag.ref} className="relative flex-1 h-3 rounded-full cursor-pointer touch-none select-none" style={{ background: bg }} onPointerDown={drag.onDown} onPointerMove={drag.onMove} onPointerUp={drag.onUp}>
        <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 size-3.5 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.2)] pointer-events-none" style={{ left: `${val * 100}%` }} />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-2.5 py-3 px-1">
      {row('H', 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)', h / 360, hDrag)}
      {row('S', `linear-gradient(to right, rgb(${Math.round(v * 255)},${Math.round(v * 255)},${Math.round(v * 255)}), rgb(${r},${g},${b}))`, s, sDrag)}
      {row('V', `linear-gradient(to right, #000, rgb(${sr},${sg},${sb}))`, v, vDrag)}
      {row('A', `linear-gradient(to right, transparent, rgb(${sr},${sg},${sb})), repeating-conic-gradient(#d4d4d4 0% 25%, transparent 0% 50%)`, alpha, aDrag)}
    </div>
  );
}

// ─── Color Inputs ───────────────────────────────────────

function ColorInputs({ hex, r, g, b, alpha, onChange }: { hex: string; r: number; g: number; b: number; alpha: number; onChange: (c: { hex?: string; r?: number; g?: number; b?: number; alpha?: number }) => void }) {
  const inp = "h-5 w-full rounded border border-border bg-background px-1 text-[9px] text-center tabular-nums focus:outline-none focus:ring-1 focus:ring-primary/50";
  return (
    <div className="flex gap-1.5 items-end">
      <div className="flex-[2]">
        <label className="text-[8px] text-muted-foreground/50 block mb-0.5">HEX</label>
        <input className={inp} defaultValue={hex} onBlur={(e) => { const v = e.target.value.startsWith('#') ? e.target.value : '#' + e.target.value; if (/^#[0-9a-f]{6}$/i.test(v)) onChange({ hex: v }); }} />
      </div>
      <div className="flex-1">
        <label className="text-[8px] text-muted-foreground/50 block mb-0.5">R</label>
        <input type="number" min={0} max={255} className={inp} defaultValue={r} onChange={(e) => onChange({ r: +e.target.value })} />
      </div>
      <div className="flex-1">
        <label className="text-[8px] text-muted-foreground/50 block mb-0.5">G</label>
        <input type="number" min={0} max={255} className={inp} defaultValue={g} onChange={(e) => onChange({ g: +e.target.value })} />
      </div>
      <div className="flex-1">
        <label className="text-[8px] text-muted-foreground/50 block mb-0.5">B</label>
        <input type="number" min={0} max={255} className={inp} defaultValue={b} onChange={(e) => onChange({ b: +e.target.value })} />
      </div>
      <div className="flex-1">
        <label className="text-[8px] text-muted-foreground/50 block mb-0.5">A</label>
        <input type="number" min={0} max={100} className={inp} defaultValue={Math.round(alpha * 100)} onChange={(e) => onChange({ alpha: +e.target.value / 100 })} />
      </div>
    </div>
  );
}

// ─── Main Color Picker ──────────────────────────────────

type ColorPickerProps = {
  color: string; // hex
  alpha?: number;
  onChange: (hex: string) => void;
  onAlphaChange?: (a: number) => void;
  showAlpha?: boolean;
};

export function ColorPicker({ color, alpha = 1, onChange, onAlphaChange, showAlpha = true }: ColorPickerProps): ReactNode {
  const [rgb, setRgb] = useState(() => hexToRgb(color || '#000000'));
  const [hsv, setHsv] = useState(() => rgbToHsv(...rgb));
  const [a, setA] = useState(alpha);
  const [tab, setTab] = useState<'ramp' | 'harmony' | 'hsva'>('ramp');

  // Sync from external color prop
  useEffect(() => {
    if (!color) return;
    const r = hexToRgb(color);
    setRgb(r);
    setHsv(rgbToHsv(...r));
  }, [color]);

  useEffect(() => { setA(alpha); }, [alpha]);

  const update = useCallback((h: number, s: number, v: number, newAlpha?: number) => {
    const [r, g, b] = hsvToRgb(h, s, v);
    const hex = rgbToHex(r, g, b);
    setHsv([h, s, v]);
    setRgb([r, g, b]);
    onChange(hex);
    if (newAlpha !== undefined) { setA(newAlpha); onAlphaChange?.(newAlpha); }
  }, [onChange, onAlphaChange]);

  const handleSVChange = useCallback((s: number, v: number) => update(hsv[0], s, v), [hsv, update]);
  const handleHueChange = useCallback((h: number) => update(h, hsv[1], hsv[2]), [hsv, update]);
  const handleAlphaChange = useCallback((a: number) => { setA(a); onAlphaChange?.(a); }, [onAlphaChange]);
  const handleHarmonyChange = useCallback((h: number, s: number) => update(h, s, hsv[2]), [hsv, update]);
  const handleHSVAChange = useCallback((c: { h?: number; s?: number; v?: number; alpha?: number }) => {
    const h = c.h ?? hsv[0], s = c.s ?? hsv[1], v = c.v ?? hsv[2];
    update(h, s, v, c.alpha);
  }, [hsv, update]);

  const handleInputChange = useCallback((c: { hex?: string; r?: number; g?: number; b?: number; alpha?: number }) => {
    if (c.hex) {
      const [r, g, b] = hexToRgb(c.hex);
      const [h, s, v] = rgbToHsv(r, g, b);
      update(h, s, v);
    } else if (c.r !== undefined || c.g !== undefined || c.b !== undefined) {
      const r = c.r ?? rgb[0], g = c.g ?? rgb[1], b = c.b ?? rgb[2];
      const [h, s, v] = rgbToHsv(r, g, b);
      update(h, s, v);
    }
    if (c.alpha !== undefined) { setA(c.alpha); onAlphaChange?.(c.alpha); }
  }, [rgb, update, onAlphaChange]);

  const hex = rgbToHex(...rgb);

  return (
    <div className="flex flex-col gap-2">
      {/* Tab switcher */}
      <div className="flex gap-px rounded-md overflow-hidden border border-border">
        {(['ramp', 'harmony', 'hsva'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn('flex-1 h-6 text-[9px] font-medium transition-colors', tab === t ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted')}>
            {t === 'ramp' ? 'Ramp' : t === 'harmony' ? 'Wheel' : 'HSVA'}
          </button>
        ))}
      </div>

      {/* Color selection area */}
      {tab === 'ramp' && (
        <>
          <SaturationValue hue={hsv[0]} s={hsv[1]} v={hsv[2]} onChange={handleSVChange} />
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-md border border-border shrink-0" style={{ background: hex, opacity: a }} />
            <div className="flex-1 flex flex-col gap-1.5">
              <HueSlider hue={hsv[0]} onChange={handleHueChange} />
              {showAlpha && <OpacitySlider color={hex} alpha={a} onChange={handleAlphaChange} />}
            </div>
          </div>
        </>
      )}

      {tab === 'harmony' && (
        <>
          <HarmonyWheel hue={hsv[0]} s={hsv[1]} v={hsv[2]} onChange={handleHarmonyChange} />
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-md border border-border shrink-0" style={{ background: hex, opacity: a }} />
            <div className="flex-1 flex flex-col gap-1.5">
              <HueSlider hue={hsv[0]} onChange={handleHueChange} />
              {showAlpha && <OpacitySlider color={hex} alpha={a} onChange={handleAlphaChange} />}
            </div>
          </div>
        </>
      )}

      {tab === 'hsva' && <HSVASliders h={hsv[0]} s={hsv[1]} v={hsv[2]} alpha={a} onChange={handleHSVAChange} />}

      {/* Inputs */}
      <ColorInputs hex={hex} r={rgb[0]} g={rgb[1]} b={rgb[2]} alpha={a} onChange={handleInputChange} />
    </div>
  );
}
