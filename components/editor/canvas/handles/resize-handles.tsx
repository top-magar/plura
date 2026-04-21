'use client';

import { useCallback, useRef, useEffect, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import type { El } from '../../core/types';
import type { useEditor } from '../../core/provider';

const SZ = 8;
const HALF = SZ / 2;

const POSITIONS = [
  { key: 'tl', cursor: 'nwse-resize', style: { top: -HALF, left: -HALF }, dx: -1, dy: -1 },
  { key: 'tr', cursor: 'nesw-resize', style: { top: -HALF, right: -HALF }, dx: 1, dy: -1 },
  { key: 'bl', cursor: 'nesw-resize', style: { bottom: -HALF, left: -HALF }, dx: -1, dy: 1 },
  { key: 'br', cursor: 'nwse-resize', style: { bottom: -HALF, right: -HALF }, dx: 1, dy: 1 },
  { key: 't', cursor: 'ns-resize', style: { top: -HALF, left: '50%', marginLeft: -HALF }, dx: 0, dy: -1 },
  { key: 'b', cursor: 'ns-resize', style: { bottom: -HALF, left: '50%', marginLeft: -HALF }, dx: 0, dy: 1 },
  { key: 'l', cursor: 'ew-resize', style: { top: '50%', left: -HALF, marginTop: -HALF }, dx: -1, dy: 0 },
  { key: 'r', cursor: 'ew-resize', style: { top: '50%', right: -HALF, marginTop: -HALF }, dx: 1, dy: 0 },
] as const;

export function ResizeHandles({ element, wrapperRef, dispatch }: {
  element: El;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  dispatch: ReturnType<typeof useEditor>['dispatch'];
}) {
  const elRef = useRef<El>(element);
  elRef.current = element;
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => () => { cleanupRef.current?.(); }, []);

  const onDown = useCallback((e: React.PointerEvent, dx: number, dy: number) => {
    e.preventDefault();
    e.stopPropagation();
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

      // Right/bottom edge: grow w/h
      if (dx === 1) nw = Math.max(20, startW + deltaX);
      if (dy === 1) nh = Math.max(20, startH + deltaY);

      // Left/top edge: move x/y and shrink w/h
      if (dx === -1) { nw = Math.max(20, startW - deltaX); nx = startElX + (startW - nw); }
      if (dy === -1) { nh = Math.max(20, startH - deltaY); ny = startElY + (startH - nh); }

      // Shift = constrain aspect ratio (corners only)
      if (ev.shiftKey && dx !== 0 && dy !== 0) {
        nh = nw / ratio;
        if (dy === -1) ny = startElY + startH - nh;
      }

      nw = Math.round(nw / snap) * snap;
      nh = Math.round(nh / snap) * snap;
      nx = Math.round(nx / snap) * snap;
      ny = Math.round(ny / snap) * snap;

      const next = { ...elRef.current, x: nx, y: ny, w: nw, h: nh };
      elRef.current = next;
      dispatch({ type: 'UPDATE_ELEMENT_LIVE', payload: { element: next } });
    };
    const onUp = () => {
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
    <>
      {POSITIONS.map(({ key, cursor, style, dx, dy }) => (
        <div
          key={key}
          data-handle
          className={cn('absolute z-[18]', cursor)}
          style={{ ...style as Record<string, unknown>, width: SZ, height: SZ } as CSSProperties}
          onPointerDown={(e) => onDown(e, dx, dy)}
        >
          <div className="absolute inset-0.5 rounded-sm bg-white border border-primary shadow-sm" />
        </div>
      ))}
    </>
  );
}
