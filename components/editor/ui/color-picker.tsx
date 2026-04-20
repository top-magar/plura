'use client';

import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
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
  return [h || 0, max ? d / max : 0, max || 0];
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = (hex || '').replace('#', '');
  if (clean.length !== 6) return [0, 0, 0];
  const m = clean.match(/.{2}/g);
  if (!m) return [0, 0, 0];
  return [parseInt(m[0], 16) || 0, parseInt(m[1], 16) || 0, parseInt(m[2], 16) || 0];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
}

function parseRgbString(rgb: string): string {
  const m = rgb.match(/(\d+),\s*(\d+),\s*(\d+)/);
  return m ? rgbToHex(+m[1], +m[2], +m[3]) : '#000000';
}

// ─── Pointer Drag Hook ──────────────────────────────────

function useDrag(onDrag: (x: number, y: number) => void) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const calc = useCallback((e: PointerEvent | React.PointerEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    onDrag(
      Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
    );
  }, [onDrag]);

  const onDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragging.current = true;
    calc(e);
  }, [calc]);

  const onMove = useCallback((e: React.PointerEvent) => { if (dragging.current) calc(e); }, [calc]);

  const onUp = useCallback((e: React.PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    dragging.current = false;
  }, []);

  return { ref, onDown, onMove, onUp };
}

// ─── Sub-components ─────────────────────────────────────

function SaturationValue({ hue, s, v, onChange }: { hue: number; s: number; v: number; onChange: (s: number, v: number) => void }) {
  const drag = useDrag((x, y) => onChange(x, 1 - y));
  const [r, g, b] = hsvToRgb(hue, 1, 1);
  return (
    <div ref={drag.ref} className="relative w-full h-[140px] rounded-md cursor-crosshair touch-none select-none"
      style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, rgb(${r},${g},${b}))` }}
      onPointerDown={drag.onDown} onPointerMove={drag.onMove} onPointerUp={drag.onUp}>
      <div className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)] pointer-events-none"
        style={{ left: `${s * 100}%`, top: `${(1 - v) * 100}%` }} />
    </div>
  );
}

function Slider({ value, bg, onChange }: { value: number; bg: string; onChange: (v: number) => void }) {
  const drag = useDrag((x) => onChange(x));
  return (
    <div ref={drag.ref} className="relative h-3 rounded-full cursor-pointer touch-none select-none" style={{ background: bg }}
      onPointerDown={drag.onDown} onPointerMove={drag.onMove} onPointerUp={drag.onUp}>
      <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 size-3.5 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.2)] pointer-events-none"
        style={{ left: `${value * 100}%` }} />
    </div>
  );
}

function HarmonyWheel({ hue, s, v, onChange }: { hue: number; s: number; v: number; onChange: (h: number, s: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = 160;
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    const cx = size / 2, r = size / 2;
    ctx.clearRect(0, 0, size, size);
    for (let d = 0; d < 360; d += 0.5) {
      const rad = (d * Math.PI) / 180;
      ctx.strokeStyle = `hsl(${d}, 100%, 50%)`;
      ctx.beginPath(); ctx.moveTo(cx, cx); ctx.lineTo(cx + Math.cos(rad) * r, cx + Math.sin(rad) * r); ctx.stroke();
    }
    const grd = ctx.createRadialGradient(cx, cx, 0, cx, cx, r);
    grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(cx, cx, r, 0, Math.PI * 2); ctx.fill();
  }, []);
  const drag = useDrag((x, y) => {
    const px = x * 2 - 1, py = y * 2 - 1;
    onChange(((Math.atan2(py, px) * 180) / Math.PI + 360) % 360, Math.min(1, Math.sqrt(px * px + py * py)));
  });
  const rad = (hue * Math.PI) / 180;
  const hx = 50 + s * 50 * Math.cos(rad), hy = 50 + s * 50 * Math.sin(rad);
  const cRad = ((hue + 180) * Math.PI) / 180;
  const cx2 = 50 + s * 50 * Math.cos(cRad), cy2 = 50 + s * 50 * Math.sin(cRad);
  return (
    <div className="flex items-center justify-center py-2">
      <div ref={drag.ref} className="relative touch-none select-none cursor-crosshair" style={{ width: size, height: size }}
        onPointerDown={drag.onDown} onPointerMove={drag.onMove} onPointerUp={drag.onUp}>
        <canvas ref={canvasRef} width={size} height={size} className="rounded-full" />
        <div className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)] pointer-events-none" style={{ left: `${hx}%`, top: `${hy}%` }} />
        <div className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/50 shadow-[0_0_0_1px_rgba(0,0,0,0.2)] pointer-events-none opacity-50" style={{ left: `${cx2}%`, top: `${cy2}%` }} />
      </div>
    </div>
  );
}

function HSVASliders({ h, s, v, alpha, onChange }: { h: number; s: number; v: number; alpha: number; onChange: (c: { h?: number; s?: number; v?: number; alpha?: number }) => void }) {
  const [r, g, b] = hsvToRgb(h, 1, 1);
  const [sr, sg, sb] = hsvToRgb(h, s, 1);
  const row = (label: string, bg: string, val: number, fn: (v: number) => void) => (
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-medium text-muted-foreground/60 w-3">{label}</span>
      <div className="flex-1"><Slider value={val} bg={bg} onChange={fn} /></div>
    </div>
  );
  return (
    <div className="flex flex-col gap-2.5 py-3 px-1">
      {row('H', 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)', h / 360, (x) => onChange({ h: x * 360 }))}
      {row('S', `linear-gradient(to right, rgb(${Math.round(v * 255)},${Math.round(v * 255)},${Math.round(v * 255)}), rgb(${r},${g},${b}))`, s, (x) => onChange({ s: x }))}
      {row('V', `linear-gradient(to right, #000, rgb(${sr},${sg},${sb}))`, v, (x) => onChange({ v: x }))}
      {row('A', `linear-gradient(to right, transparent, rgb(${sr},${sg},${sb})), repeating-conic-gradient(#d4d4d4 0% 25%, transparent 0% 50%)`, alpha, (x) => onChange({ alpha: x }))}
    </div>
  );
}

