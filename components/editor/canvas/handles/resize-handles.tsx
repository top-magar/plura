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
    const startX = e.clientX, startY = e.clientY;
    const startW = elRef.current.w ?? wrapperRef.current?.offsetWidth ?? 200;
    const startH = elRef.current.h ?? wrapperRef.current?.offsetHeight ?? 100;
    const startElX = elRef.current.x ?? 0;
    const startElY = elRef.current.y ?? 0;
    const ratio = startW / startH;
    const z = parseFloat(getComputedStyle(document.querySelector('[data-canvas]')!).getPropertyValue('--zoom')) || 1;

    const onMove = (ev: PointerEvent) => {
      const deltaX = (ev.clientX - startX) / z;
      const deltaY = (ev.clientY - startY) / z;
      const snap = ev.shiftKey ? 10 : 1;
      let nw = startW, nh = startH, nx = startElX, ny = startElY;
      if (dx === 1) nw = Math.max(20, startW + deltaX);
      if (dy === 1) nh = Math.max(20, startH + deltaY);
      if (dx === -1) { nw = Math.max(20, startW - deltaX); nx = startElX + (startW - nw); }
      if (dy === -1) { nh = Math.max(20, startH - deltaY); ny = startElY + (startH - nh); }
      if (ev.altKey && dx !== 0 && dy !== 0) { nh = nw / ratio; if (dy === -1) ny = startElY + startH - nh; }
      nw = Math.round(nw / snap) * snap; nh = Math.round(nh / snap) * snap;
      nx = Math.round(nx / snap) * snap; ny = Math.round(ny / snap) * snap;
      const next = { ...elRef.current, x: nx, y: ny, w: nw, h: nh };
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
      {/* Edge handles — full edge, invisible until hover */}
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

      {/* Corner handles — 8px squares */}
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
