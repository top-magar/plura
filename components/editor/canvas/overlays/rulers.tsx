'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

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

export default function Rulers({ zoom, scrollLeft, scrollTop, width, height }: {
  zoom: number; scrollLeft: number; scrollTop: number; width: number; height: number;
}): ReactNode {
  const hRef = useRef<HTMLCanvasElement>(null);
  const vRef = useRef<HTMLCanvasElement>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [dims, setDims] = useState({ w: width, h: height });
  const z = zoom / 100;
  const step = stepSize(z);

  // ResizeObserver for DPR-aware sizing
  useEffect(() => {
    const hc = hRef.current?.parentElement;
    if (!hc) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width: w, height: h } = entry.contentRect;
      setDims({ w, h });
    });
    ro.observe(hc);
    return () => ro.disconnect();
  }, []);

  // Cursor tracking for position indicator
  useEffect(() => {
    const onMove = (e: PointerEvent) => setCursor({ x: e.clientX, y: e.clientY });
    const onLeave = () => setCursor(null);
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerleave', onLeave);
    return () => { document.removeEventListener('pointermove', onMove); document.removeEventListener('pointerleave', onLeave); };
  }, []);

  const w = dims.w || width;
  const h = dims.h || height;

  useEffect(() => {
    const dpr = window.devicePixelRatio || 1;

    // Horizontal ruler
    const hc = hRef.current;
    if (hc) {
      const ctx = hc.getContext('2d');
      if (!ctx) return;
      hc.width = w * dpr;
      hc.height = RULER_SIZE * dpr;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, RULER_SIZE);
      ctx.fillStyle = 'hsl(var(--sidebar-background))';
      ctx.fillRect(0, 0, w, RULER_SIZE);
      ctx.strokeStyle = 'hsl(var(--border))';
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(0, RULER_SIZE - 0.5); ctx.lineTo(w, RULER_SIZE - 0.5); ctx.stroke();

      ctx.fillStyle = 'hsl(var(--muted-foreground) / 0.5)';
      ctx.font = FONT;
      ctx.textAlign = 'left';

      const startPx = scrollLeft / z;
      const first = Math.floor(startPx / step) * step;
      for (let v = first; v < startPx + w / z; v += step) {
        const x = (v - startPx) * z;
        const isMajor = v % (step * 5) === 0;
        ctx.beginPath();
        ctx.moveTo(x, isMajor ? RULER_SIZE - 10 : RULER_SIZE - 5);
        ctx.lineTo(x, RULER_SIZE);
        ctx.strokeStyle = isMajor ? 'hsl(var(--muted-foreground) / 0.4)' : 'hsl(var(--muted-foreground) / 0.15)';
        ctx.stroke();
        if (isMajor) ctx.fillText(String(Math.round(v)), x + 2, RULER_SIZE - 12);
      }

      // Cursor position indicator
      if (cursor) {
        const canvasEl = hc.closest('[data-canvas]') ?? hc.parentElement;
        if (canvasEl) {
          const cr = canvasEl.getBoundingClientRect();
          const cx = cursor.x - cr.left;
          if (cx > 0 && cx < w) {
            ctx.strokeStyle = 'hsl(var(--primary))';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, RULER_SIZE); ctx.stroke();
          }
        }
      }
    }

    // Vertical ruler
    const vc = vRef.current;
    if (vc) {
      const ctx = vc.getContext('2d');
      if (!ctx) return;
      vc.width = RULER_SIZE * dpr;
      vc.height = h * dpr;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, RULER_SIZE, h);
      ctx.fillStyle = 'hsl(var(--sidebar-background))';
      ctx.fillRect(0, 0, RULER_SIZE, h);
      ctx.strokeStyle = 'hsl(var(--border))';
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(RULER_SIZE - 0.5, 0); ctx.lineTo(RULER_SIZE - 0.5, h); ctx.stroke();

      ctx.fillStyle = 'hsl(var(--muted-foreground) / 0.5)';
      ctx.font = FONT;

      const startPx = scrollTop / z;
      const first = Math.floor(startPx / step) * step;
      for (let v = first; v < startPx + h / z; v += step) {
        const y = (v - startPx) * z;
        const isMajor = v % (step * 5) === 0;
        ctx.beginPath();
        ctx.moveTo(isMajor ? RULER_SIZE - 10 : RULER_SIZE - 5, y);
        ctx.lineTo(RULER_SIZE, y);
        ctx.strokeStyle = isMajor ? 'hsl(var(--muted-foreground) / 0.4)' : 'hsl(var(--muted-foreground) / 0.15)';
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

      // Cursor position indicator
      if (cursor) {
        const canvasEl = vc.closest('[data-canvas]') ?? vc.parentElement;
        if (canvasEl) {
          const cr = canvasEl.getBoundingClientRect();
          const cy = cursor.y - cr.top;
          if (cy > 0 && cy < h) {
            ctx.strokeStyle = 'hsl(var(--primary))';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(RULER_SIZE, cy); ctx.stroke();
          }
        }
      }
    }
  }, [zoom, scrollLeft, scrollTop, w, h, step, z, cursor]);

  return (
    <>
      <div className="absolute top-0 left-0 z-30 bg-sidebar border-r border-b border-sidebar-border" style={{ width: RULER_SIZE, height: RULER_SIZE }} />
      <canvas ref={hRef} className="absolute top-0 z-20 pointer-events-none" style={{ left: RULER_SIZE, width: w - RULER_SIZE, height: RULER_SIZE }} />
      <canvas ref={vRef} className="absolute left-0 z-20 pointer-events-none" style={{ top: RULER_SIZE, width: RULER_SIZE, height: h - RULER_SIZE }} />
    </>
  );
}
