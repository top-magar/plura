'use client';

import { useRef, useCallback, useState, type CSSProperties, type ReactNode } from 'react';
import {
  GripVertical, Trash2, Copy, ChevronUp, ChevronDown, Lock,
} from 'lucide-react';
import { useEditor } from './editor-provider';
import { findParentId } from './tree-helpers';
import { useDragOverlay } from './drag-overlay';
import { cn } from '@/lib/utils';
import type { El } from './types';
import { resolveStyles } from './types';

// ─── Types ──────────────────────────────────────────────────

type Props = {
  element: El;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  isContainer?: boolean;
};

// ─── Resize Hook ────────────────────────────────────────────

function useResize(
  element: El,
  dispatch: ReturnType<typeof useEditor>['dispatch'],
) {
  const startRef = useRef<{ x: number; y: number; w: number; h: number; parentW: number; parentH: number } | null>(null);
  const [resizeInfo, setResizeInfo] = useState<{ w: number; h: number; snapLabel: string | null } | null>(null);

  const onPointerDown = useCallback(
    (axis: 'x' | 'y' | 'xy') => (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const el = (e.target as HTMLElement).closest('[data-wrapper]') as HTMLElement | null;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const parent = el.parentElement;
      const pRect = parent?.getBoundingClientRect();
      startRef.current = { x: e.clientX, y: e.clientY, w: rect.width, h: rect.height, parentW: pRect?.width ?? rect.width, parentH: pRect?.height ?? rect.height };

      const SNAP = 6;
      const pctSnaps = [0.25, 0.333, 0.5, 0.667, 0.75, 1];

      const onMove = (ev: PointerEvent) => {
        if (!startRef.current) return;
        const s = startRef.current;
        let newW = Math.max(20, s.w + (ev.clientX - s.x));
        let newH = Math.max(20, s.h + (ev.clientY - s.y));
        let snapLabel: string | null = null;

        // Snap to percentage of parent
        if (axis === 'x' || axis === 'xy') {
          for (const r of pctSnaps) {
            const target = Math.round(s.parentW * r);
            if (Math.abs(newW - target) < SNAP) { newW = target; snapLabel = `${Math.round(r * 100)}%`; break; }
          }
        }
        if (axis === 'y' || axis === 'xy') {
          for (const r of pctSnaps) {
            const target = Math.round(s.parentH * r);
            if (Math.abs(newH - target) < SNAP) { newH = target; snapLabel = snapLabel ? `${snapLabel} × ${Math.round(r * 100)}%` : `${Math.round(r * 100)}%`; break; }
          }
        }

        // Snap to 8px grid
        if (!snapLabel) {
          if (axis === 'x' || axis === 'xy') newW = Math.round(newW / 8) * 8 || 8;
          if (axis === 'y' || axis === 'xy') newH = Math.round(newH / 8) * 8 || 8;
        }

        setResizeInfo({ w: newW, h: newH, snapLabel });

        // Use percentage value when snapped to percentage, px otherwise
        const updates: Partial<CSSProperties> = {};
        if (axis === 'x' || axis === 'xy') {
          const pct = pctSnaps.find(r => Math.round(s.parentW * r) === newW);
          updates.width = pct ? `${Math.round(pct * 100)}%` : `${newW}px`;
        }
        if (axis === 'y' || axis === 'xy') {
          updates.height = `${newH}px`;
        }
        if (!element.styles.overflow) updates.overflow = 'hidden';
        dispatch({ type: 'UPDATE_ELEMENT', payload: { element: { ...element, styles: { ...element.styles, ...updates } } } });
      };

      const onUp = () => {
        startRef.current = null;
        setResizeInfo(null);
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
      };

      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    },
    [element, dispatch],
  );

  return { onResizeX: onPointerDown('x'), onResizeY: onPointerDown('y'), onResizeXY: onPointerDown('xy'), resizeInfo };
}

// ─── Spacing Overlay ────────────────────────────────────────

