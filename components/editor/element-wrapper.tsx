'use client';

import { useCallback, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { GripVertical, Trash2, Copy, ChevronUp, ChevronDown, Lock } from 'lucide-react';
import { useEditor } from './editor-provider';
import { findParentId } from './tree-helpers';
import { useDragOverlay } from './drag-overlay';
import { cn } from '@/lib/utils';
import type { El } from './types';
import { resolveStyles } from './types';

// ─── Helpers ────────────────────────────────────────────────

function parseBox(sh: string | undefined, t: string | undefined, r: string | undefined, b: string | undefined, l: string | undefined): [number, number, number, number] {
  const tv = parseInt(String(t ?? '')) || 0, rv = parseInt(String(r ?? '')) || 0;
  const bv = parseInt(String(b ?? '')) || 0, lv = parseInt(String(l ?? '')) || 0;
  if (tv || rv || bv || lv) return [tv, rv, bv, lv];
  if (!sh) return [0, 0, 0, 0];
  const p = String(sh).split(/\s+/).map(v => parseInt(v) || 0);
  if (p.length === 1) return [p[0], p[0], p[0], p[0]];
  if (p.length === 2) return [p[0], p[1], p[0], p[1]];
  if (p.length === 3) return [p[0], p[1], p[2], p[1]];
  return [p[0], p[1], p[2], p[3]];
}

// ─── Unified Handle Drag ────────────────────────────────────

type HandleState = { active: string | null; hovered: string | null };

function useHandles(element: El, dispatch: ReturnType<typeof useEditor>['dispatch']) {
  const [state, setState] = useState<HandleState>({ active: null, hovered: null });
  const ref = useRef<{ pos: number; val: number } | null>(null);

  const drag = useCallback((id: string, prop: string, dir: 'x' | 'y', sign: number, snap: number, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    ref.current = { pos: dir === 'y' ? e.clientY : e.clientX, val: parseInt(String((element.styles as Record<string, unknown>)[prop] ?? '0')) || 0 };
    setState(s => ({ ...s, active: id }));

    const onMove = (ev: PointerEvent) => {
      if (!ref.current) return;
      const delta = ((dir === 'y' ? ev.clientY : ev.clientX) - ref.current.pos) * sign;
      const val = Math.max(0, Math.round((ref.current.val + delta) / snap) * snap);
      dispatch({ type: 'UPDATE_ELEMENT', payload: { element: { ...element, styles: { ...element.styles, [prop]: `${val}px` } } } });
    };
    const onUp = () => { ref.current = null; setState(s => ({ ...s, active: null })); document.removeEventListener('pointermove', onMove); document.removeEventListener('pointerup', onUp); };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }, [element, dispatch]);

  const hover = useCallback((id: string | null) => setState(s => ({ ...s, hovered: id })), []);

  return { ...state, drag, hover };
}

// ─── Toolbar ────────────────────────────────────────────────

function Toolbar({ element, dispatch, elements }: { element: El; dispatch: ReturnType<typeof useEditor>['dispatch']; elements: El[] }) {
  const parentId = findParentId(elements, element.id);
  const { start } = useDragOverlay();
  return (
    <div className="absolute -top-7 left-0 z-20 flex items-center gap-px rounded-md bg-primary text-primary-foreground shadow-md text-[9px] leading-none overflow-hidden" onClick={(e) => e.stopPropagation()}>
      <span className="flex items-center px-1 py-1 cursor-grab hover:bg-primary-foreground/10 active:cursor-grabbing" draggable onDragStart={(e) => { e.stopPropagation(); e.dataTransfer.setData('moveElementId', element.id); start(element.name, e); }}><GripVertical className="size-3" /></span>
      {element.locked && <Lock className="size-2.5 mx-0.5 text-amber-300" />}
      <span className="px-1 py-1 max-w-[80px] truncate pointer-events-none select-none">{element.name}</span>
      <span className="w-px h-3 bg-primary-foreground/20" />
      <button className="flex items-center px-1 py-1 hover:bg-primary-foreground/10" onClick={() => dispatch({ type: 'REORDER_ELEMENT', payload: { elId: element.id, direction: 'up' } })}><ChevronUp className="size-3" /></button>
      <button className="flex items-center px-1 py-1 hover:bg-primary-foreground/10" onClick={() => dispatch({ type: 'REORDER_ELEMENT', payload: { elId: element.id, direction: 'down' } })}><ChevronDown className="size-3" /></button>
      <span className="w-px h-3 bg-primary-foreground/20" />
      {parentId && <button className="flex items-center px-1 py-1 hover:bg-primary-foreground/10" onClick={() => dispatch({ type: 'DUPLICATE_ELEMENT', payload: { elId: element.id, containerId: parentId } })}><Copy className="size-2.5" /></button>}
      <button className="flex items-center px-1 py-1 hover:bg-destructive/80 hover:text-destructive-foreground" onClick={() => dispatch({ type: 'DELETE_ELEMENT', payload: { id: element.id } })}><Trash2 className="size-2.5" /></button>
    </div>
  );
}

// ─── Box Handle (padding or margin zone) ────────────────────

function BoxZone({ id, val, color, style, h }: { id: string; val: number; color: 'emerald' | 'orange'; style: Record<string, number>; h: ReturnType<typeof useHandles> }) {
  const show = h.active === id || h.hovered === id;
  if (!show) return null;
  const bg = color === 'emerald' ? 'bg-emerald-400' : 'bg-orange-400';
  const text = color === 'emerald' ? 'text-emerald-700/60' : 'text-orange-700/60';
  return (
    <div className={cn('absolute pointer-events-none z-[13] transition-opacity', h.active === id ? `${bg}/25` : `${bg}/10`)} style={style}>
      <span className={cn('absolute inset-0 flex items-center justify-center text-[8px] font-mono', text)}>{val}</span>
    </div>
  );
}

function BoxHandle({ id, prop, val, dir, sign, color, style, cls, h }: {
  id: string; prop: string; val: number; dir: 'x' | 'y'; sign: number; color: 'emerald' | 'orange';
  style: Record<string, number>; cls: string; h: ReturnType<typeof useHandles>;
}) {
  if (val <= 0) return null;
  const bg = color === 'emerald' ? 'bg-emerald-600' : 'bg-orange-500';
  return (
    <div className={cn('absolute z-[14]', cls)} style={style} onPointerDown={(e) => h.drag(id, prop, dir, sign, 4, e)} onPointerEnter={() => h.hover(id)} onPointerLeave={() => h.hover(null)}>
      {h.active === id && <span className={cn('absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded px-1.5 py-0.5 text-[9px] font-mono text-white whitespace-nowrap pointer-events-none z-20 shadow', bg)}>{val}px</span>}
    </div>
  );
}

// ─── Border Radius Corners ──────────────────────────────────

function RadiusCorners({ element, dispatch, h }: { element: El; dispatch: ReturnType<typeof useEditor>['dispatch']; h: ReturnType<typeof useHandles> }) {
  const s = element.styles;
  const getR = (prop: string) => parseInt(String((s as Record<string, unknown>)[prop] ?? s.borderRadius ?? '0')) || 0;
  const corners = [
    { id: 'r-TL', prop: 'borderTopLeftRadius', pos: 'top-[2px] left-[2px]', rot: '' },
    { id: 'r-TR', prop: 'borderTopRightRadius', pos: 'top-[2px] right-[2px]', rot: 'rotate-90' },
    { id: 'r-BR', prop: 'borderBottomRightRadius', pos: 'bottom-[2px] right-[2px]', rot: 'rotate-180' },
    { id: 'r-BL', prop: 'borderBottomLeftRadius', pos: 'bottom-[2px] left-[2px]', rot: '-rotate-90' },
  ];
  const any = corners.some(c => getR(c.prop) > 0) || h.active?.startsWith('r-');
  if (!any) return null;

  return <>{corners.map(({ id, prop, pos, rot }) => {
    const r = getR(prop);
    if (r === 0 && h.active !== id) return null;
    const sz = Math.max(10, Math.min(r, 28));
    return (
      <div key={id} className={cn('absolute z-20 cursor-nwse-resize', pos)} style={{ width: sz, height: sz }}
        onPointerDown={(e) => {
          e.preventDefault(); e.stopPropagation();
          const sx = e.clientX, sy = e.clientY, sv = r;
          h.drag(id, prop, 'x', 1, 2, e); // sets active
          const onMove = (ev: PointerEvent) => {
            const d = Math.max(Math.abs(sx - ev.clientX), Math.abs(sy - ev.clientY)) * ((sx - ev.clientX + sy - ev.clientY) > 0 ? 1 : -1);
            dispatch({ type: 'UPDATE_ELEMENT', payload: { element: { ...element, styles: { ...element.styles, [prop]: `${Math.max(0, Math.round((sv + d) / 2) * 2)}px` } } } });
          };
          const onUp = () => { document.removeEventListener('pointermove', onMove); document.removeEventListener('pointerup', onUp); };
          document.addEventListener('pointermove', onMove); document.addEventListener('pointerup', onUp);
        }}
      >
        <svg viewBox="0 0 24 24" className={cn('w-full h-full transition-colors', rot, h.active === id ? 'text-orange-500' : 'text-primary/30 hover:text-primary/70')}>
          <path d="M 24 0 A 24 24 0 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        {h.active === id && <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-orange-500 px-1 py-px text-[8px] font-mono text-white whitespace-nowrap pointer-events-none shadow">{r}</span>}
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

  const isBody = element.type === '__body';
  const isSel = selected?.id === element.id;
  const isHov = hovered === element.id && !isSel;
  const isDrop = dropTarget === element.id && isContainer;
  const isLocked = element.locked;
  const isHidden = element.hidden;
  const resolved = style ?? resolveStyles(element, device);
  const h = useHandles(element, dispatch);

  if (isHidden && preview) return null;
  if (isHidden && !preview) return <div className="relative opacity-20 pointer-events-none" style={resolved}>{children}</div>;
  if (preview) return <div style={resolved} className={className}>{children}</div>;

  // Compute box values for handles
  const s = element.styles;
  const [pt, pr, pb, pl] = parseBox(s.padding as string | undefined, s.paddingTop as string | undefined, s.paddingRight as string | undefined, s.paddingBottom as string | undefined, s.paddingLeft as string | undefined);
  const [mt, mr, mb, ml] = parseBox(s.margin as string | undefined, s.marginTop as string | undefined, s.marginRight as string | undefined, s.marginBottom as string | undefined, s.marginLeft as string | undefined);

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
      {isSel && !isBody && <Toolbar element={element} dispatch={dispatch} elements={elements} />}
      {isHov && !isBody && <span className="absolute -top-5 left-1 text-[9px] leading-none px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground z-10 pointer-events-none">{element.name}</span>}

      {isSel && !isBody && !isLocked && (
        <>
          {/* Padding handles */}
          <BoxZone id="p-T" val={pt} color="emerald" style={{ top: 0, left: 0, right: 0, height: pt }} h={h} />
          <BoxZone id="p-R" val={pr} color="emerald" style={{ top: 0, right: 0, bottom: 0, width: pr }} h={h} />
          <BoxZone id="p-B" val={pb} color="emerald" style={{ bottom: 0, left: 0, right: 0, height: pb }} h={h} />
          <BoxZone id="p-L" val={pl} color="emerald" style={{ top: 0, left: 0, bottom: 0, width: pl }} h={h} />
          <BoxHandle id="p-T" prop="paddingTop" val={pt} dir="y" sign={-1} color="emerald" style={{ top: 0, left: 0, right: 0, height: pt }} cls="cursor-ns-resize" h={h} />
          <BoxHandle id="p-R" prop="paddingRight" val={pr} dir="x" sign={1} color="emerald" style={{ top: 0, right: 0, bottom: 0, width: pr }} cls="cursor-ew-resize" h={h} />
          <BoxHandle id="p-B" prop="paddingBottom" val={pb} dir="y" sign={1} color="emerald" style={{ bottom: 0, left: 0, right: 0, height: pb }} cls="cursor-ns-resize" h={h} />
          <BoxHandle id="p-L" prop="paddingLeft" val={pl} dir="x" sign={-1} color="emerald" style={{ top: 0, left: 0, bottom: 0, width: pl }} cls="cursor-ew-resize" h={h} />

          {/* Margin handles */}
          <BoxZone id="m-T" val={mt} color="orange" style={{ top: -mt, left: 0, right: 0, height: mt }} h={h} />
          <BoxZone id="m-R" val={mr} color="orange" style={{ top: 0, right: -mr, bottom: 0, width: mr }} h={h} />
          <BoxZone id="m-B" val={mb} color="orange" style={{ bottom: -mb, left: 0, right: 0, height: mb }} h={h} />
          <BoxZone id="m-L" val={ml} color="orange" style={{ top: 0, left: -ml, bottom: 0, width: ml }} h={h} />
          <BoxHandle id="m-T" prop="marginTop" val={mt} dir="y" sign={-1} color="orange" style={{ top: -mt, left: 0, right: 0, height: mt }} cls="cursor-ns-resize" h={h} />
          <BoxHandle id="m-R" prop="marginRight" val={mr} dir="x" sign={1} color="orange" style={{ top: 0, right: -mr, bottom: 0, width: mr }} cls="cursor-ew-resize" h={h} />
          <BoxHandle id="m-B" prop="marginBottom" val={mb} dir="y" sign={1} color="orange" style={{ bottom: -mb, left: 0, right: 0, height: mb }} cls="cursor-ns-resize" h={h} />
          <BoxHandle id="m-L" prop="marginLeft" val={ml} dir="x" sign={-1} color="orange" style={{ top: 0, left: -ml, bottom: 0, width: ml }} cls="cursor-ew-resize" h={h} />

          {/* Border radius */}
          <RadiusCorners element={element} dispatch={dispatch} h={h} />
        </>
      )}

      {children}
    </div>
  );
}
