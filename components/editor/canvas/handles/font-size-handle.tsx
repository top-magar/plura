'use client';

import { useRef, useState, useEffect, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import type { El } from '../../core/types';
import type { useEditor } from '../../core/provider';

export function FontSizeHandle({ element, dispatch }: {
  element: El;
  dispatch: ReturnType<typeof useEditor>['dispatch'];
}) {
  const elRef = useRef<El>(element);
  elRef.current = element;
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => () => { cleanupRef.current?.(); }, []);

  const size = parseInt(String(element.styles.fontSize ?? '16')) || 16;

  const onDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    const startSize = size;
    const z = parseFloat(getComputedStyle(document.querySelector('[data-canvas]')!).getPropertyValue('--zoom')) || 1;
    setDragging(true);

    const onMove = (ev: PointerEvent) => {
      const snap = ev.shiftKey ? 4 : 1;
      const delta = (startY - ev.clientY) / z;
      const val = Math.max(8, Math.round((startSize + delta) / snap) * snap);
      const next = { ...elRef.current, styles: { ...elRef.current.styles, fontSize: `${val}px` } as CSSProperties };
      elRef.current = next;
      dispatch({ type: 'UPDATE_ELEMENT_LIVE', payload: { element: next } });
    };
    const onUp = () => {
      setDragging(false);
      dispatch({ type: 'COMMIT_HISTORY' });
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      cleanupRef.current = null;
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    cleanupRef.current = onUp;
  };

  const show = dragging || hovered;

  return (
    <div
      className={cn('absolute z-[18] left-1/2 -translate-x-1/2 cursor-ns-resize flex flex-col items-center', show ? 'opacity-100' : 'opacity-0 hover:opacity-100', 'transition-opacity')}
      style={{ bottom: -12 }}
      onPointerDown={onDown}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <div className={cn('rounded-full transition-transform', dragging ? 'bg-violet-500 size-2.5 scale-110' : 'bg-violet-400 size-2')} />
      {show && <span className="mt-0.5 rounded bg-violet-500 px-1 py-px text-[8px] font-mono text-white whitespace-nowrap pointer-events-none shadow-sm" style={{ transform: 'scale(calc(1 / var(--zoom, 1)))' }}>{size}px</span>}
    </div>
  );
}
