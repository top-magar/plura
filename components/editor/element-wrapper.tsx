'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
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

/** Parse CSS shorthand (e.g. "16px", "80px 24px", "8px 16px 24px 32px") into [top, right, bottom, left] */
function parseBox(shorthand: string | undefined, top: string | undefined, right: string | undefined, bottom: string | undefined, left: string | undefined): [number, number, number, number] {
  const t = parseInt(String(top ?? '')) || 0;
  const r = parseInt(String(right ?? '')) || 0;
  const b = parseInt(String(bottom ?? '')) || 0;
  const l = parseInt(String(left ?? '')) || 0;
  if (t || r || b || l) return [t, r, b, l];
  if (!shorthand) return [0, 0, 0, 0];
  const parts = String(shorthand).split(/\s+/).map(v => parseInt(v) || 0);
  if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]];
  if (parts.length === 2) return [parts[0], parts[1], parts[0], parts[1]];
  if (parts.length === 3) return [parts[0], parts[1], parts[2], parts[1]];
  return [parts[0], parts[1], parts[2], parts[3]];
}

type Props = {
  element: El;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  isContainer?: boolean;
};

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

// ─── Padding Handles ────────────────────────────────────────

function PaddingHandles({ element, dispatch }: { element: El; dispatch: ReturnType<typeof useEditor>['dispatch'] }) {
  const [active, setActive] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const s = element.styles;
  const [pt, pr, pb, pl] = parseBox(s.padding as string | undefined, s.paddingTop as string | undefined, s.paddingRight as string | undefined, s.paddingBottom as string | undefined, s.paddingLeft as string | undefined);

  const sides = [
    { key: 'Top', cls: 'top-0 left-0 right-0 cursor-ns-resize', dir: 'y' as const, sign: -1, val: pt, zone: { top: 0, left: 0, right: 0, height: pt } },
    { key: 'Right', cls: 'right-0 top-0 bottom-0 cursor-ew-resize', dir: 'x' as const, sign: 1, val: pr, zone: { top: 0, right: 0, bottom: 0, width: pr } },
    { key: 'Bottom', cls: 'bottom-0 left-0 right-0 cursor-ns-resize', dir: 'y' as const, sign: 1, val: pb, zone: { bottom: 0, left: 0, right: 0, height: pb } },
    { key: 'Left', cls: 'left-0 top-0 bottom-0 cursor-ew-resize', dir: 'x' as const, sign: -1, val: pl, zone: { top: 0, left: 0, bottom: 0, width: pl } },
  ];

  const onPointerDown = (side: string, dir: 'x' | 'y', sign: number) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const prop = `padding${side}` as keyof CSSProperties;
    const startPos = dir === 'y' ? e.clientY : e.clientX;
    const startVal = parseInt(String(element.styles[prop] ?? '0')) || 0;
    setActive(side);

    const onMove = (ev: PointerEvent) => {
      const delta = ((dir === 'y' ? ev.clientY : ev.clientX) - startPos) * sign;
      const val = Math.max(0, Math.round((startVal + delta) / 4) * 4);
      dispatch({ type: 'UPDATE_ELEMENT', payload: { element: { ...element, styles: { ...element.styles, [prop]: `${val}px` } } } });
    };
    const onUp = () => { setActive(null); document.removeEventListener('pointermove', onMove); document.removeEventListener('pointerup', onUp); };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  const show = active || hovered;

  return (
    <>
      {/* Colored padding zones — visible on hover/drag */}
      {show && sides.map(({ key, val, zone }) => (
        val > 0 && (active === key || hovered === key || active === null) && (
          <div
            key={`zone-${key}`}
            className={cn(
              'absolute pointer-events-none z-[14] transition-opacity',
              (active === key || hovered === key) ? 'bg-emerald-400/25' : 'bg-emerald-400/10'
            )}
            style={zone}
          >
            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono text-emerald-700/60">
              {val}
            </span>
          </div>
        )
      ))}
      {/* Drag handles — only when padding exists */}
      {sides.map(({ key, cls, dir, sign, val }) => (
        val > 0 ? (
          <div
            key={key}
            className={cn('absolute z-[15]', cls)}
            style={dir === 'y' ? { height: val } : { width: val }}
            onPointerDown={onPointerDown(key, dir, sign)}
            onPointerEnter={() => setHovered(key)}
            onPointerLeave={() => setHovered(null)}
          >
            {(active === key) && (
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-mono text-white whitespace-nowrap pointer-events-none z-20 shadow">
                {val}px
              </span>
            )}
          </div>
        ) : null
      ))}
    </>
  );
}

// ─── Margin Handles ─────────────────────────────────────────

