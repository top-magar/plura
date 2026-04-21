'use client';

import { useCallback, useRef, useEffect, useState, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import type { El } from '../../core/types';
import type { useEditor } from '../../core/provider';

const CORNERS = [
  { key: 'tl', cursor: 'nwse-resize', pos: { top: -4, left: -4 }, dx: -1, dy: -1 },
  { key: 'tr', cursor: 'nesw-resize', pos: { top: -4, right: -4 }, dx: 1, dy: -1 },
  { key: 'bl', cursor: 'nesw-resize', pos: { bottom: -4, left: -4 }, dx: -1, dy: 1 },
  { key: 'br', cursor: 'nwse-resize', pos: { bottom: -4, right: -4 }, dx: 1, dy: 1 },
] as const;

const EDGES = [
  { key: 't', cursor: 'ns-resize', pos: { top: -3, left: 12, right: 12, height: 6 }, dx: 0, dy: -1 },
  { key: 'b', cursor: 'ns-resize', pos: { bottom: -3, left: 12, right: 12, height: 6 }, dx: 0, dy: 1 },
  { key: 'l', cursor: 'ew-resize', pos: { left: -3, top: 12, bottom: 12, width: 6 }, dx: -1, dy: 0 },
  { key: 'r', cursor: 'ew-resize', pos: { right: -3, top: 12, bottom: 12, width: 6 }, dx: 1, dy: 0 },
] as const;

export function ResizeHandles({ element, wrapperRef, dispatch }: {
  element: El;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  dispatch: ReturnType<typeof useEditor>['dispatch'];
}) {
  const elRef = useRef<El>(element);
  elRef.current = element;
  const cleanupRef = useRef<(() => void) | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => () => { cleanupRef.current?.(); }, []);

  const onDown = useCallback((key: string, e: React.PointerEvent, dx: number, dy: number) => {
    e.preventDefault();
    e.stopPropagation();
    setActive(key);
    const el = wrapperRef.current;
    if (!el) return;
    const startX = e.clientX, startY = e.clientY;
    const z = parseFloat(getComputedStyle(document.querySelector('[data-canvas]')!).getPropertyValue('--zoom')) || 1;
    const startW = el.offsetWidth, startH = el.offsetHeight;
    const ratio = startW / startH;

    const onMove = (ev: PointerEvent) => {
      let newW = dx !== 0 ? Math.max(20, startW + (ev.clientX - startX) / z * dx) : startW;
      let newH = dy !== 0 ? Math.max(20, startH + (ev.clientY - startY) / z * dy) : startH;
      if (ev.shiftKey && dx !== 0 && dy !== 0) newH = newW / ratio;

      const updates: Record<string, string> = {};
      if (dx !== 0) updates.width = `${Math.round(newW)}px`;
      if (dy !== 0 || (ev.shiftKey && dx !== 0 && dy !== 0)) updates.height = `${Math.round(newH)}px`;

      const next = { ...elRef.current, styles: { ...elRef.current.styles, ...updates } as CSSProperties };
      elRef.current = next;
      dispatch({ type: 'UPDATE_ELEMENT_LIVE', payload: { element: next } });
    };
    const onUp = () => {
      setActive(null);
      dispatch({ type: 'COMMIT_HISTORY' });
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      cleanupRef.current = null;
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    cleanupRef.current = onUp;
  }, [dispatch, wrapperRef]);

  return (
    <div className="absolute inset-0 pointer-events-none z-[18]" style={{ transform: 'scale(calc(1 / var(--zoom, 1)))', transformOrigin: 'top left', width: 'calc(100% * var(--zoom, 1))', height: 'calc(100% * var(--zoom, 1))' }}>
      {EDGES.map(({ key, cursor, pos, dx, dy }) => (
        <div key={key} data-handle className={cn('absolute pointer-events-auto', cursor)}
          style={pos as CSSProperties}
          onPointerDown={(e) => onDown(key, e, dx, dy)}
          onPointerEnter={() => setHovered(key)}
          onPointerLeave={() => setHovered(null)}>
          <div className={cn('absolute transition-colors rounded-full',
            dx === 0 ? 'left-0 right-0 top-1/2 -translate-y-px h-0.5' : 'top-0 bottom-0 left-1/2 -translate-x-px w-0.5',
            active === key ? 'bg-primary' : hovered === key ? 'bg-primary/60' : 'bg-transparent'
          )} />
        </div>
      ))}
      {CORNERS.map(({ key, cursor, pos, dx, dy }) => {
        const isAct = active === key;
        const isHov = hovered === key;
        return (
          <div key={key} data-handle className={cn('absolute pointer-events-auto', cursor)}
            style={{ ...pos, width: 8, height: 8 } as CSSProperties}
            onPointerDown={(e) => onDown(key, e, dx, dy)}
            onPointerEnter={() => setHovered(key)}
            onPointerLeave={() => setHovered(null)}>
            <div className={cn('absolute inset-0 rounded-[2px] border transition-all shadow-sm',
              isAct ? 'bg-primary border-primary scale-[1.15]' :
              isHov ? 'bg-primary border-primary' :
              'bg-white border-primary'
            )} />
          </div>
        );
      })}
    </div>
  );
}
