'use client';

import { useRef, useCallback, type CSSProperties, type ReactNode } from 'react';
import {
  GripVertical, Trash2, Copy, ChevronUp, ChevronDown, Lock,
} from 'lucide-react';
import { useEditor } from './editor-provider';
import { findParentId } from './tree-helpers';
import { cn } from '@/lib/utils';
import type { El } from './types';
import { resolveStyles } from './types';

// ─── Types ──────────────────────────────────────────────────

/** Create a clean drag ghost label instead of the blurry browser screenshot */
export function setDragPreview(e: React.DragEvent, label: string) {
  const ghost = document.createElement('div');
  ghost.textContent = label;
  Object.assign(ghost.style, {
    position: 'fixed', left: '-9999px', top: '-9999px',
    padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '500',
    background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', whiteSpace: 'nowrap',
  });
  document.body.appendChild(ghost);
  e.dataTransfer.setDragImage(ghost, 0, 0);
  requestAnimationFrame(() => ghost.remove());
}

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
  const startRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  const onPointerDown = useCallback(
    (axis: 'x' | 'y' | 'xy') => (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const el = (e.target as HTMLElement).closest('[data-wrapper]') as HTMLElement | null;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      startRef.current = { x: e.clientX, y: e.clientY, w: rect.width, h: rect.height };

      const onMove = (ev: PointerEvent) => {
        if (!startRef.current) return;
        const dx = ev.clientX - startRef.current.x;
        const dy = ev.clientY - startRef.current.y;
        const updates: Partial<CSSProperties> = {};
        if (axis === 'x' || axis === 'xy') updates.width = `${Math.max(20, startRef.current.w + dx)}px`;
        if (axis === 'y' || axis === 'xy') updates.height = `${Math.max(20, startRef.current.h + dy)}px`;
        dispatch({
          type: 'UPDATE_ELEMENT',
          payload: { element: { ...element, styles: { ...element.styles, ...updates } } },
        });
      };

      const onUp = () => {
        startRef.current = null;
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
      };

      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    },
    [element, dispatch],
  );

  return { onResizeX: onPointerDown('x'), onResizeY: onPointerDown('y'), onResizeXY: onPointerDown('xy') };
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
          setDragPreview(e, element.name);
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
  const { onResizeX, onResizeY, onResizeXY } = useResize(element, dispatch);

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
        'relative group/el',
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
        <ResizeHandles onResizeX={onResizeX} onResizeY={onResizeY} onResizeXY={onResizeXY} />
      )}

      {/* Spacing visualization — selected element on hover */}
      {isSel && !isBody && <SpacingViz styles={resolved} />}

      {children}
    </div>
  );
}
