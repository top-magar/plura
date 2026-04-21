'use client';

import { cn } from '@/lib/utils';
import type { El } from '../../core/types';
import type { useHandles } from './use-handles';

const MIN_HIT = 8;
const TINY_THRESH = 25;

export function BoxHandle({ element, id, prop, val, dir, sign, color, style, cls, h }: {
  element: El; id: string; prop: string; val: number; dir: 'x' | 'y'; sign: number; color: 'emerald' | 'orange';
  style: Record<string, number>; cls: string; h: ReturnType<typeof useHandles>;
}) {
  const hitSize = Math.max(val, MIN_HIT);
  const isTiny = val < TINY_THRESH;
  const adjustedStyle: Record<string, number> = dir === 'y' ? { ...style, height: hitSize } : { ...style, width: hitSize };
  if (val === 0) {
    if (dir === 'y' && sign === -1 && adjustedStyle.top !== undefined) adjustedStyle.top = -MIN_HIT / 2;
    if (dir === 'y' && sign === 1 && adjustedStyle.bottom !== undefined) adjustedStyle.bottom = -MIN_HIT / 2;
    if (dir === 'x' && sign === 1 && adjustedStyle.right !== undefined) adjustedStyle.right = -MIN_HIT / 2;
    if (dir === 'x' && sign === -1 && adjustedStyle.left !== undefined) adjustedStyle.left = -MIN_HIT / 2;
  }
  return (
    <div className={cn('absolute z-[14]', cls)} style={adjustedStyle} onPointerDown={(e) => h.drag(element, id, prop, dir, sign, 4, e)} onPointerEnter={() => h.hover(id)} onPointerLeave={() => h.hover(null)}>
      {isTiny && (h.hovered === id || h.active === id) && <div className={cn('absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full', color === 'emerald' ? 'bg-emerald-500' : 'bg-orange-500', h.active === id ? 'size-2' : 'size-1.5')} />}
      {h.active === id && <span className={cn('absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded px-1 py-px text-[8px] font-mono text-white whitespace-nowrap pointer-events-none z-20 shadow', color === 'emerald' ? 'bg-emerald-600' : 'bg-orange-500')} style={{ transform: 'translate(-50%,-50%) scale(calc(1 / var(--zoom, 1)))' }}>{val}px</span>}
    </div>
  );
}
