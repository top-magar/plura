'use client';

import { useCallback, useRef, useState, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import type { El } from '../core/types';
import type { useEditor } from '../core/provider';

// ─── Helpers ────────────────────────────────────────────

export function parseBox(styles: CSSProperties, prefix: 'padding' | 'margin'): [number, number, number, number] {
  const s = styles as Record<string, unknown>;
  const sh = String(s[prefix] ?? '');
  const parts = sh ? sh.split(/\s+/).map(v => parseInt(v) || 0) : [0];
  let [t, r, b, l] = parts.length === 1 ? [parts[0], parts[0], parts[0], parts[0]]
    : parts.length === 2 ? [parts[0], parts[1], parts[0], parts[1]]
    : parts.length === 3 ? [parts[0], parts[1], parts[2], parts[1]]
    : [parts[0], parts[1], parts[2], parts[3]];
  if (s[`${prefix}Top`] !== undefined) t = parseInt(String(s[`${prefix}Top`])) || 0;
  if (s[`${prefix}Right`] !== undefined) r = parseInt(String(s[`${prefix}Right`])) || 0;
  if (s[`${prefix}Bottom`] !== undefined) b = parseInt(String(s[`${prefix}Bottom`])) || 0;
  if (s[`${prefix}Left`] !== undefined) l = parseInt(String(s[`${prefix}Left`])) || 0;
  return [t, r, b, l];
}

function expandShorthand(styles: CSSProperties, prefix: 'padding' | 'margin'): Record<string, unknown> {
  const s = { ...styles } as Record<string, unknown>;
  if (!s[prefix]) return s;
  const [t, r, b, l] = parseBox(styles, prefix);
  s[`${prefix}Top`] = `${t}px`; s[`${prefix}Right`] = `${r}px`;
  s[`${prefix}Bottom`] = `${b}px`; s[`${prefix}Left`] = `${l}px`;
  delete s[prefix];
  return s;
}

// ─── Constants ──────────────────────────────────────────

const MIN_HIT = 8;
const TINY_THRESH = 25;

// ─── Handle Hook ────────────────────────────────────────

export type HandleState = { active: string | null; hovered: string | null };

export function useHandles(dispatch: ReturnType<typeof useEditor>['dispatch']) {
  const [state, setState] = useState<HandleState>({ active: null, hovered: null });
  const elRef = useRef<El | null>(null);

  const drag = useCallback((element: El, id: string, prop: string, dir: 'x' | 'y', sign: number, snap: number, e: React.PointerEvent) => {
    e.preventDefault(); e.stopPropagation();
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
    e.preventDefault(); e.stopPropagation();
    elRef.current = element;
    const sx = e.clientX, sy = e.clientY;
    const sv = parseInt(String((element.styles as Record<string, unknown>)[prop] ?? element.styles.borderRadius ?? '0')) || 0;
    setState(s => ({ ...s, active: id }));
    const onMove = (ev: PointerEvent) => {
      if (!elRef.current) return;
      const d = Math.max(Math.abs(sx - ev.clientX), Math.abs(sy - ev.clientY)) * ((sx - ev.clientX + sy - ev.clientY) > 0 ? 1 : -1);
      const val = Math.max(0, Math.round((sv + d) / 2) * 2);
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

// ─── Components ─────────────────────────────────────────

export function BoxZone({ id, val, color, style, h }: { id: string; val: number; color: 'emerald' | 'orange'; style: Record<string, number>; h: ReturnType<typeof useHandles> }) {
  if (val <= 0 || !(h.active === id || h.hovered === id)) return null;
  return (
    <div className={cn('absolute pointer-events-none z-[13]', h.active === id ? (color === 'emerald' ? 'bg-emerald-400/25' : 'bg-orange-400/25') : (color === 'emerald' ? 'bg-emerald-400/10' : 'bg-orange-400/10'))} style={style}>
      {val >= 16 && <span className={cn('absolute inset-0 flex items-center justify-center text-[8px] font-mono', color === 'emerald' ? 'text-emerald-700/60' : 'text-orange-700/60')}>{val}</span>}
    </div>
  );
}

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
      {h.active === id && <span className={cn('absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded px-1 py-px text-[8px] font-mono text-white whitespace-nowrap pointer-events-none z-20 shadow', color === 'emerald' ? 'bg-emerald-600' : 'bg-orange-500')}>{val}px</span>}
    </div>
  );
}

export function RadiusCorners({ element, h }: { element: El; h: ReturnType<typeof useHandles> }) {
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
      <div key={id} className={cn('absolute z-20 cursor-nwse-resize flex items-center justify-center size-4 opacity-0 hover:opacity-100 transition-opacity', h.active === id && 'opacity-100', pos)} onPointerDown={(e) => h.dragRadius(element, id, prop, e)}>
        <div className={cn('size-1.5 rounded-full transition-all', h.active === id ? 'bg-orange-500 size-2' : 'bg-primary/60')} />
        {h.active === id && <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded bg-orange-500 px-1 py-px text-[8px] font-mono text-white whitespace-nowrap pointer-events-none shadow">{r}</span>}
      </div>
    );
  })}</>;
}
