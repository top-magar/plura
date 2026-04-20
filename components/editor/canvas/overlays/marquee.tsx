'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { useEditor } from '../../core/provider';
import { findEl } from '../../core/tree-helpers';
import type { El } from '../../core/types';

type Rect = { x: number; y: number; w: number; h: number };

function rectsIntersect(a: DOMRect, b: Rect): boolean {
  return !(a.right < b.x || a.left > b.x + b.w || a.bottom < b.y || a.top > b.y + b.h);
}

/**
 * Marquee selection — attaches to canvas via pointerdown on the canvas container.
 * No blocking overlay. Only activates when clicking empty canvas area.
 */
export default function Marquee({ canvasRef }: { canvasRef: React.RefObject<HTMLDivElement | null> }): ReactNode {
  const { state, dispatch } = useEditor();
  const { preview, elements } = state.editor;
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el || preview) return;

    const onDown = (e: PointerEvent) => {
      // Only start marquee on direct canvas background — not on elements
      const target = e.target as HTMLElement;
      if (target.closest('[data-wrapper]') || target.closest('[data-el-id]') || target.closest('[data-canvas]') === null) return;
      // Must be left click on the canvas background div itself
      if (e.button !== 0) return;
      if (!target.hasAttribute('data-canvas') && target.closest('[data-canvas]') !== target.closest('.overflow-auto > div')) return;

      const cr = el.getBoundingClientRect();
      const sx = e.clientX - cr.left + el.scrollLeft;
      const sy = e.clientY - cr.top + el.scrollTop;

      const onMove = (ev: PointerEvent) => {
        const cx = ev.clientX - cr.left + el.scrollLeft;
        const cy = ev.clientY - cr.top + el.scrollTop;
        setRect({ x: Math.min(sx, cx), y: Math.min(sy, cy), w: Math.abs(cx - sx), h: Math.abs(cy - sy) });
      };

      const onUp = (ev: PointerEvent) => {
        const cx = ev.clientX - cr.left + el.scrollLeft;
        const cy = ev.clientY - cr.top + el.scrollTop;
        const finalRect = { x: Math.min(sx, cx), y: Math.min(sy, cy), w: Math.abs(cx - sx), h: Math.abs(cy - sy) };

        if (finalRect.w > 5 && finalRect.h > 5) {
          const body = elements[0];
          if (body && Array.isArray(body.content)) {
            let lastMatch: El | null = null;
            for (const child of body.content as El[]) {
              const dom = document.querySelector(`[data-el-id="${child.id}"]`);
              if (!dom) continue;
              const domRect = dom.getBoundingClientRect();
              const adjusted = new DOMRect(domRect.left - cr.left + el.scrollLeft, domRect.top - cr.top + el.scrollTop, domRect.width, domRect.height);
              if (rectsIntersect(adjusted, finalRect)) lastMatch = findEl(elements, child.id);
            }
            if (lastMatch) dispatch({ type: 'CHANGE_CLICKED_ELEMENT', payload: { element: lastMatch } });
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

  if (!rect || rect.w < 2 || rect.h < 2) return null;

  return (
    <div className="absolute z-50 pointer-events-none border border-primary/60 bg-primary/5 rounded-sm" style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }} />
  );
}
