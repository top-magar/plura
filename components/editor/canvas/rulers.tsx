'use client';

import { useEffect, useRef, type ReactNode } from 'react';

const RULER_SIZE = 22;
const FONT = '10px Inter, system-ui, sans-serif';

/** Penpot's calculate-step-size — adapts tick spacing to zoom level */
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
  const z = zoom / 100;
  const step = stepSize(z);

  useEffect(() => {
    // Horizontal ruler
    const hc = hRef.current;
    if (hc) {
      const ctx = hc.getContext('2d');
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      hc.width = width * dpr;
      hc.height = RULER_SIZE * dpr;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, RULER_SIZE);
      ctx.fillStyle = 'hsl(var(--sidebar-background))';
      ctx.fillRect(0, 0, width, RULER_SIZE);
      ctx.strokeStyle = 'hsl(var(--border))';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, RULER_SIZE - 0.5);
      ctx.lineTo(width, RULER_SIZE - 0.5);
      ctx.stroke();

      ctx.fillStyle = 'hsl(var(--muted-foreground) / 0.5)';
      ctx.font = FONT;
      ctx.textAlign = 'left';

      const startPx = scrollLeft / z;
      const first = Math.floor(startPx / step) * step;
      for (let v = first; v < startPx + width / z; v += step) {
        const x = (v - startPx) * z;
        const isMajor = v % (step * 5) === 0;
        ctx.beginPath();
        ctx.moveTo(x, isMajor ? RULER_SIZE - 10 : RULER_SIZE - 5);
        ctx.lineTo(x, RULER_SIZE);
        ctx.strokeStyle = isMajor ? 'hsl(var(--muted-foreground) / 0.4)' : 'hsl(var(--muted-foreground) / 0.15)';
        ctx.stroke();
        if (isMajor) ctx.fillText(String(Math.round(v)), x + 2, RULER_SIZE - 12);
      }
    }

    // Vertical ruler
    const vc = vRef.current;
    if (vc) {
      const ctx = vc.getContext('2d');
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      vc.width = RULER_SIZE * dpr;
      vc.height = height * dpr;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, RULER_SIZE, height);
      ctx.fillStyle = 'hsl(var(--sidebar-background))';
      ctx.fillRect(0, 0, RULER_SIZE, height);
      ctx.strokeStyle = 'hsl(var(--border))';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(RULER_SIZE - 0.5, 0);
      ctx.lineTo(RULER_SIZE - 0.5, height);
      ctx.stroke();

      ctx.fillStyle = 'hsl(var(--muted-foreground) / 0.5)';
      ctx.font = FONT;

      const startPx = scrollTop / z;
      const first = Math.floor(startPx / step) * step;
      for (let v = first; v < startPx + height / z; v += step) {
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
    }
  }, [zoom, scrollLeft, scrollTop, width, height, step, z]);

  return (
    <>
      {/* Corner square */}
      <div className="absolute top-0 left-0 z-30 bg-sidebar border-r border-b border-sidebar-border" style={{ width: RULER_SIZE, height: RULER_SIZE }} />
      {/* Horizontal ruler */}
      <canvas ref={hRef} className="absolute top-0 z-20 pointer-events-none" style={{ left: RULER_SIZE, width: width - RULER_SIZE, height: RULER_SIZE }} />
      {/* Vertical ruler */}
      <canvas ref={vRef} className="absolute left-0 z-20 pointer-events-none" style={{ top: RULER_SIZE, width: RULER_SIZE, height: height - RULER_SIZE }} />
    </>
  );
}
