'use client';

import { useCallback, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { MIcon } from '../ui/m-icon';
import { useEditor } from '../core/provider';
import { findParentId, cloneEl } from '../core/tree-helpers';
import { useDragOverlay } from './drag-overlay';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger, ContextMenuShortcut } from '@/components/ui/context-menu';
import { cn } from '@/lib/utils';
import type { El } from '../core/types';
import { resolveStyles } from '../core/types';

// ─── Helpers ────────────────────────────────────────────────

/** Parse CSS box shorthand + individual overrides into [top, right, bottom, left] */
function parseBox(styles: CSSProperties, prefix: 'padding' | 'margin'): [number, number, number, number] {
  const s = styles as Record<string, unknown>;
  const sh = String(s[prefix] ?? '');
  const parts = sh ? sh.split(/\s+/).map(v => parseInt(v) || 0) : [0];
  let [t, r, b, l] = parts.length === 1 ? [parts[0], parts[0], parts[0], parts[0]]
    : parts.length === 2 ? [parts[0], parts[1], parts[0], parts[1]]
    : parts.length === 3 ? [parts[0], parts[1], parts[2], parts[1]]
    : [parts[0], parts[1], parts[2], parts[3]];
  // Individual overrides take precedence
  if (s[`${prefix}Top`] !== undefined) t = parseInt(String(s[`${prefix}Top`])) || 0;
  if (s[`${prefix}Right`] !== undefined) r = parseInt(String(s[`${prefix}Right`])) || 0;
  if (s[`${prefix}Bottom`] !== undefined) b = parseInt(String(s[`${prefix}Bottom`])) || 0;
  if (s[`${prefix}Left`] !== undefined) l = parseInt(String(s[`${prefix}Left`])) || 0;
  return [t, r, b, l];
}

/** Expand shorthand to longhand, removing the shorthand key */
function expandShorthand(styles: CSSProperties, prefix: 'padding' | 'margin'): Record<string, unknown> {
  const s = { ...styles } as Record<string, unknown>;
  if (!s[prefix]) return s;
  const [t, r, b, l] = parseBox(styles, prefix);
  s[`${prefix}Top`] = `${t}px`; s[`${prefix}Right`] = `${r}px`;
  s[`${prefix}Bottom`] = `${b}px`; s[`${prefix}Left`] = `${l}px`;
  delete s[prefix];
  return s;
}

// ─── Handle Drag ────────────────────────────────────────────

type HandleState = { active: string | null; hovered: string | null };