function MarginHandles({ element, dispatch }: { element: El; dispatch: ReturnType<typeof useEditor>['dispatch'] }) {
  const [active, setActive] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const s = element.styles;
  const [mt, mr, mb, ml] = parseBox(s.margin as string | undefined, s.marginTop as string | undefined, s.marginRight as string | undefined, s.marginBottom as string | undefined, s.marginLeft as string | undefined);

  const sides = [
    { key: 'Top', dir: 'y' as const, sign: -1, val: mt, handle: { top: -mt, left: 0, right: 0, height: mt }, zone: { top: -mt, left: 0, right: 0, height: mt } },
    { key: 'Right', dir: 'x' as const, sign: 1, val: mr, handle: { top: 0, right: -mr, bottom: 0, width: mr }, zone: { top: 0, right: -mr, bottom: 0, width: mr } },
    { key: 'Bottom', dir: 'y' as const, sign: 1, val: mb, handle: { bottom: -mb, left: 0, right: 0, height: mb }, zone: { bottom: -mb, left: 0, right: 0, height: mb } },
    { key: 'Left', dir: 'x' as const, sign: -1, val: ml, handle: { top: 0, left: -ml, bottom: 0, width: ml }, zone: { top: 0, left: -ml, bottom: 0, width: ml } },
  ];

  const onPointerDown = (side: string, dir: 'x' | 'y', sign: number) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const prop = `margin${side}` as keyof CSSProperties;
    const startPos = dir === 'y' ? e.clientY : e.clientX;
    const startVal = parseInt(String(element.styles[prop] ?? '0')) || 0;
    setActive(side);

    const onMove = (ev: PointerEvent) => {
      const delta = ((dir === 'y' ? ev.clientY : ev.clientX) - startPos) * sign;
      const val = Math.max(0, Math.round((startVal + delta) / 4) * 4);
      dispatch({ type: 'UPDATE_ELEMENT', payload: { element: { ...element, styles: { ...element.styles, [prop]: `${val}px` } } } });
    };
    const onUp = () => { setActive(null); document.removeEventListener('pointermove', onMove); document.removeEventListener('pointerup', onUp); };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  const show = active || hovered;

  return (
    <>
      {show && sides.map(({ key, val, zone }) => (
        val > 0 && (active === key || hovered === key || active === null) && (
          <div
            key={`mzone-${key}`}
            className={cn(
              'absolute pointer-events-none z-[13] transition-opacity',
              (active === key || hovered === key) ? 'bg-orange-400/25' : 'bg-orange-400/10'
            )}
            style={zone}
          >
            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono text-orange-700/60">
              {val}
            </span>
          </div>
        )
      ))}
      {sides.map(({ key, dir, sign, val, handle }) => (
        val > 0 ? (
          <div
            key={`m-${key}`}
            className={cn('absolute z-[14]', dir === 'y' ? 'cursor-ns-resize' : 'cursor-ew-resize')}
            style={handle}
            onPointerDown={onPointerDown(key, dir, sign)}
            onPointerEnter={() => setHovered(key)}
            onPointerLeave={() => setHovered(null)}
          >
            {active === key && (
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-orange-500 px-1.5 py-0.5 text-[9px] font-mono text-white whitespace-nowrap pointer-events-none z-20 shadow">
                {val}px
              </span>
            )}
          </div>
        ) : null
      ))}
    </>
  );
}

// ─── Border Radius Handle ───────────────────────────────────

function BorderRadiusHandle({ element, dispatch }: { element: El; dispatch: ReturnType<typeof useEditor>['dispatch'] }) {
  const [active, setActive] = useState<string | null>(null);
  const corners = [
    { key: 'TopLeft', prop: 'borderTopLeftRadius', pos: 'top-[2px] left-[2px]', rotate: '' },
    { key: 'TopRight', prop: 'borderTopRightRadius', pos: 'top-[2px] right-[2px]', rotate: 'rotate-90' },
    { key: 'BottomRight', prop: 'borderBottomRightRadius', pos: 'bottom-[2px] right-[2px]', rotate: 'rotate-180' },
    { key: 'BottomLeft', prop: 'borderBottomLeftRadius', pos: 'bottom-[2px] left-[2px]', rotate: '-rotate-90' },
  ] as const;

  // Use individual corner or fallback to borderRadius
  const getR = (prop: string) => parseInt(String((element.styles as Record<string, unknown>)[prop] ?? element.styles.borderRadius ?? '0')) || 0;

  const onPointerDown = (prop: string) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startVal = getR(prop);
    setActive(prop);

    const onMove = (ev: PointerEvent) => {
      const dx = startX - ev.clientX;
      const dy = startY - ev.clientY;
      const delta = Math.max(Math.abs(dx), Math.abs(dy)) * (dx + dy > 0 ? 1 : -1);
      const val = Math.max(0, Math.round((startVal + delta) / 2) * 2);
      dispatch({ type: 'UPDATE_ELEMENT', payload: { element: { ...element, styles: { ...element.styles, [prop]: `${val}px` } } } });
    };
    const onUp = () => { setActive(null); document.removeEventListener('pointermove', onMove); document.removeEventListener('pointerup', onUp); };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  const anyRadius = corners.some(c => getR(c.prop) > 0);
  if (!anyRadius && !active) return null;

  return (
    <>
      {corners.map(({ key, prop, pos, rotate }) => {
        const r = getR(prop);
        if (r === 0 && !active) return null;
        const size = Math.max(10, Math.min(r, 28));
        return (
          <div
            key={key}
            className={cn('absolute z-20 cursor-nwse-resize', pos)}
            onPointerDown={onPointerDown(prop)}
            style={{ width: size, height: size }}
          >
            <svg viewBox="0 0 24 24" className={cn('w-full h-full transition-colors', rotate, active === prop ? 'text-orange-500' : 'text-primary/30 hover:text-primary/70')}>
              <path d="M 24 0 A 24 24 0 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            {active === prop && (
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-orange-500 px-1 py-px text-[8px] font-mono text-white whitespace-nowrap pointer-events-none shadow">
                {r}
              </span>
            )}
          </div>
        );
      })}
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
          <PaddingHandles element={element} dispatch={dispatch} />
          <MarginHandles element={element} dispatch={dispatch} />
          <BorderRadiusHandle element={element} dispatch={dispatch} />
        </>
      )}

      {children}
    </div>
  );
}