function SpacingViz({ styles }: { styles: CSSProperties }) {
  const mt = styles.marginTop, mr = styles.marginRight, mb = styles.marginBottom, ml = styles.marginLeft;
  const pt = styles.paddingTop, pr = styles.paddingRight, pb = styles.paddingBottom, pl = styles.paddingLeft;
  const hasMargin = mt || mr || mb || ml;
  const hasPadding = pt || pr || pb || pl;
  if (!hasMargin && !hasPadding) return null;

  return (
    <>
      {/* Margin — orange */}
      {mt && <div className="absolute left-0 right-0 bg-orange-400/15 pointer-events-none z-[5]" style={{ top: `-${mt}`, height: mt }} />}
      {mb && <div className="absolute left-0 right-0 bg-orange-400/15 pointer-events-none z-[5]" style={{ bottom: `-${mb}`, height: mb }} />}
      {ml && <div className="absolute top-0 bottom-0 bg-orange-400/15 pointer-events-none z-[5]" style={{ left: `-${ml}`, width: ml }} />}
      {mr && <div className="absolute top-0 bottom-0 bg-orange-400/15 pointer-events-none z-[5]" style={{ right: `-${mr}`, width: mr }} />}
      {/* Padding — green */}
      {pt && <div className="absolute left-0 right-0 top-0 bg-emerald-400/15 pointer-events-none z-[5]" style={{ height: pt }} />}
      {pb && <div className="absolute left-0 right-0 bottom-0 bg-emerald-400/15 pointer-events-none z-[5]" style={{ height: pb }} />}
      {pl && <div className="absolute top-0 bottom-0 left-0 bg-emerald-400/15 pointer-events-none z-[5]" style={{ width: pl }} />}
      {pr && <div className="absolute top-0 bottom-0 right-0 bg-emerald-400/15 pointer-events-none z-[5]" style={{ width: pr }} />}
    </>
  );
}

// ─── Floating Toolbar ───────────────────────────────────────

function Toolbar({
  element,
  dispatch,
  elements,
}: {
  element: El;
  dispatch: ReturnType<typeof useEditor>['dispatch'];
  elements: El[];
}) {
  const parentId = findParentId(elements, element.id);
  const { start: startOverlay } = useDragOverlay();

  return (
    <div
      className="absolute -top-7 left-0 z-20 flex items-center gap-px rounded-md bg-primary text-primary-foreground shadow-md text-[9px] leading-none overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Drag handle */}
      <span
        className="flex items-center px-1 py-1 cursor-grab hover:bg-primary-foreground/10 active:cursor-grabbing"
        draggable
        onDragStart={(e) => {
          e.stopPropagation();
          e.dataTransfer.setData('moveElementId', element.id);
          startOverlay(element.name, e);
        }}
      >
        <GripVertical className="size-3" />
      </span>

      {/* Lock indicator */}
      {element.locked && <Lock className="size-2.5 mx-0.5 text-amber-300" />}

      {/* Name */}
      <span className="px-1 py-1 max-w-[80px] truncate pointer-events-none select-none">
        {element.name}
      </span>

      {/* Divider */}
      <span className="w-px h-3 bg-primary-foreground/20" />

      {/* Move up */}
      <button
        className="flex items-center px-1 py-1 hover:bg-primary-foreground/10 disabled:opacity-30"
        onClick={() => dispatch({ type: 'REORDER_ELEMENT', payload: { elId: element.id, direction: 'up' } })}
      >
        <ChevronUp className="size-3" />
      </button>

      {/* Move down */}
      <button
        className="flex items-center px-1 py-1 hover:bg-primary-foreground/10 disabled:opacity-30"
        onClick={() => dispatch({ type: 'REORDER_ELEMENT', payload: { elId: element.id, direction: 'down' } })}
      >
        <ChevronDown className="size-3" />
      </button>

      {/* Divider */}
      <span className="w-px h-3 bg-primary-foreground/20" />

      {/* Duplicate */}
      {parentId && (
        <button
          className="flex items-center px-1 py-1 hover:bg-primary-foreground/10"
          onClick={() => dispatch({ type: 'DUPLICATE_ELEMENT', payload: { elId: element.id, containerId: parentId } })}
        >
          <Copy className="size-2.5" />
        </button>
      )}

      {/* Delete */}
      <button
        className="flex items-center px-1 py-1 hover:bg-destructive/80 hover:text-destructive-foreground"
        onClick={() => dispatch({ type: 'DELETE_ELEMENT', payload: { id: element.id } })}
      >
        <Trash2 className="size-2.5" />
      </button>
    </div>
  );
}

