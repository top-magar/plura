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
    const el = wrapperRef.current;
    if (!el) return;
    const startX = e.clientX, startY = e.clientY;
    const startW = el.offsetWidth, startH = el.offsetHeight;
    const ratio = startW / startH;

    const onMove = (ev: PointerEvent) => {
      let newW = dx !== 0 ? Math.max(20, startW + (ev.clientX - startX) * dx) : startW;
      let newH = dy !== 0 ? Math.max(20, startH + (ev.clientY - startY) * dy) : startH;

      // Shift = constrain aspect ratio
      if (ev.shiftKey && dx !== 0 && dy !== 0) {
        newH = newW / ratio;
      }

      const updates: Record<string, string> = {};
      if (dx !== 0) updates.width = `${Math.round(newW)}px`;
      if (dy !== 0) updates.height = `${Math.round(newH)}px`;
      if (ev.shiftKey && dx !== 0 && dy !== 0) updates.height = `${Math.round(newH)}px`;

      const next = { ...elRef.current, styles: { ...elRef.current.styles, ...updates } as CSSProperties };
      elRef.current = next;
      dispatch({ type: 'UPDATE_ELEMENT', payload: { element: next } });
    };
    const onUp = () => {
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
