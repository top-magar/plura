'use client';

import { useEffect, useRef, useCallback, type ReactNode } from 'react';

// ─── Constants ──────────────────────────────────────────

const SZ = 24;
const FONT = '9px Inter, system-ui, sans-serif';

function stepSize(z: number): number {
  if (z < 0.04) return 2500;
  if (z < 0.07) return 1000;
  if (z < 0.2) return 500;
  if (z < 0.5) return 250;
  if (z < 1) return 100;
  if (z <= 2) return 50;
  if (z < 4) return 25;
  if (z < 15) return 10;
  return 5;
}

// ─── Color Probe (singleton, cached) ────────────────────

let _probe: HTMLDivElement | null = null;
const _cache = new Map<string, string>();
let _cacheTheme = '';

function getProbe(): HTMLDivElement {
  if (!_probe) {
    _probe = document.createElement('div');
    _probe.style.display = 'none';
    document.body.appendChild(_probe);
  }
  return _probe;
}

function resolveColor(prop: string, alpha = 1): string {
  // Invalidate cache on theme change
  const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  if (theme !== _cacheTheme) { _cache.clear(); _cacheTheme = theme; }

  const key = `${prop}:${alpha}`;
  const cached = _cache.get(key);
  if (cached) return cached;

  const probe = getProbe();
  probe.style.color = `var(${prop})`;
  const rgb = getComputedStyle(probe).color;
  let result: string;
  if (alpha === 1) {
    result = rgb;
  } else {
    const m = rgb.match(/(\d+),\s*(\d+),\s*(\d+)/);
    result = m ? `rgba(${m[1]},${m[2]},${m[3]},${alpha})` : rgb;
  }
  _cache.set(key, result);
  return result;
}

// ─── Types ──────────────────────────────────────────────

type RulerProps = {
  zoom: number;
  scrollLeft: number;
  scrollTop: number;
  width: number;
  height: number;
  selectedId: string | null;
  onCreateGuide: (axis: 'x' | 'y', position: number) => void;
  onResetZoom: () => void;
};

type SelBand = { start: number; size: number } | null;

// ─── Component ──────────────────────────────────────────