// ─── Resize Handles ─────────────────────────────────────────

function ResizeHandles({
  onResizeX,
  onResizeY,
  onResizeXY,
}: {
  onResizeX: (e: React.PointerEvent) => void;
  onResizeY: (e: React.PointerEvent) => void;
  onResizeXY: (e: React.PointerEvent) => void;
}) {
  return (
    <>
      {/* Right edge */}
      <div
        className="absolute top-0 -right-1 w-2 h-full cursor-ew-resize z-20 group/r"
        onPointerDown={onResizeX}
      >
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-0.5 h-6 rounded-full bg-primary opacity-0 group-hover/r:opacity-100 transition-opacity" />
      </div>
      {/* Bottom edge */}
      <div
        className="absolute -bottom-1 left-0 h-2 w-full cursor-ns-resize z-20 group/b"
        onPointerDown={onResizeY}
      >
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-primary opacity-0 group-hover/b:opacity-100 transition-opacity" />
      </div>
      {/* Corner */}
      <div
        className="absolute -bottom-1.5 -right-1.5 size-3 cursor-nwse-resize z-20 group/c"
        onPointerDown={onResizeXY}
      >
        <div className="absolute bottom-0.5 right-0.5 size-1.5 rounded-full bg-primary opacity-0 group-hover/c:opacity-100 transition-opacity" />
      </div>
    </>
  );
}

// ─── Padding Handles ────────────────────────────────────────

function PaddingHandles({ element, dispatch }: { element: El; dispatch: ReturnType<typeof useEditor>['dispatch'] }) {
  const sides = ['Top', 'Right', 'Bottom', 'Left'] as const;
  const cursors = ['ns-resize', 'ew-resize', 'ns-resize', 'ew-resize'] as const;
  const positions = [
    'top-0 left-0 right-0 h-1.5 cursor-ns-resize',
    'top-0 right-0 bottom-0 w-1.5 cursor-ew-resize',
    'bottom-0 left-0 right-0 h-1.5 cursor-ns-resize',
    'top-0 left-0 bottom-0 w-1.5 cursor-ew-resize',
  ] as const;

  const onPointerDown = (side: typeof sides[number], idx: number) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const prop = `padding${side}` as keyof CSSProperties;
    const start = { pos: idx % 2 === 0 ? e.clientY : e.clientX, val: parseInt(String(element.styles[prop] ?? '0')) || 0 };

    const onMove = (ev: PointerEvent) => {
      const delta = (idx % 2 === 0 ? ev.clientY : ev.clientX) - start.pos;
      const sign = idx < 2 ? 1 : (idx === 2 ? 1 : -1);
      const adjusted = idx === 0 ? -delta : idx === 3 ? -delta : delta;
      const val = Math.max(0, Math.round((start.val + adjusted) / 4) * 4);
      dispatch({ type: 'UPDATE_ELEMENT', payload: { element: { ...element, styles: { ...element.styles, [prop]: `${val}px` } } } });
    };
    const onUp = () => { document.removeEventListener('pointermove', onMove); document.removeEventListener('pointerup', onUp); };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  return (
    <>
      {sides.map((side, i) => (
        <div
          key={side}
          className={cn('absolute z-20 group/pad', positions[i])}
          onPointerDown={onPointerDown(side, i)}
        >
          <div className={cn(
            'absolute bg-emerald-500/0 group-hover/pad:bg-emerald-500/20 transition-colors',
            i % 2 === 0 ? 'inset-x-0 h-full' : 'inset-y-0 w-full'
          )} />
        </div>
      ))}
    </>
  );
}

// ─── Border Radius Handle ───────────────────────────────────

