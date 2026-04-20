'use client';

import { useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import type { useEditor } from '../../core/provider';

const RULER_SIZE = 22;
const FONT = '10px Inter, system-ui, sans-serif';

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

type SelRect = { x: number; y: number; w: number; h: number } | null;

export default function Rulers({ zoom, scrollLeft, scrollTop, width, height, selectedId, onCreateGuide, onResetZoom }: {
  zoom: number; scrollLeft: number; scrollTop: number; width: number; height: number;
  selectedId: string | null;
  onCreateGuide: (axis: 'x' | 'y', position: number) => void;
  onResetZoom: () => void;
}): ReactNode {
  const hRef = useRef<HTMLCanvasElement>(null);
  const vRef = useRef<HTMLCanvasElement>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [selRect, setSelRect] = useState<SelRect>(null);
  const z = zoom / 100;
  const step = stepSize(z);

  // Track cursor position
  useEffect(() => {
    const onMove = (e: PointerEvent) => setCursor({ x: e.clientX, y: e.clientY });
    const onLeave = () => setCursor(null);
    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    return () => { document.removeEventListener('pointermove', onMove); document.removeEventListener('pointerleave', onLeave); };
  }, []);

  // Track selected element rect for blue highlight
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

  // Draw rulers
  useEffect(() => {
    const dpr = window.devicePixelRatio || 1;
    const primary = '#6366f1'; // indigo-500
    const primaryLight = 'rgba(99, 102, 241, 0.12)';

    // ── Horizontal ruler ──
    const hc = hRef.current;
    if (hc) {
      const ctx = hc.getContext('2d');
      if (!ctx) return;
      const cw = width - RULER_SIZE;
      hc.width = cw * dpr;
      hc.height = RULER_SIZE * dpr;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, cw, RULER_SIZE);

      // Background
      ctx.fillStyle = 'hsl(var(--sidebar-background))';
      ctx.fillRect(0, 0, cw, RULER_SIZE);

      // Blue selection highlight band (Figma behavior)
      if (selRect) {
        const sx = selRect.x - scrollLeft / z * z;
        ctx.fillStyle = primaryLight;
        ctx.fillRect(sx, 0, selRect.w, RULER_SIZE);
        // Edge markers
        ctx.strokeStyle = primary;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(sx, RULER_SIZE - 6); ctx.lineTo(sx, RULER_SIZE); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(sx + selRect.w, RULER_SIZE - 6); ctx.lineTo(sx + selRect.w, RULER_SIZE); ctx.stroke();
      }

      // Tick marks
      ctx.fillStyle = 'hsl(var(--muted-foreground) / 0.5)';
      ctx.font = FONT;
      ctx.textAlign = 'left';
      const startPx = scrollLeft / z;
      const first = Math.floor(startPx / step) * step;
      for (let v = first; v < startPx + cw / z; v += step) {
        const x = (v - startPx) * z;
        const isMajor = v % (step * 5) === 0;
        ctx.beginPath();
        ctx.moveTo(x, isMajor ? RULER_SIZE - 10 : RULER_SIZE - 5);
        ctx.lineTo(x, RULER_SIZE);
        ctx.strokeStyle = isMajor ? 'hsl(var(--muted-foreground) / 0.4)' : 'hsl(var(--muted-foreground) / 0.15)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        if (isMajor) ctx.fillText(String(Math.round(v)), x + 2, RULER_SIZE - 12);
      }

      // Cursor indicator
      if (cursor) {
        const canvasEl = hc.closest('[data-canvas]') ?? hc.parentElement?.parentElement;
        if (canvasEl) {
          const cr = canvasEl.getBoundingClientRect();
          const cx = cursor.x - cr.left - RULER_SIZE;
          if (cx > 0 && cx < cw) {
            ctx.strokeStyle = primary;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, RULER_SIZE); ctx.stroke();
          }
        }
      }

      // Bottom border
      ctx.strokeStyle = 'hsl(var(--border))';
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(0, RULER_SIZE - 0.5); ctx.lineTo(cw, RULER_SIZE - 0.5); ctx.stroke();
    }

    // ── Vertical ruler ──
    const vc = vRef.current;
    if (vc) {
      const ctx = vc.getContext('2d');
      if (!ctx) return;
      const ch = height - RULER_SIZE;
      vc.width = RULER_SIZE * dpr;
      vc.height = ch * dpr;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, RULER_SIZE, ch);

      ctx.fillStyle = 'hsl(var(--sidebar-background))';
      ctx.fillRect(0, 0, RULER_SIZE, ch);

      // Blue selection highlight band
      if (selRect) {
        const sy = selRect.y - scrollTop / z * z;
        ctx.fillStyle = primaryLight;
        ctx.fillRect(0, sy, RULER_SIZE, selRect.h);
        ctx.strokeStyle = primary;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(RULER_SIZE - 6, sy); ctx.lineTo(RULER_SIZE, sy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(RULER_SIZE - 6, sy + selRect.h); ctx.lineTo(RULER_SIZE, sy + selRect.h); ctx.stroke();
      }

      ctx.fillStyle = 'hsl(var(--muted-foreground) / 0.5)';
      ctx.font = FONT;
      const startPx = scrollTop / z;
      const first = Math.floor(startPx / step) * step;
      for (let v = first; v < startPx + ch / z; v += step) {
        const y = (v - startPx) * z;
        const isMajor = v % (step * 5) === 0;
        ctx.beginPath();
        ctx.moveTo(isMajor ? RULER_SIZE - 10 : RULER_SIZE - 5, y);
        ctx.lineTo(RULER_SIZE, y);
        ctx.strokeStyle = isMajor ? 'hsl(var(--muted-foreground) / 0.4)' : 'hsl(var(--muted-foreground) / 0.15)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        if (isMajor) {
          ctx.save();
          ctx.translate(RULER_SIZE - 12, y + 2);
          ctx.rotate(-Math.PI / 2);
          ctx.textAlign = 'right';
          ctx.fillText(String(Math.round(v)), 0, 0);
          ctx.restore();
        }
      }

      // Cursor indicator
      if (cursor) {
        const canvasEl = vc.closest('[data-canvas]') ?? vc.parentElement?.parentElement;
        if (canvasEl) {
          const cr = canvasEl.getBoundingClientRect();
          const cy = cursor.y - cr.top - RULER_SIZE;
          if (cy > 0 && cy < ch) {
            ctx.strokeStyle = primary;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(RULER_SIZE, cy); ctx.stroke();
          }
        }
      }

      // Right border
      ctx.strokeStyle = 'hsl(var(--border))';
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(RULER_SIZE - 0.5, 0); ctx.lineTo(RULER_SIZE - 0.5, ch); ctx.stroke();
    }
  }, [zoom, scrollLeft, scrollTop, width, height, step, z, cursor, selRect]);

  // Drag from ruler to create guide
  const startGuideDrag = useCallback((axis: 'x' | 'y', e: React.PointerEvent) => {
    e.preventDefault();
    const startPos = axis === 'x' ? e.clientX : e.clientY;
    const ghost = document.createElement('div');
    ghost.style.cssText = `position:fixed;z-index:9999;pointer-events:none;${axis === 'x' ? 'width:1px;top:0;bottom:0' : 'height:1px;left:0;right:0'};background:#818cf8`;
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
          ? (ev.clientX - cr.left + scrollLeft) / z
          : (ev.clientY - cr.top + scrollTop) / z;
        if (pos > 0) onCreateGuide(axis, Math.round(pos));
      }
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }, [z, scrollLeft, scrollTop, onCreateGuide]);

  return (
    <>
      {/* Corner square — zoom indicator */}
      <div
        className="absolute top-0 left-0 z-30 bg-sidebar border-r border-b border-sidebar-border flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors select-none"
        style={{ width: RULER_SIZE, height: RULER_SIZE }}
        onClick={onResetZoom}
        title="Reset zoom to 100%"
      >
        <span className="text-[7px] font-mono text-muted-foreground/60 leading-none">{zoom}%</span>
      </div>
      {/* Horizontal ruler — interactive (drag to create guide) */}
      <div
        className="absolute top-0 z-20 cursor-row-resize"
        style={{ left: RULER_SIZE, width: width - RULER_SIZE, height: RULER_SIZE }}
        onPointerDown={(e) => startGuideDrag('y', e)}
      >
        <canvas ref={hRef} className="pointer-events-none" style={{ width: '100%', height: RULER_SIZE }} />
      </div>
      {/* Vertical ruler — interactive (drag to create guide) */}
      <div
        className="absolute left-0 z-20 cursor-col-resize"
        style={{ top: RULER_SIZE, width: RULER_SIZE, height: height - RULER_SIZE }}
        onPointerDown={(e) => startGuideDrag('x', e)}
      >
        <canvas ref={vRef} className="pointer-events-none" style={{ width: RULER_SIZE, height: '100%' }} />
      </div>
    </>
  );
}
