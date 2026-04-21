'use client';

import { cn } from '@/lib/utils';
import type { El } from '../../core/types';
import type { useHandles } from './use-handles';

const CORNERS = [
  { id: 'r-TL', prop: 'borderTopLeftRadius', pos: 'top-1 left-1', cursor: 'cursor-nwse-resize' },
  { id: 'r-TR', prop: 'borderTopRightRadius', pos: 'top-1 right-1', cursor: 'cursor-nesw-resize' },
  { id: 'r-BR', prop: 'borderBottomRightRadius', pos: 'bottom-1 right-1', cursor: 'cursor-nwse-resize' },
  { id: 'r-BL', prop: 'borderBottomLeftRadius', pos: 'bottom-1 left-1', cursor: 'cursor-nesw-resize' },
] as const;

export function RadiusCorners({ element, h }: { element: El; h: ReturnType<typeof useHandles> }) {
  const s = element.styles;
  const getR = (prop: string) => parseInt(String((s as Record<string, unknown>)[prop] ?? s.borderRadius ?? '0')) || 0;

  return <>{CORNERS.map(({ id, prop, pos, cursor }) => {
    const r = getR(prop);
    const isActive = h.active === id;
    const isHovered = h.hovered === id;
    return (
      <div
        key={id}
        data-handle
        className={cn('absolute z-20 flex items-center justify-center size-5', cursor, pos)}
        onPointerDown={(e) => h.dragRadius(element, id, prop, e)}
        onPointerEnter={() => h.hover(id)}
        onPointerLeave={() => h.hover(null)}
      >
        <div className={cn('rounded-full transition-transform',
          isActive ? 'bg-amber-500 size-2.5 scale-110' :
          isHovered ? 'bg-amber-400 size-2' :
          r > 0 ? 'bg-amber-400/60 size-1.5' : 'bg-amber-400/30 size-1.5'
        )} />
        {(isActive || isHovered) && (
          <span className={cn('absolute rounded px-1 py-px text-[8px] font-mono text-white whitespace-nowrap pointer-events-none shadow z-30',
            isActive ? 'bg-amber-500' : 'bg-amber-500/80',
            id.includes('TL') ? '-top-4 left-0' : id.includes('TR') ? '-top-4 right-0' : id.includes('BR') ? '-bottom-4 right-0' : '-bottom-4 left-0'
          )} style={{ transform: 'scale(calc(1 / var(--zoom, 1)))' }}>{r}</span>
        )}
      </div>
    );
  })}</>;
}