function BorderRadiusHandle({ element, dispatch }: { element: El; dispatch: ReturnType<typeof useEditor>['dispatch'] }) {
  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startVal = parseInt(String(element.styles.borderRadius ?? '0')) || 0;

    const onMove = (ev: PointerEvent) => {
      const delta = startX - ev.clientX;
      const val = Math.max(0, Math.round((startVal + delta) / 2) * 2);
      dispatch({ type: 'UPDATE_ELEMENT', payload: { element: { ...element, styles: { ...element.styles, borderRadius: `${val}px` } } } });
    };
    const onUp = () => { document.removeEventListener('pointermove', onMove); document.removeEventListener('pointerup', onUp); };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  const r = parseInt(String(element.styles.borderRadius ?? '0')) || 0;

  return (
    <div
      className="absolute top-1 left-1 z-20 group/br cursor-nwse-resize"
      onPointerDown={onPointerDown}
      style={{ width: Math.max(8, Math.min(r, 24)), height: Math.max(8, Math.min(r, 24)) }}
    >
      <svg viewBox="0 0 24 24" className="w-full h-full text-primary/0 group-hover/br:text-primary/60 transition-colors">
        <path d="M 24 0 A 24 24 0 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    </div>
  );
}

// ─── Main Wrapper ───────────────────────────────────────────

export default function ElementWrapper({ element, children, className, style, isContainer }: Props) {
  const { state, dispatch } = useEditor();
  const { selected, preview, hovered, dropTarget, device } = state.editor;
  const elements = state.editor.elements;

  const isBody = element.type === '__body';
  const isSel = selected?.id === element.id;
  const isHov = hovered === element.id && !isSel;
  const isDrop = dropTarget === element.id && isContainer;
  const isLocked = element.locked;
  const isHidden = element.hidden;

  const resolved = style ?? resolveStyles(element, device);
  const { onResizeX, onResizeY, onResizeXY, resizeInfo } = useResize(element, dispatch);

  // Hidden: gone in preview, ghosted in editor
  if (isHidden && preview) return null;
  if (isHidden && !preview) {
    return (
      <div className="relative opacity-20 pointer-events-none" style={resolved}>
        {children}
      </div>
    );
  }

  // Preview: clean render
  if (preview) {
    return <div style={resolved} className={className}>{children}</div>;
  }

  return (
    <div
      data-wrapper
      className={cn(
        'relative group/el min-w-0',
        !isBody && 'ring-1 ring-transparent hover:ring-primary/40 transition-shadow',
        isSel && !isBody && 'ring-2 ring-primary',
        isHov && !isBody && 'ring-1 ring-primary/40',
        isDrop && 'ring-2 ring-primary/60 bg-primary/5',
        isBody && 'min-h-full p-3',
        className,
      )}
      style={resolved}
      onClick={(e) => { e.stopPropagation(); dispatch({ type: 'CHANGE_CLICKED_ELEMENT', payload: { element } }); }}
      onDragOver={(e) => { e.preventDefault(); }}
      onMouseEnter={() => dispatch({ type: 'SET_HOVERED', payload: { id: element.id } })}
      onMouseLeave={() => { if (hovered === element.id) dispatch({ type: 'SET_HOVERED', payload: { id: null } }); }}
    >
      {/* Floating toolbar — selected non-body elements */}
      {isSel && !isBody && <Toolbar element={element} dispatch={dispatch} elements={elements} />}

      {/* Hover badge — just name */}
      {isHov && !isBody && (
        <span className="absolute -top-5 left-1 text-[9px] leading-none px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground z-10 pointer-events-none">
          {element.name}
        </span>
      )}

      {/* Resize handles — selected, non-body, non-locked */}
      {isSel && !isBody && !isLocked && (
        <>
          <ResizeHandles onResizeX={onResizeX} onResizeY={onResizeY} onResizeXY={onResizeXY} />
          <PaddingHandles element={element} dispatch={dispatch} />
          <BorderRadiusHandle element={element} dispatch={dispatch} />
        </>
      )}

      {/* Dimensions tooltip during resize */}
      {resizeInfo && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <span className={cn(
            "rounded px-1.5 py-0.5 text-[9px] font-mono font-medium text-white whitespace-nowrap",
            resizeInfo.snapLabel ? "bg-indigo-500" : "bg-black/70"
          )}>
            {resizeInfo.snapLabel ?? `${resizeInfo.w} × ${resizeInfo.h}`}
          </span>
        </div>
      )}

      {/* Spacing visualization — selected element on hover */}
      {isSel && !isBody && <SpacingViz styles={resolved} />}

      {children}
    </div>
  );
}