export default function Rulers({ zoom, scrollLeft, scrollTop, width, height, selectedId, onCreateGuide, onResetZoom }: RulerProps): ReactNode {
  const hRef = useRef<HTMLCanvasElement>(null);
  const vRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<{ x: number; y: number } | null>(null);
  const propsRef = useRef({ zoom, scrollLeft, scrollTop, width, height });
  propsRef.current = { zoom, scrollLeft, scrollTop, width, height };

  // Selection band (element position on canvas)
  const hBandRef = useRef<SelBand>(null);
  const vBandRef = useRef<SelBand>(null);

  // Track selected element position relative to scroll container (ruler-aligned)
  useEffect(() => {
    if (!selectedId) { hBandRef.current = null; vBandRef.current = null; return; }
    const el = document.querySelector(`[data-el-id="${selectedId}"]`) as HTMLElement | null;
    const scrollContainer = document.querySelector('[data-canvas]')?.parentElement as HTMLElement | null;
    if (!el || !scrollContainer) { hBandRef.current = null; vBandRef.current = null; return; }
    const update = () => {
      const er = el.getBoundingClientRect();
      const sr = scrollContainer.getBoundingClientRect();
      hBandRef.current = { start: er.left - sr.left, size: er.width };
      vBandRef.current = { start: er.top - sr.top, size: er.height };
      dirtyRef.current = true;
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    // Also update on scroll
    const onScroll = () => { update(); };
    scrollContainer.addEventListener('scroll', onScroll, { passive: true });
    return () => { ro.disconnect(); scrollContainer.removeEventListener('scroll', onScroll); };
  }, [selectedId, zoom, scrollLeft, scrollTop]);

  // ─── RAF Draw Loop ──────────────────────────────────────

  const dirtyRef = useRef(true);

  // Mark dirty on input changes
  useEffect(() => { dirtyRef.current = true; }, [zoom, scrollLeft, scrollTop, width, height, selectedId]);

  useEffect(() => {
    let raf = 0;
    const draw = () => {
      if (dirtyRef.current) {
        dirtyRef.current = false;
        drawRuler('h');
        drawRuler('v');
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Cursor tracking (marks dirty on move)
  useEffect(() => {
    const onMove = (e: PointerEvent) => { cursorRef.current = { x: e.clientX, y: e.clientY }; dirtyRef.current = true; };
    const onLeave = () => { cursorRef.current = null; dirtyRef.current = true; };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerleave', onLeave); };
  }, []);

  function drawRuler(axis: 'h' | 'v') {
    const canvas = axis === 'h' ? hRef.current : vRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { zoom: zm, scrollLeft: sl, scrollTop: st, width: w, height: h } = propsRef.current;
    const z = zm / 100;
    const step = stepSize(z);
    const dpr = devicePixelRatio || 1;
    const len = axis === 'h' ? w : h;

    // Resize buffer if needed
    const bufW = axis === 'h' ? len * dpr : SZ * dpr;
    const bufH = axis === 'h' ? SZ * dpr : len * dpr;
    if (canvas.width !== bufW || canvas.height !== bufH) {
      canvas.width = bufW;
      canvas.height = bufH;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Colors (cached)
    const bg = resolveColor('--background');
    const tick = resolveColor('--muted-foreground', 0.25);
    const tickMajor = resolveColor('--muted-foreground', 0.4);
    const text = resolveColor('--muted-foreground', 0.5);
    const border = resolveColor('--border', 0.5);
    const band = resolveColor('--primary', 0.04);
    const bandEdge = resolveColor('--primary', 0.3);
    const cursorColor = resolveColor('--primary', 0.6);

    // Background
    if (axis === 'h') {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, len, SZ);
    } else {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, SZ, len);
    }

    // Selection band
    const selBand = axis === 'h' ? hBandRef.current : vBandRef.current;
    if (selBand) {
      ctx.fillStyle = band;
      if (axis === 'h') {
        ctx.fillRect(selBand.start, 0, selBand.size, SZ);
        ctx.fillStyle = bandEdge;
        ctx.fillRect(selBand.start, SZ - 4, 1, 4);
        ctx.fillRect(selBand.start + selBand.size - 1, SZ - 4, 1, 4);
      } else {
        ctx.fillRect(0, selBand.start, SZ, selBand.size);
        ctx.fillStyle = bandEdge;
        ctx.fillRect(SZ - 4, selBand.start, 4, 1);
        ctx.fillRect(SZ - 4, selBand.start + selBand.size - 1, 4, 1);
      }
    }

    // Ticks
    const scroll = axis === 'h' ? sl : st;
    const startPx = scroll / z;
    const first = Math.floor(startPx / step) * step;
    const end = startPx + len / z;
    ctx.font = FONT;
    ctx.textAlign = 'left';

    for (let v = first; v < end; v += step) {
      const pos = (v - startPx) * z;
      const isMajor = v % (step * 5) === 0;
      ctx.strokeStyle = isMajor ? tickMajor : tick;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      if (axis === 'h') {
        ctx.moveTo(pos, isMajor ? SZ - 10 : SZ - 5);
        ctx.lineTo(pos, SZ);
      } else {
        ctx.moveTo(isMajor ? SZ - 10 : SZ - 5, pos);
        ctx.lineTo(SZ, pos);
      }
      ctx.stroke();

      if (isMajor) {
        ctx.fillStyle = text;
        if (axis === 'h') {
          ctx.fillText(String(Math.round(v)), pos + 2, 10);
        } else {
          ctx.save();
          ctx.translate(10, pos + 2);
          ctx.rotate(-Math.PI / 2);
          ctx.textAlign = 'right';
          ctx.fillText(String(Math.round(v)), 0, 0);
          ctx.restore();
        }
      }
    }

    // Cursor indicator
    const cur = cursorRef.current;
    if (cur) {
      const hCanvas = hRef.current;
      const vCanvas = vRef.current;
      const rect = (axis === 'h' ? hCanvas : vCanvas)?.getBoundingClientRect();
      if (rect) {
        const pos = axis === 'h' ? cur.x - rect.left : cur.y - rect.top;
        if (pos > 0 && pos < len) {
          ctx.strokeStyle = cursorColor;
          ctx.lineWidth = 1;
          ctx.beginPath();
          if (axis === 'h') { ctx.moveTo(pos, 0); ctx.lineTo(pos, SZ); }
          else { ctx.moveTo(0, pos); ctx.lineTo(SZ, pos); }
          ctx.stroke();
        }
      }
    }

    // Edge border
    ctx.strokeStyle = border;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    if (axis === 'h') { ctx.moveTo(0, SZ - 0.5); ctx.lineTo(len, SZ - 0.5); }
    else { ctx.moveTo(SZ - 0.5, 0); ctx.lineTo(SZ - 0.5, len); }
    ctx.stroke();
  }

  // ─── Guide Drag (pointer capture) ────────────────────────

  const onRulerDown = useCallback((axis: 'x' | 'y', e: React.PointerEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    const ghost = document.createElement('div');
    const scrollContainer = document.querySelector('[data-canvas]')?.parentElement as HTMLElement | null;
    const sr = scrollContainer?.getBoundingClientRect();
    if (!sr) return;
    const clip = axis === 'x'
      ? `width:1px;top:${sr.top}px;bottom:${window.innerHeight - sr.bottom}px`
      : `height:1px;left:${sr.left}px;right:${window.innerWidth - sr.right}px`;
    ghost.style.cssText = `position:fixed;z-index:50;pointer-events:none;${clip};background:${resolveColor('--primary', 0.4)}`;
    document.body.appendChild(ghost);

    const onMove = (ev: PointerEvent) => {
      if (axis === 'x') ghost.style.left = `${ev.clientX}px`;
      else ghost.style.top = `${ev.clientY}px`;
    };
    const onUp = (ev: PointerEvent) => {
      ghost.remove();
      target.releasePointerCapture(ev.pointerId);
      target.removeEventListener('pointermove', onMove);
      target.removeEventListener('pointerup', onUp);

      const scrollEl = document.querySelector('[data-canvas]')?.parentElement as HTMLElement | null;
      if (scrollEl) {
        const sr = scrollEl.getBoundingClientRect();
        const z = zoom / 100;
        const pos = axis === 'x'
          ? (ev.clientX - sr.left + scrollEl.scrollLeft) / z
          : (ev.clientY - sr.top + scrollEl.scrollTop) / z;
        if (pos > 0) onCreateGuide(axis, Math.round(pos));
      }
    };
    target.addEventListener('pointermove', onMove);
    target.addEventListener('pointerup', onUp);
  }, [zoom, onCreateGuide]);

  return (
    <>
      {/* Corner — zoom % */}
      <div
        className="flex items-center justify-center cursor-pointer select-none bg-background border-r border-b border-border/30 hover:bg-muted/50 transition-colors"
        style={{ gridArea: 'corner' }}
        onClick={onResetZoom}
        title={`${zoom}% — Click to reset`}
      >
        <span className="text-[8px] font-mono text-muted-foreground/50 tabular-nums">{zoom}</span>
      </div>

      {/* Horizontal ruler */}
      <div
        className="cursor-s-resize bg-background border-b border-border/30 overflow-hidden"
        style={{ gridArea: 'hruler' }}
        onPointerDown={(e) => onRulerDown('y', e)}
      >
        <canvas ref={hRef} className="block w-full" style={{ height: SZ }} />
      </div>

      {/* Vertical ruler */}
      <div
        className="cursor-e-resize bg-background border-r border-border/30 overflow-hidden"
        style={{ gridArea: 'vruler' }}
        onPointerDown={(e) => onRulerDown('x', e)}
      >
        <canvas ref={vRef} className="block h-full" style={{ width: SZ }} />
      </div>
    </>
  );
}
