'use client';

import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { El } from '../../core/types';
import type { useEditor } from '../../core/provider';

export function GapHandle({ element, isRow, dispatch }: { element: El; isRow: boolean; dispatch: ReturnType<typeof useEditor>['dispatch'] }) {
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const elRef = useRef<El>(element);
  elRef.current = element;
  const gap = parseInt(String(element.styles.gap ?? '0')) || 0;

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const start = isRow ? e.clientX : e.clientY;
    const startGap = gap;
    setDragging(true);

    const onMove = (ev: PointerEvent) => {
      const delta = (isRow ? ev.clientX : ev.clientY) - start;
      const snap = ev.shiftKey ? 10 : 4; // Shift = big nudge
      const val = Math.max(0, Math.round((startGap + delta) / snap) * snap);
      const next = { ...elRef.current, styles: { ...elRef.current.styles, gap: `${val}px` } };
      elRef.current = next;
      dispatch({ type: 'UPDATE_ELEMENT', payload: { element: next } });
    };
    const onUp = () => {
      setDragging(false);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  const show = dragging || hovered;
  const childEls = (Array.isArray(element.content) ? element.content : []) as El[];

  return (
    <div className="absolute inset-0 z-10 pointer-events-none" style={{ display: 'flex', flexDirection: isRow ? 'row' : 'column' }}>
      {childEls.map((child, i) => (
        <div key={child.id} className="contents">
          <div className="flex-1 pointer-events-none" />
          {i < childEls.length - 1 && (
            <div
              className={cn('pointer-events-auto flex items-center justify-center relative', isRow ? 'cursor-ew-resize self-stretch' : 'cursor-ns-resize w-full')}
              style={isRow ? { width: Math.max(gap, 4) } : { height: Math.max(gap, 4) }}
              onPointerDown={onPointerDown}
              onPointerEnter={() => setHovered(true)}
              onPointerLeave={() => setHovered(false)}
            >
              {show && <div className={cn('absolute inset-0 rounded-sm', dragging ? 'bg-pink-400/30' : 'bg-pink-400/20')} />}
              {show && <div className={cn('rounded-full relative z-10', dragging ? 'bg-pink-500 scale-110' : 'bg-pink-400', isRow ? 'w-[4px] h-5' : 'h-[4px] w-5')} />}
              {/* Show label on hover AND drag (Figma behavior) */}
              {show && (
                <span className={cn('absolute rounded bg-pink-500 px-1.5 py-0.5 text-[9px] font-mono text-white whitespace-nowrap pointer-events-none z-20 shadow', isRow ? '-top-5 left-1/2 -translate-x-1/2' : 'top-1/2 -translate-y-1/2 -right-10')}>
                  {gap}px
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