function useHandles(dispatch: ReturnType<typeof useEditor>['dispatch']) {
  const [state, setState] = useState<HandleState>({ active: null, hovered: null });
  const elRef = useRef<El | null>(null);

  const drag = useCallback((element: El, id: string, prop: string, dir: 'x' | 'y', sign: number, snap: number, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    elRef.current = element;
    const startPos = dir === 'y' ? e.clientY : e.clientX;
    const startVal = parseInt(String((element.styles as Record<string, unknown>)[prop] ?? '0')) || 0;
    setState(s => ({ ...s, active: id }));

    const prefix = prop.replace(/(Top|Right|Bottom|Left)$/, '') as 'padding' | 'margin';
    const side = prop.replace(prefix, '');
    const opp: Record<string, string> = { Top: 'Bottom', Bottom: 'Top', Left: 'Right', Right: 'Left' };
    const oppProp = `${prefix}${opp[side] ?? ''}`;
    const allProps = ['Top', 'Right', 'Bottom', 'Left'].map(s => `${prefix}${s}`);

    const onMove = (ev: PointerEvent) => {
      if (!elRef.current) return;
      const delta = ((dir === 'y' ? ev.clientY : ev.clientX) - startPos) * sign;
      const val = Math.max(0, Math.round((startVal + delta) / snap) * snap);

      const expanded = expandShorthand(elRef.current.styles, prefix);
      const updates: Record<string, string> = { [prop]: `${val}px` };
      if (ev.altKey && !ev.shiftKey) updates[oppProp] = `${val}px`;
      if (ev.altKey && ev.shiftKey) { for (const p of allProps) updates[p] = `${val}px`; }

      const next = { ...elRef.current, styles: { ...expanded, ...updates } as CSSProperties };
      elRef.current = next;
      dispatch({ type: 'UPDATE_ELEMENT', payload: { element: next } });
    };
    const onUp = () => { elRef.current = null; setState(s => ({ ...s, active: null })); document.removeEventListener('pointermove', onMove); document.removeEventListener('pointerup', onUp); };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }, [dispatch]);

  const dragRadius = useCallback((element: El, id: string, prop: string, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    elRef.current = element;
    const sx = e.clientX, sy = e.clientY;
    const sv = parseInt(String((element.styles as Record<string, unknown>)[prop] ?? element.styles.borderRadius ?? '0')) || 0;
    setState(s => ({ ...s, active: id }));

    const onMove = (ev: PointerEvent) => {
      if (!elRef.current) return;
      const d = Math.max(Math.abs(sx - ev.clientX), Math.abs(sy - ev.clientY)) * ((sx - ev.clientX + sy - ev.clientY) > 0 ? 1 : -1);
      const val = Math.max(0, Math.round((sv + d) / 2) * 2);
      // Expand borderRadius shorthand to avoid React conflict
      const cur = { ...elRef.current.styles } as Record<string, unknown>;
      if (cur.borderRadius) {
        const r = parseInt(String(cur.borderRadius)) || 0;
        cur.borderTopLeftRadius = `${r}px`; cur.borderTopRightRadius = `${r}px`;
        cur.borderBottomRightRadius = `${r}px`; cur.borderBottomLeftRadius = `${r}px`;
        delete cur.borderRadius;
      }
      const next = { ...elRef.current, styles: { ...cur, [prop]: `${val}px` } as CSSProperties };
      elRef.current = next;
      dispatch({ type: 'UPDATE_ELEMENT', payload: { element: next } });
    };
    const onUp = () => { elRef.current = null; setState(s => ({ ...s, active: null })); document.removeEventListener('pointermove', onMove); document.removeEventListener('pointerup', onUp); };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }, [dispatch]);

  const hover = useCallback((id: string | null) => setState(s => ({ ...s, hovered: id })), []);
  return { ...state, drag, dragRadius, hover };
}

// ─── Toolbar ────────────────────────────────────────────────

function Toolbar({ element, dispatch, elements }: { element: El; dispatch: ReturnType<typeof useEditor>['dispatch']; elements: El[] }) {
  const parentId = findParentId(elements, element.id);
  const { start } = useDragOverlay();
  return (
    <div className="absolute -top-7 left-0 z-30 flex items-center gap-px rounded-md bg-primary text-primary-foreground shadow-md text-[9px] leading-none overflow-hidden" onClick={(e) => e.stopPropagation()}>
      <span className="flex items-center px-1 py-1 cursor-grab hover:bg-primary-foreground/10 active:cursor-grabbing" draggable onDragStart={(e) => { e.stopPropagation(); e.dataTransfer.setData('moveElementId', element.id); start(element.name, e); }}><MIcon name="drag_indicator" size={14} /></span>
      {element.locked && <MIcon name="lock" size={12} className="mx-0.5 text-amber-300" />}
      <span className="px-1 py-1 max-w-[80px] truncate pointer-events-none select-none">{element.name}</span>
      <span className="w-px h-3 bg-primary-foreground/20" />
      <button className="flex items-center px-1 py-1 hover:bg-primary-foreground/10" onClick={() => dispatch({ type: 'REORDER_ELEMENT', payload: { elId: element.id, direction: 'up' } })}><MIcon name="expand_less" size={14} /></button>
      <button className="flex items-center px-1 py-1 hover:bg-primary-foreground/10" onClick={() => dispatch({ type: 'REORDER_ELEMENT', payload: { elId: element.id, direction: 'down' } })}><MIcon name="expand_more" size={14} /></button>
      <span className="w-px h-3 bg-primary-foreground/20" />
      {parentId && <button className="flex items-center px-1 py-1 hover:bg-primary-foreground/10" onClick={() => dispatch({ type: 'DUPLICATE_ELEMENT', payload: { elId: element.id, containerId: parentId } })}><MIcon name="content_copy" size={12} /></button>}
      <button className="flex items-center px-1 py-1 hover:bg-destructive/80 hover:text-destructive-foreground" onClick={() => dispatch({ type: 'DELETE_ELEMENT', payload: { id: element.id } })}><MIcon name="delete" size={12} /></button>
    </div>
  );
}

