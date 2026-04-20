'use client';

import { useState, useCallback, type ReactNode } from 'react';
import { useEditor } from '../../core/provider';
import { findEl } from '../../core/tree-helpers';
import type { El } from '../../core/types';

type Rect = { x: number; y: number; w: number; h: number };

function rectsIntersect(a: DOMRect, b: Rect): boolean {
  return !(a.right < b.x || a.left > b.x + b.w || a.bottom < b.y || a.top > b.y + b.h);
}

function flattenIds(el: El): string[] {
  if (Array.isArray(el.content)) {
    return [el.id, ...el.content.flatMap(flattenIds)];
  }
  return [el.id];
}

export default function Marquee({ canvasRef }: { canvasRef: React.RefObject<HTMLDivElement | null> }): ReactNode {
  const { state, dispatch } = useEditor();
  const { preview, elements } = state.editor;
  const [rect, setRect] = useState<Rect | null>(null);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (preview) return;
    // Only start marquee on direct canvas background click (not on elements)
    const target = e.target as HTMLElement;
    if (target.closest('[data-wrapper]') || target.closest('[data-el-id]')) return;
    if (!canvasRef.current) return;

    const cr = canvasRef.current.getBoundingClientRect();
    const sx = e.clientX - cr.left + canvasRef.current.scrollLeft;
    const sy = e.clientY - cr.top + canvasRef.current.scrollTop;

    setRect({ x: sx, y: sy, w: 0, h: 0 });

    const onMove = (ev: PointerEvent) => {
      const cx = ev.clientX - cr.left + canvasRef.current!.scrollLeft;
      const cy = ev.clientY - cr.top + canvasRef.current!.scrollTop;
      setRect({
        x: Math.min(sx, cx), y: Math.min(sy, cy),
        w: Math.abs(cx - sx), h: Math.abs(cy - sy),
      });
    };

    const onUp = (ev: PointerEvent) => {
      const cx = ev.clientX - cr.left + canvasRef.current!.scrollLeft;
      const cy = ev.clientY - cr.top + canvasRef.current!.scrollTop;
      const finalRect = {
        x: Math.min(sx, cx), y: Math.min(sy, cy),
        w: Math.abs(cx - sx), h: Math.abs(cy - sy),
      };

      // Find all elements intersecting the marquee
      if (finalRect.w > 5 && finalRect.h > 5) {
        const body = elements[0];
        if (body && Array.isArray(body.content)) {
          const allIds = (body.content as El[]).flatMap(flattenIds).filter(id => id !== '__body');
          let lastMatch: El | null = null;
          for (const id of allIds) {
            const dom = document.querySelector(`[data-el-id="${id}"]`);
            if (!dom) continue;
            const domRect = dom.getBoundingClientRect();
            const canvasRect = canvasRef.current!.getBoundingClientRect();
            const adjusted: DOMRect = new DOMRect(
              domRect.left - canvasRect.left + canvasRef.current!.scrollLeft,
              domRect.top - canvasRect.top + canvasRef.current!.scrollTop,
              domRect.width, domRect.height
            );
            if (rectsIntersect(adjusted, finalRect)) {
              lastMatch = findEl(elements, id);
            }
          }
          // Select last matching element (TODO: multi-select when provider supports it)
          if (lastMatch) {
            dispatch({ type: 'CHANGE_CLICKED_ELEMENT', payload: { element: lastMatch } });
          }
        }
      }

      setRect(null);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }, [preview, elements, dispatch, canvasRef]);

  return (
    <>
      {/* Invisible layer to capture marquee drag on canvas background */}
      <div className="absolute inset-0 z-[1]" onPointerDown={onPointerDown} />
      {/* Marquee rectangle */}
      {rect && rect.w > 2 && rect.h > 2 && (
        <div className="absolute z-50 pointer-events-none border border-primary/60 bg-primary/5 rounded-sm" style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }} />
      )}
    </>
  );
}