function ColorInputs({ hex, r, g, b, alpha, onChange }: { hex: string; r: number; g: number; b: number; alpha: number; onChange: (c: { hex?: string; r?: number; g?: number; b?: number; alpha?: number }) => void }) {
  const inp = "h-5 w-full rounded border border-border bg-background px-1 text-[9px] text-center tabular-nums focus:outline-none focus:ring-1 focus:ring-primary/50";
  const safe = (v: number, fb = 0) => (Number.isFinite(v) ? v : fb);
  return (
    <div className="flex gap-1.5 items-end">
      <div className="flex-[2]">
        <label className="text-[8px] text-muted-foreground/50 block mb-0.5">HEX</label>
        <input className={inp} defaultValue={hex || '#000000'} onBlur={(e) => { const v = e.target.value.startsWith('#') ? e.target.value : '#' + e.target.value; if (/^#[0-9a-f]{6}$/i.test(v)) onChange({ hex: v }); }} />
      </div>
      {[['R', r, 255, 'r'] as const, ['G', g, 255, 'g'] as const, ['B', b, 255, 'b'] as const, ['A', alpha * 100, 100, 'alpha'] as const].map(([l, v, max, k]) => (
        <div key={l} className="flex-1">
          <label className="text-[8px] text-muted-foreground/50 block mb-0.5">{l}</label>
          <input type="number" min={0} max={max} className={inp} defaultValue={safe(Math.round(v))}
            onChange={(e) => onChange({ [k]: k === 'alpha' ? +e.target.value / 100 : +e.target.value })} />
        </div>
      ))}
    </div>
  );
}

// ─── Eyedropper (native API + fallback) ─────────────────

function useEyedropper(onPick: (hex: string) => void, onClose: () => void) {
  const [active, setActive] = useState(false);
  const [preview, setPreview] = useState<{ color: string; x: number; y: number } | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const start = useCallback(() => {
    // Try native EyeDropper API first (Chrome/Edge)
    if ('EyeDropper' in window) {
      const dropper = new (window as unknown as { EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper();
      dropper.open().then((result) => {
        onPick(result.sRGBHex);
      }).catch(() => { /* user cancelled */ });
      return;
    }
    // Fallback: manual overlay
    setActive(true);
  }, [onPick]);

  const sampleAt = useCallback((x: number, y: number): string => {
    // Hide ALL overlays: our overlay + popover + radix layers
    const hidden: HTMLElement[] = [];
    const overlay = overlayRef.current;
    if (overlay) { overlay.style.display = 'none'; hidden.push(overlay); }
    document.querySelectorAll('[data-radix-popper-content-wrapper], [data-radix-portal]').forEach((el) => {
      const h = el as HTMLElement;
      if (h.style.display !== 'none') { h.style.display = 'none'; hidden.push(h); }
    });

    const target = document.elementFromPoint(x, y) as HTMLElement | null;

    // Restore all
    hidden.forEach((h) => { h.style.display = ''; });

    if (!target) return '#000000';
    const cs = window.getComputedStyle(target);
    const bg = cs.backgroundColor;
    const raw = bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent' ? bg : cs.color;
    return parseRgbString(raw);
  }, []);

  const close = useCallback(() => { setActive(false); setPreview(null); onClose(); }, [onClose]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active, close]);

  const overlay = active ? createPortal(
    <div ref={overlayRef} className="fixed inset-0 z-[9999] cursor-crosshair"
      onPointerMove={(e) => setPreview({ color: sampleAt(e.clientX, e.clientY), x: e.clientX, y: e.clientY })}
      onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); onPick(sampleAt(e.clientX, e.clientY)); close(); }}
      onContextMenu={(e) => { e.preventDefault(); close(); }}>
      {preview && (
        <div className="fixed pointer-events-none" style={{ left: preview.x + 20, top: preview.y + 20, zIndex: 10000 }}>
          <div className="rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
            <div className="size-12 border-b border-border" style={{ backgroundColor: preview.color }} />
            <div className="px-2 py-1 flex items-center gap-1.5">
              <div className="size-3 rounded-sm border border-border shrink-0" style={{ backgroundColor: preview.color }} />
              <span className="text-[10px] font-mono text-foreground">{preview.color}</span>
            </div>
          </div>
        </div>
      )}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-md bg-popover border border-border shadow-lg px-3 py-1.5" style={{ zIndex: 10000 }}>
        <MIcon name="colorize" size={14} className="text-primary" />
        <span className="text-[10px] text-muted-foreground">Click to pick · Esc to cancel</span>
      </div>
    </div>,
    document.body,
  ) : null;

  return { start, active, overlay };
}

// ─── Preset + Saved Palette ─────────────────────────────

const PRESETS = ['#000000','#ffffff','#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#6366f1','#8b5cf6','#ec4899','#14b8a6','#64748b','#1e293b','#f1f5f9','#fef2f2','#fefce8'];

function Palette({ current, onSelect }: { current: string; onSelect: (c: string) => void }) {
  const [saved, setSaved] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('editor-palette') ?? '[]'); } catch { return []; }
  });
  const save = () => { if (!current || saved.includes(current)) return; const next = [current, ...saved].slice(0, 16); setSaved(next); localStorage.setItem('editor-palette', JSON.stringify(next)); };
  const swatch = (c: string) => (
    <button key={c} onClick={() => onSelect(c)} className="size-5 rounded-sm border border-border cursor-pointer hover:scale-110 transition-transform" style={{ background: c }} />
  );
  return (
    <>
      <div className="grid grid-cols-8 gap-1">{PRESETS.map(swatch)}</div>
      {saved.length > 0 && (
        <div className="mt-1.5 pt-1.5 border-t border-border">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[8px] text-muted-foreground/40">Saved</span>
            <button onClick={() => { setSaved([]); localStorage.removeItem('editor-palette'); }} className="text-[8px] text-muted-foreground/30 hover:text-destructive">Clear</button>
          </div>
          <div className="grid grid-cols-8 gap-1">{saved.map(swatch)}</div>
        </div>
      )}
      <button onClick={save} className="mt-1.5 w-full h-5 rounded border border-dashed border-border text-[9px] text-muted-foreground/50 hover:border-primary/50 hover:text-primary transition-colors">
        + Save current color
      </button>
    </>
  );
}

