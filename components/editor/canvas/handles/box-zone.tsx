'use client';

import { cn } from '@/lib/utils';
import type { useHandles } from './use-handles';

export function BoxZone({ id, val, color, style, h }: { id: string; val: number; color: 'emerald' | 'orange'; style: Record<string, number>; h: ReturnType<typeof useHandles> }) {
  if (val <= 0 || !(h.active === id || h.hovered === id)) return null;
  return (
    <div className={cn('absolute pointer-events-none z-[13]', h.active === id ? (color === 'emerald' ? 'bg-emerald-400/25' : 'bg-orange-400/25') : (color === 'emerald' ? 'bg-emerald-400/10' : 'bg-orange-400/10'))} style={style}>
      <span className={cn('absolute inset-0 flex items-center justify-center text-[8px] font-mono pointer-events-none origin-center', color === 'emerald' ? 'text-emerald-700/60' : 'text-orange-700/60')} style={{ transform: 'scale(calc(1 / var(--zoom, 1)))' }}>{val}</span>
    </div>
  );
}