// ─── Box Handles ────────────────────────────────────────────

const MIN_HIT = 8; // minimum hit area in px (Penpot uses 8-10)
const TINY_THRESH = 25; // below this, show dot indicator

function BoxZone({ id, val, color, style, h }: { id: string; val: number; color: 'emerald' | 'orange'; style: Record<string, number>; h: ReturnType<typeof useHandles> }) {
  if (val <= 0 || !(h.active === id || h.hovered === id)) return null;
  return (
    <div className={cn('absolute pointer-events-none z-[13]', h.active === id ? (color === 'emerald' ? 'bg-emerald-400/25' : 'bg-orange-400/25') : (color === 'emerald' ? 'bg-emerald-400/10' : 'bg-orange-400/10'))} style={style}>
      {val >= 16 && <span className={cn('absolute inset-0 flex items-center justify-center text-[8px] font-mono', color === 'emerald' ? 'text-emerald-700/60' : 'text-orange-700/60')}>{val}</span>}
    </div>
  );
}

function BoxHandle({ element, id, prop, val, dir, sign, color, style, cls, h }: {
  element: El; id: string; prop: string; val: number; dir: 'x' | 'y'; sign: number; color: 'emerald' | 'orange';
  style: Record<string, number>; cls: string; h: ReturnType<typeof useHandles>;
}) {
  const hitSize = Math.max(val, MIN_HIT);
  const isTiny = val < TINY_THRESH;
  const adjustedStyle: Record<string, number> = dir === 'y' ? { ...style, height: hitSize } : { ...style, width: hitSize };
  // For zero-value handles, offset outward so the hit area extends outside the element
  if (val === 0) {
    if (dir === 'y' && sign === -1 && adjustedStyle.top !== undefined) adjustedStyle.top = -MIN_HIT / 2;
    if (dir === 'y' && sign === 1 && adjustedStyle.bottom !== undefined) adjustedStyle.bottom = -MIN_HIT / 2;
    if (dir === 'x' && sign === 1 && adjustedStyle.right !== undefined) adjustedStyle.right = -MIN_HIT / 2;
    if (dir === 'x' && sign === -1 && adjustedStyle.left !== undefined) adjustedStyle.left = -MIN_HIT / 2;
  }
  return (
    <div className={cn('absolute z-[14]', cls)} style={adjustedStyle} onPointerDown={(e) => h.drag(element, id, prop, dir, sign, 4, e)} onPointerEnter={() => h.hover(id)} onPointerLeave={() => h.hover(null)}>
      {/* Visible dot indicator for tiny/zero values — like Penpot's show-handler for tiny elements */}
      {isTiny && (h.hovered === id || h.active === id) && (
        <div className={cn('absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full', color === 'emerald' ? 'bg-emerald-500' : 'bg-orange-500', h.active === id ? 'size-2' : 'size-1.5')} />
      )}
      {h.active === id && <span className={cn('absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded px-1 py-px text-[8px] font-mono text-white whitespace-nowrap pointer-events-none z-20 shadow', color === 'emerald' ? 'bg-emerald-600' : 'bg-orange-500')}>{val}px</span>}
    </div>
  );
}

// ─── Border Radius ──────────────────────────────────────────

