'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { useEditor } from '../../core/provider';
import { findEl } from '../../core/tree-helpers';
import type { El } from '../../core/types';

type Rect = { x: number; y: number; w: number; h: number };

export default function Marquee({ canvasRef }: { canvasRef: React.RefObject<HTMLDivElement | null> }): ReactNode {
  const { state, dispatch } = useEditor();
  const { preview, elements } = state.editor;
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el || preview) return;

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      // Skip if clicking on any editor element (wrapper, handle, toolbar, etc)
      const target = e.target as HTMLElement;
      if (target.closest('[data-wrapper]')) return;

      const cr = el.getBoundingClientRect();
      const sx = e.clientX - cr.left + el.scrollLeft;
      const sy = e.clientY - cr.top + el.scrollTop;
      let moved = false;

      const onMove = (ev: PointerEvent) => {
        moved = true;
        const cx = ev.clientX - cr.left + el.scrollLeft;
        const cy = ev.clientY - cr.top + el.scrollTop;
        setRect({ x: Math.min(sx, cx), y: Math.min(sy, cy), w: Math.abs(cx - sx), h: Math.abs(cy - sy) });
      };

      const onUp = (ev: PointerEvent) => {
        if (moved) {
          const cx = ev.clientX - cr.left + el.scrollLeft;
          const cy = ev.clientY - cr.top + el.scrollTop;
          const fr = { x: Math.min(sx, cx), y: Math.min(sy, cy), w: Math.abs(cx - sx), h: Math.abs(cy - sy) };
          if (fr.w > 10 && fr.h > 10) {
            const body = elements[0];
            if (body && Array.isArray(body.content)) {
              let match: El | null = null;
              for (const child of body.content as El[]) {
                const dom = document.querySelector(`[data-el-id="${child.id}"]`);
                if (!dom) continue;
                const dr = dom.getBoundingClientRect();
                const ar = { x: dr.left - cr.left + el.scrollLeft, y: dr.top - cr.top + el.scrollTop, w: dr.width, h: dr.height };
                if (!(ar.x + ar.w < fr.x || ar.x > fr.x + fr.w || ar.y + ar.h < fr.y || ar.y > fr.y + fr.h)) {
                  match = findEl(elements, child.id);
                }
              }
              if (match) dispatch({ type: 'CHANGE_CLICKED_ELEMENT', payload: { element: match } });
            }
          }
        }
        setRect(null);
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
      };

      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    };

    el.addEventListener('pointerdown', onDown);
    return () => el.removeEventListener('pointerdown', onDown);
  }, [preview, elements, dispatch, canvasRef]);

  if (!rect || rect.w < 3 || rect.h < 3) return null;
  return <div className="absolute z-50 pointer-events-none border border-primary/60 bg-primary/5 rounded-sm" style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }} />;
}
