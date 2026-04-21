import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import type { El } from '../../core/types';
import type { useEditor } from '../../core/provider';

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

export function expandShorthand(styles: CSSProperties, prefix: 'padding' | 'margin'): Record<string, unknown> {
  const s = { ...styles } as Record<string, unknown>;
  if (!s[prefix]) return s;
  const [t, r, b, l] = parseBox(styles, prefix);
  s[`${prefix}Top`] = `${t}px`; s[`${prefix}Right`] = `${r}px`;
  s[`${prefix}Bottom`] = `${b}px`; s[`${prefix}Left`] = `${l}px`;
  delete s[prefix];
  return s;
}

// ─── Hook ───────────────────────────────────────────────

export type HandleState = { active: string | null; hovered: string | null };

export function useHandles(dispatch: ReturnType<typeof useEditor>['dispatch']) {
  const [state, setState] = useState<HandleState>({ active: null, hovered: null });
  const elRef = useRef<El | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Cleanup document listeners on unmount
  useEffect(() => () => { cleanupRef.current?.(); }, []);

  const drag = useCallback((element: El, id: string, prop: string, dir: 'x' | 'y', sign: number, _snap: number, e: React.PointerEvent) => {
    e.preventDefault(); e.stopPropagation();
    elRef.current = element;
    const startPos = dir === 'y' ? e.clientY : e.clientX;
    const z = parseFloat(getComputedStyle(document.querySelector('[data-canvas]')!).getPropertyValue('--zoom')) || 1;
    const startVal = parseInt(String((element.styles as Record<string, unknown>)[prop] ?? '0')) || 0;
    setState(s => ({ ...s, active: id }));
    const prefix = prop.replace(/(Top|Right|Bottom|Left)$/, '') as 'padding' | 'margin';
    const side = prop.replace(prefix, '');
    const opp: Record<string, string> = { Top: 'Bottom', Bottom: 'Top', Left: 'Right', Right: 'Left' };
    const oppProp = `${prefix}${opp[side] ?? ''}`;
    const allProps = ['Top', 'Right', 'Bottom', 'Left'].map(s => `${prefix}${s}`);

    const onMove = (ev: PointerEvent) => {
      if (!elRef.current) return;
      const snap = ev.shiftKey ? 10 : _snap; // Shift = big nudge
      const delta = ((dir === 'y' ? ev.clientY : ev.clientX) - startPos) / z * sign;
      const val = Math.max(0, Math.round((startVal + delta) / snap) * snap);
      const expanded = expandShorthand(elRef.current.styles, prefix);
      const updates: Record<string, string> = { [prop]: `${val}px` };
      if (ev.altKey && !ev.shiftKey) updates[oppProp] = `${val}px`;
      if (ev.altKey && ev.shiftKey) { for (const p of allProps) updates[p] = `${val}px`; }
      const next = { ...elRef.current, styles: { ...expanded, ...updates } as CSSProperties };
      elRef.current = next;
      dispatch({ type: 'UPDATE_ELEMENT_LIVE', payload: { element: next } });
    };
    const onUp = () => {
      dispatch({ type: 'COMMIT_HISTORY' });
      elRef.current = null;
      setState(s => ({ ...s, active: null }));
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      cleanupRef.current = null;
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    cleanupRef.current = onUp;
  }, [dispatch]);

  const dragRadius = useCallback((element: El, id: string, prop: string, e: React.PointerEvent) => {
    e.preventDefault(); e.stopPropagation();
    elRef.current = element;
    const sx = e.clientX, sy = e.clientY;
    const z = parseFloat(getComputedStyle(document.querySelector('[data-canvas]')!).getPropertyValue('--zoom')) || 1;
    const sv = parseInt(String((element.styles as Record<string, unknown>)[prop] ?? element.styles.borderRadius ?? '0')) || 0;
    setState(s => ({ ...s, active: id }));

    // Each corner: dragging toward center = increase radius
    // TL: center is down-right (+dx, +dy). TR: center is down-left (-dx, +dy)
    // BL: center is up-right (+dx, -dy). BR: center is up-left (-dx, -dy)
    const sxSign = id === 'r-TL' || id === 'r-BL' ? 1 : -1;
    const sySign = id === 'r-TL' || id === 'r-TR' ? 1 : -1;

    const onMove = (ev: PointerEvent) => {
      if (!elRef.current) return;
      const dx = (ev.clientX - sx) / z, dy = (ev.clientY - sy) / z;
      const raw = (dx * sxSign + dy * sySign) / 2;
      const snap = ev.shiftKey ? 10 : 2;
      const val = Math.max(0, Math.round((sv + raw) / snap) * snap);
      const cur = { ...elRef.current.styles } as Record<string, unknown>;
      if (cur.borderRadius) {
        const r = parseInt(String(cur.borderRadius)) || 0;
        cur.borderTopLeftRadius = `${r}px`; cur.borderTopRightRadius = `${r}px`;
        cur.borderBottomRightRadius = `${r}px`; cur.borderBottomLeftRadius = `${r}px`;
        delete cur.borderRadius;
      }
      const updates: Record<string, string> = { [prop]: `${val}px` };
      // Alt = all corners uniform
      if (ev.altKey) {
        updates.borderTopLeftRadius = `${val}px`;
        updates.borderTopRightRadius = `${val}px`;
        updates.borderBottomRightRadius = `${val}px`;
        updates.borderBottomLeftRadius = `${val}px`;
      }
      const next = { ...elRef.current, styles: { ...cur, ...updates } as CSSProperties };
      elRef.current = next;
      dispatch({ type: 'UPDATE_ELEMENT_LIVE', payload: { element: next } });
    };
    const onUp = () => {
      dispatch({ type: 'COMMIT_HISTORY' });
      elRef.current = null;
      setState(s => ({ ...s, active: null }));
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      cleanupRef.current = null;
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    cleanupRef.current = onUp;
  }, [dispatch]);

  const hover = useCallback((id: string | null) => setState(s => ({ ...s, hovered: id })), []);
  return { ...state, drag, dragRadius, hover };
}
