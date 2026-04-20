'use client';

import { useEffect, useRef, useState, useCallback, type ReactNode } from 'react';

const SZ = 24;
const FONT = '9px Inter, system-ui, sans-serif';

function stepSize(zoom: number): number {
  if (zoom < 0.04) return 2500;
  if (zoom < 0.07) return 1000;
  if (zoom < 0.2) return 500;
  if (zoom < 0.5) return 250;
  if (zoom < 1) return 100;
  if (zoom <= 2) return 50;
  if (zoom < 4) return 25;
  if (zoom < 15) return 10;
  return 5;
}

/** Resolve a CSS custom property to a usable canvas color */
function resolveColor(prop: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  // Create a temp element, set its color to the CSS var, read computed value
  const el = document.createElement('div');
  el.style.color = `var(${prop})`;
  el.style.display = 'none';
  document.body.appendChild(el);
  const computed = getComputedStyle(el).color;
  el.remove();
  return computed || fallback;
}

function resolveColorWithAlpha(prop: string, alpha: number, fallback: string): string {
  const c = resolveColor(prop, fallback);
  const m = c.match(/(\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return fallback;
  return `rgba(${m[1]}, ${m[2]}, ${m[3]}, ${alpha})`;
}

type SelRect = { x: number; y: number; w: number; h: number } | null;

export default function Rulers({ zoom, scrollLeft, scrollTop, width, height, selectedId, onCreateGuide, onResetZoom }: {
  zoom: number; scrollLeft: number; scrollTop: number; width: number; height: number;
  selectedId: string | null;
  onCreateGuide: (axis: 'x' | 'y', position: number) => void;
  onResetZoom: () => void;
}): ReactNode {
  const hRef = useRef<HTMLCanvasElement>(null);
  const vRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [selRect, setSelRect] = useState<SelRect>(null);
  const z = zoom / 100;
  const step = stepSize(z);

  // Track cursor
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => setCursor({ x: e.clientX, y: e.clientY });
    const onLeave = () => setCursor(null);
    el.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerleave', onLeave);
    return () => { el.removeEventListener('pointermove', onMove); el.removeEventListener('pointerleave', onLeave); };
  }, []);

  // Track selected element rect
  useEffect(() => {
    if (!selectedId) { setSelRect(null); return; }
    const el = document.querySelector(`[data-el-id="${selectedId}"]`) as HTMLElement | null;
    const canvas = document.querySelector('[data-canvas]') as HTMLElement | null;
    if (!el || !canvas) { setSelRect(null); return; }
    const update = () => {
      const er = el.getBoundingClientRect();
      const cr = canvas.getBoundingClientRect();
      setSelRect({ x: er.left - cr.left, y: er.top - cr.top, w: er.width, h: er.height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [selectedId]);

  // Draw
  useEffect(() => {
    const dpr = window.devicePixelRatio || 1;
    const bg = resolveColor('--background', '#fafafa');
    const borderColor = resolveColorWithAlpha('--border', 0.4, 'rgba(0,0,0,0.08)');
    const tickMajor = resolveColorWithAlpha('--muted-foreground', 0.3, 'rgba(0,0,0,0.3)');
    const tickMinor = resolveColorWithAlpha('--muted-foreground', 0.1, 'rgba(0,0,0,0.1)');
    const textColor = resolveColorWithAlpha('--muted-foreground', 0.45, 'rgba(0,0,0,0.45)');
    const primary = resolveColor('--primary', '#6366f1');
    const primaryBand = resolveColorWithAlpha('--primary', 0.08, 'rgba(99,102,241,0.08)');
    const primaryEdge = resolveColorWithAlpha('--primary', 0.5, 'rgba(99,102,241,0.5)');
    const cursorLine = resolveColorWithAlpha('--primary', 0.6, 'rgba(99,102,241,0.6)');

    // ── Horizontal ──
    const hc = hRef.current;
    if (hc) {
      const ctx = hc.getContext('2d');
      if (!ctx) return;
      const cw = width - SZ;
      hc.width = cw * dpr;
      hc.height = SZ * dpr;
      ctx.scale(dpr, dpr);

      // Background
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, cw, SZ);

      // Selection highlight band
      if (selRect) {
        ctx.fillStyle = primaryBand;
        const sx = selRect.x;
        ctx.fillRect(sx, 0, selRect.w, SZ);
        ctx.fillStyle = primaryEdge;
        ctx.fillRect(sx, SZ - 3, 1, 3);
        ctx.fillRect(sx + selRect.w, SZ - 3, 1, 3);
      }

      // Ticks
      ctx.font = FONT;
      ctx.textAlign = 'left';
      const startPx = scrollLeft / z;
      const first = Math.floor(startPx / step) * step;
      for (let v = first; v < startPx + cw / z; v += step) {
        const x = (v - startPx) * z;
        const isMajor = v % (step * 5) === 0;
        ctx.strokeStyle = isMajor ? tickMajor : tickMinor;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x, isMajor ? SZ - 10 : SZ - 5);
        ctx.lineTo(x, SZ);
        ctx.stroke();
        if (isMajor) {
          ctx.fillStyle = textColor;
          ctx.fillText(String(Math.round(v)), x + 2, SZ - 13);
        }
      }

      // Cursor indicator
      if (cursor && containerRef.current) {
        const cr = containerRef.current.getBoundingClientRect();
        const cx = cursor.x - cr.left - SZ;
        if (cx > 0 && cx < cw) {
          ctx.strokeStyle = cursorLine;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, SZ); ctx.stroke();
        }
      }

      // Bottom edge
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(0, SZ - 0.5); ctx.lineTo(cw, SZ - 0.5); ctx.stroke();
    }

    // ── Vertical ──
    const vc = vRef.current;
    if (vc) {
      const ctx = vc.getContext('2d');
      if (!ctx) return;
      const ch = height - SZ;
      vc.width = SZ * dpr;
      vc.height = ch * dpr;
      ctx.scale(dpr, dpr);

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, SZ, ch);

      if (selRect) {
        ctx.fillStyle = primaryBand;
        const sy = selRect.y;
        ctx.fillRect(0, sy, SZ, selRect.h);
        ctx.fillStyle = primaryEdge;
        ctx.fillRect(SZ - 3, sy, 3, 1);
        ctx.fillRect(SZ - 3, sy + selRect.h, 3, 1);
      }

      ctx.font = FONT;
      const startPx = scrollTop / z;
      const first = Math.floor(startPx / step) * step;
      for (let v = first; v < startPx + ch / z; v += step) {
        const y = (v - startPx) * z;
        const isMajor = v % (step * 5) === 0;
        ctx.strokeStyle = isMajor ? tickMajor : tickMinor;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(isMajor ? SZ - 10 : SZ - 5, y);
        ctx.lineTo(SZ, y);
        ctx.stroke();
        if (isMajor) {
          ctx.fillStyle = textColor;
          ctx.save();
          ctx.translate(SZ - 13, y + 2);
          ctx.rotate(-Math.PI / 2);
          ctx.textAlign = 'right';
          ctx.fillText(String(Math.round(v)), 0, 0);
          ctx.restore();
        }
      }

      if (cursor && containerRef.current) {
        const cr = containerRef.current.getBoundingClientRect();
        const cy = cursor.y - cr.top - SZ;
        if (cy > 0 && cy < ch) {
          ctx.strokeStyle = cursorLine;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(SZ, cy); ctx.stroke();
        }
      }

      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(SZ - 0.5, 0); ctx.lineTo(SZ - 0.5, ch); ctx.stroke();
    }
  }, [zoom, scrollLeft, scrollTop, width, height, step, z, cursor, selRect]);

  // Drag from ruler to create guide
  const startGuideDrag = useCallback((axis: 'x' | 'y', e: React.PointerEvent) => {
    e.preventDefault();
    const ghost = document.createElement('div');
    const ghostColor = resolveColorWithAlpha('--primary', 0.5, 'rgba(99,102,241,0.5)');
    ghost.style.cssText = `position:fixed;z-index:9999;pointer-events:none;background:${ghostColor};${axis === 'x' ? 'width:1px;top:0;bottom:0' : 'height:1px;left:0;right:0'}`;
    document.body.appendChild(ghost);

    const onMove = (ev: PointerEvent) => {
      if (axis === 'x') ghost.style.left = `${ev.clientX}px`;
      else ghost.style.top = `${ev.clientY}px`;
    };
    const onUp = (ev: PointerEvent) => {
      ghost.remove();
      const canvasEl = document.querySelector('[data-canvas]');
      if (canvasEl) {
        const cr = canvasEl.getBoundingClientRect();
        const pos = axis === 'x'
          ? (ev.clientX - cr.left) / z
          : (ev.clientY - cr.top) / z;
        if (pos > 0) onCreateGuide(axis, Math.round(pos));
      }
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }, [z, onCreateGuide]);

  return (
    <div ref={containerRef} className="contents">
      {/* Corner — zoom indicator */}
      <div
        className="sticky top-0 left-0 z-40 flex items-center justify-center cursor-pointer select-none bg-background/80 backdrop-blur-sm border-r border-b border-border/40 hover:bg-muted/60 transition-colors"
        style={{ width: SZ, height: SZ, gridArea: '1 / 1' }}
        onClick={onResetZoom}
        title={`${zoom}% — Click to reset`}
      >
        <span className="text-[7px] font-mono text-muted-foreground/50 leading-none tabular-nums">{zoom}</span>
      </div>

      {/* Horizontal ruler */}
      <div
        className="sticky top-0 z-30 cursor-s-resize bg-background/80 backdrop-blur-sm border-b border-border/40"
        style={{ height: SZ, marginLeft: SZ }}
        onPointerDown={(e) => startGuideDrag('y', e)}
      >
        <canvas ref={hRef} style={{ width: width - SZ, height: SZ, display: 'block' }} />
      </div>

      {/* Vertical ruler */}
      <div
        className="sticky left-0 z-30 cursor-e-resize bg-background/80 backdrop-blur-sm border-r border-border/40"
        style={{ width: SZ, position: 'absolute', top: SZ, bottom: 0 }}
        onPointerDown={(e) => startGuideDrag('x', e)}
      >
        <canvas ref={vRef} style={{ width: SZ, height: height - SZ, display: 'block' }} />
      </div>
    </div>
  );
}