function RadiusCorners({ element, h }: { element: El; h: ReturnType<typeof useHandles> }) {
  const s = element.styles;
  const getR = (prop: string) => parseInt(String((s as Record<string, unknown>)[prop] ?? s.borderRadius ?? '0')) || 0;
  const corners = [
    { id: 'r-TL', prop: 'borderTopLeftRadius', pos: 'top-1 left-1' },
    { id: 'r-TR', prop: 'borderTopRightRadius', pos: 'top-1 right-1' },
    { id: 'r-BR', prop: 'borderBottomRightRadius', pos: 'bottom-1 right-1' },
    { id: 'r-BL', prop: 'borderBottomLeftRadius', pos: 'bottom-1 left-1' },
  ];
  if (!corners.some(c => getR(c.prop) > 0) && !h.active?.startsWith('r-')) return null;

  return <>{corners.map(({ id, prop, pos }) => {
    const r = getR(prop);
    if (r === 0 && h.active !== id) return null;
    return (
      <div key={id} className={cn('absolute z-20 cursor-nwse-resize flex items-center justify-center size-4 opacity-0 hover:opacity-100 transition-opacity', h.active === id && 'opacity-100', pos)}
        onPointerDown={(e) => h.dragRadius(element, id, prop, e)}>
        <div className={cn('size-1.5 rounded-full transition-all', h.active === id ? 'bg-orange-500 size-2' : 'bg-primary/60')} />
        {h.active === id && <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded bg-orange-500 px-1 py-px text-[8px] font-mono text-white whitespace-nowrap pointer-events-none shadow">{r}</span>}
      </div>
    );
  })}</>;
}

// ─── Main Wrapper ───────────────────────────────────────────

type Props = { element: El; children: ReactNode; className?: string; style?: CSSProperties; isContainer?: boolean };

export default function ElementWrapper({ element, children, className, style, isContainer }: Props) {
  const { state, dispatch } = useEditor();
  const { selected, preview, hovered, dropTarget, device } = state.editor;
  const elements = state.editor.elements;
  const wrapperRef = useRef<HTMLDivElement>(null);

  const isBody = element.type === '__body';
  const isSel = selected?.id === element.id;
  const isHov = hovered === element.id && !isSel;
  const isDrop = dropTarget === element.id && isContainer;
  const resolved = style ?? resolveStyles(element, device);
  const h = useHandles(dispatch);

  // Measured dimensions for hover badge
  const dims = isHov && wrapperRef.current
    ? `${Math.round(wrapperRef.current.offsetWidth)} × ${Math.round(wrapperRef.current.offsetHeight)}`
    : '';

  if (element.hidden && preview) return null;
  if (element.hidden && !preview) return <div className="relative opacity-20 pointer-events-none" style={resolved}>{children}</div>;
  if (preview) return <div style={resolved} className={className}>{children}</div>;

  const s = element.styles;
  const [pt, pr, pb, pl] = parseBox(s, 'padding');
  const [mt, mr, mb, ml] = parseBox(s, 'margin');

  const parentId = findParentId(elements, element.id);

  return (
    <ContextMenu>
    <ContextMenuTrigger disabled={isBody} asChild>
    <div
      ref={wrapperRef}
      data-wrapper
      className={cn(
        'relative group/el min-w-0',
        !isBody && 'ring-1 ring-transparent transition-shadow duration-150',
        isSel && !isBody && 'ring-2 ring-primary',
        isHov && !isBody && 'ring-1 ring-primary/25',
        isDrop && 'ring-2 ring-primary/50 bg-primary/[0.03]',
        isBody && 'min-h-full p-3',
        className,
      )}
      style={resolved}
      onClick={(e) => { e.stopPropagation(); dispatch({ type: 'CHANGE_CLICKED_ELEMENT', payload: { element } }); }}
      onDragOver={(e) => { e.preventDefault(); }}
      onMouseEnter={() => dispatch({ type: 'SET_HOVERED', payload: { id: element.id } })}
      onMouseLeave={() => { if (hovered === element.id) dispatch({ type: 'SET_HOVERED', payload: { id: null } }); }}
    >
      {isSel && !isBody && <Toolbar element={element} dispatch={dispatch} elements={elements} />}
      {isHov && !isBody && <span className="absolute -top-4 left-1 text-[8px] leading-none px-1 py-0.5 rounded-sm bg-muted/80 text-muted-foreground/70 z-10 pointer-events-none">{element.name} <span className="text-muted-foreground/40">{dims}</span></span>}

      {!isBody && !element.locked && (isSel || isHov) && (
        <>
          <BoxZone id="p-T" val={pt} color="emerald" style={{ top: 0, left: 0, right: 0, height: pt }} h={h} />
          <BoxZone id="p-R" val={pr} color="emerald" style={{ top: 0, right: 0, bottom: 0, width: pr }} h={h} />
          <BoxZone id="p-B" val={pb} color="emerald" style={{ bottom: 0, left: 0, right: 0, height: pb }} h={h} />
          <BoxZone id="p-L" val={pl} color="emerald" style={{ top: 0, left: 0, bottom: 0, width: pl }} h={h} />
          <BoxHandle element={element} id="p-T" prop="paddingTop" val={pt} dir="y" sign={-1} color="emerald" style={{ top: 0, left: 0, right: 0, height: pt }} cls="cursor-ns-resize" h={h} />
          <BoxHandle element={element} id="p-R" prop="paddingRight" val={pr} dir="x" sign={1} color="emerald" style={{ top: 0, right: 0, bottom: 0, width: pr }} cls="cursor-ew-resize" h={h} />
          <BoxHandle element={element} id="p-B" prop="paddingBottom" val={pb} dir="y" sign={1} color="emerald" style={{ bottom: 0, left: 0, right: 0, height: pb }} cls="cursor-ns-resize" h={h} />
          <BoxHandle element={element} id="p-L" prop="paddingLeft" val={pl} dir="x" sign={-1} color="emerald" style={{ top: 0, left: 0, bottom: 0, width: pl }} cls="cursor-ew-resize" h={h} />
        </>
      )}

      {isSel && !isBody && !element.locked && (
        <>
          <BoxZone id="m-T" val={mt} color="orange" style={{ top: -mt, left: 0, right: 0, height: mt }} h={h} />
          <BoxZone id="m-R" val={mr} color="orange" style={{ top: 0, right: -mr, bottom: 0, width: mr }} h={h} />
          <BoxZone id="m-B" val={mb} color="orange" style={{ bottom: -mb, left: 0, right: 0, height: mb }} h={h} />
          <BoxZone id="m-L" val={ml} color="orange" style={{ top: 0, left: -ml, bottom: 0, width: ml }} h={h} />
          <BoxHandle element={element} id="m-T" prop="marginTop" val={mt} dir="y" sign={-1} color="orange" style={{ top: -mt, left: 0, right: 0, height: mt }} cls="cursor-ns-resize" h={h} />
          <BoxHandle element={element} id="m-R" prop="marginRight" val={mr} dir="x" sign={1} color="orange" style={{ top: 0, right: -mr, bottom: 0, width: mr }} cls="cursor-ew-resize" h={h} />
          <BoxHandle element={element} id="m-B" prop="marginBottom" val={mb} dir="y" sign={1} color="orange" style={{ bottom: -mb, left: 0, right: 0, height: mb }} cls="cursor-ns-resize" h={h} />
          <BoxHandle element={element} id="m-L" prop="marginLeft" val={ml} dir="x" sign={-1} color="orange" style={{ top: 0, left: -ml, bottom: 0, width: ml }} cls="cursor-ew-resize" h={h} />
          <RadiusCorners element={element} h={h} />
        </>
      )}

      {children}
    </div>
    </ContextMenuTrigger>
    {!isBody && (
      <ContextMenuContent className="w-48 text-xs">
        <ContextMenuItem onClick={() => dispatch({ type: 'REORDER_ELEMENT', payload: { elId: element.id, direction: 'up' } })}>
          Move Up <ContextMenuShortcut>Cmd+↑</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={() => dispatch({ type: 'REORDER_ELEMENT', payload: { elId: element.id, direction: 'down' } })}>
          Move Down <ContextMenuShortcut>Cmd+↓</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        {parentId && (
          <ContextMenuItem onClick={() => dispatch({ type: 'DUPLICATE_ELEMENT', payload: { elId: element.id, containerId: parentId } })}>
            Duplicate <ContextMenuShortcut>Cmd+D</ContextMenuShortcut>
          </ContextMenuItem>
        )}
        <ContextMenuItem onClick={() => navigator.clipboard.writeText(JSON.stringify(element))}>
          Copy <ContextMenuShortcut>Cmd+C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => dispatch({ type: 'UPDATE_ELEMENT', payload: { element: { ...element, locked: !element.locked } } })}>
          {element.locked ? <><MIcon name="lock_open" size={14} className="mr-2" /> Unlock</> : <><MIcon name="lock" size={14} className="mr-2" /> Lock</>}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => dispatch({ type: 'UPDATE_ELEMENT', payload: { element: { ...element, hidden: !element.hidden } } })}>
          {element.hidden ? <><MIcon name="visibility" size={14} className="mr-2" /> Show</> : <><MIcon name="visibility_off" size={14} className="mr-2" /> Hide</>}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem className="text-destructive focus:text-destructive" onClick={() => dispatch({ type: 'DELETE_ELEMENT', payload: { id: element.id } })}>
          Delete <ContextMenuShortcut>Del</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    )}
    </ContextMenu>
  );
}
