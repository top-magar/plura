'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { El } from '../../core/types';
import type { useEditor } from '../../core/provider';

type GapRect = { x: number; y: number; w: number; h: number };
const MIN_HIT = 8;

export function GapHandle({ element, isRow, dispatch }: { element: El; isRow: boolean; dispatch: ReturnType<typeof useEditor>['dispatch'] }) {
  const [dragging, setDragging] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(-1);
  const [gaps, setGaps] = useState<GapRect[]>([]);
  const elRef = useRef<El>(element);
  elRef.current = element;
  const gap = parseInt(String(element.styles.gap ?? '0')) || 0;
  const childEls = (Array.isArray(element.content) ? element.content : []) as El[];

  useEffect(() => {
    const container = document.querySelector(`[data-el-id="${element.id}"]`) as HTMLElement | null;
    if (!container) return;

    const measure = () => {
      const children = Array.from(container.querySelectorAll(':scope > [data-wrapper] > [data-el-id], :scope > [data-el-id]'));
      if (children.length < 2) { setGaps([]); return; }
      const pr = container.getBoundingClientRect();
      const rects: GapRect[] = [];
      for (let i = 0; i < children.length - 1; i++) {
        const a = children[i].getBoundingClientRect();
        const b = children[i + 1].getBoundingClientRect();
        if (isRow) {
          const x = a.right - pr.left;
          const w = b.left - a.right;
          rects.push({ x, y: 0, w: Math.max(w, MIN_HIT), h: pr.height });
        } else {
          const y = a.bottom - pr.top;
          const h = b.top - a.bottom;
          rects.push({ x: 0, y, w: pr.width, h: Math.max(h, MIN_HIT) });
        }
      }
      setGaps(rects);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, [element.id, element.styles.gap, childEls.length, isRow]);

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const start = isRow ? e.clientX : e.clientY;
    const startGap = gap;
    setDragging(true);

    const onMove = (ev: PointerEvent) => {
      const delta = (isRow ? ev.clientX : ev.clientY) - start;
      const snap = ev.shiftKey ? 10 : 2;
      const val = Math.max(0, Math.round((startGap + delta) / snap) * snap);
      const next = { ...elRef.current, styles: { ...elRef.current.styles, gap: `${val}px` } };
      elRef.current = next;
      dispatch({ type: 'UPDATE_ELEMENT_LIVE', payload: { element: next } });
    };
    const onUp = () => {
      setDragging(false);
      dispatch({ type: 'COMMIT_HISTORY' });
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  if (gaps.length === 0) return null;

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {gaps.map((g, i) => {
        const show = dragging || hoveredIdx === i;
        return (
          <div
            key={i}
            className={cn('absolute pointer-events-auto flex items-center justify-center', isRow ? 'cursor-ew-resize' : 'cursor-ns-resize')}
            style={{ left: g.x, top: g.y, width: g.w, height: g.h }}
            onPointerDown={onPointerDown}
            onPointerEnter={() => setHoveredIdx(i)}
            onPointerLeave={() => setHoveredIdx(-1)}
          >
            {show && <div className={cn('absolute inset-0 rounded-sm', dragging ? 'bg-pink-400/30' : 'bg-pink-400/15')} />}
            {show && <div className={cn('rounded-full relative z-10 shrink-0', dragging ? 'bg-pink-500 scale-110' : 'bg-pink-400', isRow ? 'w-1 h-5' : 'h-1 w-5')} />}
            {show && (
              <span className={cn('absolute rounded bg-pink-500 px-1.5 py-0.5 text-[9px] font-mono text-white whitespace-nowrap pointer-events-none z-20 shadow origin-bottom', isRow ? '-top-5 left-1/2 -translate-x-1/2' : 'top-1/2 -translate-y-1/2 -right-10')}
                style={{ transform: `scale(calc(1 / var(--zoom, 1)))${isRow ? ' translateX(-50%)' : ' translateY(-50%)'}` }}>
                {gap}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