// ─── Main Color Picker ──────────────────────────────────

type ColorPickerProps = {
  color: string;
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
  const eyedropper = useEyedropper(onChange, () => {});

  useEffect(() => { if (!color) return; const r = hexToRgb(color); setRgb(r); setHsv(rgbToHsv(...r)); }, [color]);
  useEffect(() => { setA(alpha); }, [alpha]);

  const update = useCallback((h: number, s: number, v: number, newAlpha?: number) => {
    const [r, g, b] = hsvToRgb(h, s, v);
    setHsv([h, s, v]); setRgb([r, g, b]); onChange(rgbToHex(r, g, b));
    if (newAlpha !== undefined) { setA(newAlpha); onAlphaChange?.(newAlpha); }
  }, [onChange, onAlphaChange]);

  const handleInputChange = useCallback((c: { hex?: string; r?: number; g?: number; b?: number; alpha?: number }) => {
    if (c.hex) { const r = hexToRgb(c.hex); update(...rgbToHsv(...r)); }
    else if (c.r !== undefined || c.g !== undefined || c.b !== undefined) {
      update(...rgbToHsv(c.r ?? rgb[0], c.g ?? rgb[1], c.b ?? rgb[2]));
    }
    if (c.alpha !== undefined) { setA(c.alpha); onAlphaChange?.(c.alpha); }
  }, [rgb, update, onAlphaChange]);

  const hex = rgbToHex(...rgb);

  return (
    <div className="flex flex-col gap-2">
      {/* Top bar: tabs + eyedropper */}
      <div className="flex items-center gap-1">
        <div className="flex flex-1 gap-px rounded-md overflow-hidden border border-border">
          {(['ramp', 'harmony', 'hsva'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn('flex-1 h-6 text-[9px] font-medium transition-colors', tab === t ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted')}>
              {t === 'ramp' ? 'Ramp' : t === 'harmony' ? 'Wheel' : 'HSVA'}
            </button>
          ))}
        </div>
        <button onClick={eyedropper.start} className={cn('size-6 flex items-center justify-center rounded-md border border-border transition-colors', eyedropper.active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')} title="Eyedropper (pick from canvas)">
          <MIcon name="colorize" size={14} />
        </button>
      </div>

      {/* Picker area */}
      {tab === 'ramp' ? (
        <SaturationValue hue={hsv[0]} s={hsv[1]} v={hsv[2]} onChange={(s, v) => update(hsv[0], s, v)} />
      ) : tab === 'harmony' ? (
        <HarmonyWheel hue={hsv[0]} s={hsv[1]} v={hsv[2]} onChange={(h, s) => update(h, s, hsv[2])} />
      ) : (
        <HSVASliders h={hsv[0]} s={hsv[1]} v={hsv[2]} alpha={a} onChange={(c) => update(c.h ?? hsv[0], c.s ?? hsv[1], c.v ?? hsv[2], c.alpha)} />
      )}

      {/* Sliders (ramp + harmony only) */}
      {tab !== 'hsva' && (
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-md border border-border shrink-0 relative overflow-hidden">
            <div className="absolute inset-0" style={{ backgroundImage: 'repeating-conic-gradient(#d4d4d4 0% 25%, transparent 0% 50%)', backgroundSize: '8px 8px' }} />
            <div className="absolute inset-0" style={{ background: hex, opacity: a }} />
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            <Slider value={hsv[0] / 360} bg="linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)" onChange={(x) => update(x * 360, hsv[1], hsv[2])} />
            {showAlpha && <Slider value={a} bg={`linear-gradient(to right, transparent, ${hex}), repeating-conic-gradient(#d4d4d4 0% 25%, transparent 0% 50%)`} onChange={(x) => { setA(x); onAlphaChange?.(x); }} />}
          </div>
        </div>
      )}

      {/* Inputs */}
      <ColorInputs hex={hex} r={rgb[0]} g={rgb[1]} b={rgb[2]} alpha={a} onChange={handleInputChange} />

      {/* Palette */}
      <Palette current={hex} onSelect={onChange} />

      {/* Eyedropper overlay (portal) */}
      {eyedropper.overlay}
    </div>
  );
}
