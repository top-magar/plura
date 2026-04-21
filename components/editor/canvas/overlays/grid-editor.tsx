'use client';

import { useEffect, useState, useRef, type ReactNode } from 'react';
import { useEditor } from '../../core/provider';

type Track = { size: string; start: number; end: number };

function parseTracks(template: string, containerSize: number): Track[] {
  if (!template) return [];
  const parts = template.trim().split(/\s+/);
  const frTotal = parts.reduce((sum, p) => sum + (p.endsWith('fr') ? parseFloat(p) : 0), 0);
  const fixedTotal = parts.reduce((sum, p) => {
    if (p.endsWith('px')) return sum + parseFloat(p);
    if (p === 'auto') return sum + 0;
    return sum;
  }, 0);
  const frUnit = frTotal > 0 ? (containerSize - fixedTotal) / frTotal : 0;

  let pos = 0;
  return parts.map((p) => {
    let size = 0;
    if (p.endsWith('fr')) size = parseFloat(p) * frUnit;
    else if (p.endsWith('px')) size = parseFloat(p);
    else if (p === 'auto') size = (containerSize - fixedTotal) / parts.filter(x => x === 'auto').length;
    else size = parseFloat(p) || 0;
    const track = { size: p, start: pos, end: pos + size };
    pos += size;
    return track;
  });
}

export default function GridEditor(): ReactNode {
  const { state, dispatch } = useEditor();
  const selected = state.editor.selected;
  const hovered = state.editor.hovered;
  const [cols, setCols] = useState<Track[]>([]);
  const [rows, setRows] = useState<Track[]>([]);
  const containerRef = useRef<HTMLElement | null>(null);

  const targetId = selected?.styles.display === 'grid' ? selected.id : hovered;
  const targetEl = targetId ? (selected?.id === targetId ? selected : null) : null;
  const isGrid = targetEl && targetEl.styles.display === 'grid';
  const isSelected = selected?.id === targetId;

  useEffect(() => {
    if (!isGrid || !targetEl) { setCols([]); setRows([]); return; }
    const el = document.querySelector(`[data-el-id="${targetEl.id}"]`) as HTMLElement | null;
    if (!el) return;
    containerRef.current = el;
    // Use offsetWidth/offsetHeight — these are in the element's own coordinate space (unscaled)
    const colTemplate = (targetEl.styles as Record<string, string>).gridTemplateColumns || '';
    const rowTemplate = (targetEl.styles as Record<string, string>).gridTemplateRows || '';
    setCols(parseTracks(colTemplate, el.offsetWidth));
    setRows(parseTracks(rowTemplate, el.offsetHeight));
  }, [targetEl, isGrid]);

  if (!isGrid || !targetEl || (cols.length === 0 && rows.length === 0)) return null;

  const el = containerRef.current;
  if (!el) return null;

  // Calculate position relative to [data-canvas] using offset chain (unscaled coordinates)
  let ox = 0, oy = 0;
  let node: HTMLElement | null = el;
  const canvasEl = document.querySelector('[data-canvas]') as HTMLElement | null;
  while (node && node !== canvasEl) {
    ox += node.offsetLeft;
    oy += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  const w = el.offsetWidth;
  const h = el.offsetHeight;

  const updateTemplate = (axis: 'col' | 'row', newTemplate: string) => {
    const prop = axis === 'col' ? 'gridTemplateColumns' : 'gridTemplateRows';
    dispatch({ type: 'UPDATE_ELEMENT', payload: { element: { ...targetEl, styles: { ...targetEl.styles, [prop]: newTemplate } } } });
  };

  const addTrack = (axis: 'col' | 'row') => {
    const prop = axis === 'col' ? 'gridTemplateColumns' : 'gridTemplateRows';
    const current = (targetEl.styles as Record<string, string>)[prop] || '1fr';
    updateTemplate(axis, current + ' 1fr');
  };

  const removeTrack = (axis: 'col' | 'row', index: number) => {
    const tracks = axis === 'col' ? cols : rows;
    if (tracks.length <= 1) return;
    const newTemplate = tracks.filter((_, i) => i !== index).map(t => t.size).join(' ');
    updateTemplate(axis, newTemplate);
  };

  const onDragTrack = (axis: 'col' | 'row', index: number, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const tracks = axis === 'col' ? cols : rows;
    const startPos = axis === 'col' ? e.clientX : e.clientY;
    const z = parseFloat(getComputedStyle(document.querySelector('[data-canvas]')!).getPropertyValue('--zoom')) || 1;

    const onMove = (ev: PointerEvent) => {
      const delta = ((axis === 'col' ? ev.clientX : ev.clientY) - startPos) / z;
      const t1 = tracks[index];
      const t2 = tracks[index + 1];
      if (!t1 || !t2) return;
      const s1 = t1.end - t1.start + delta;
      const s2 = t2.end - t2.start - delta;
      if (s1 < 10 || s2 < 10) return;

      // Preserve fr units when both tracks are fr
      const isFr1 = t1.size.endsWith('fr');
      const isFr2 = t2.size.endsWith('fr');
      const template = tracks.map((t, i) => {
        if (i === index) return isFr1 ? `${(s1 / (s1 + s2) * (parseFloat(t1.size) + parseFloat(t2.size))).toFixed(2)}fr` : `${Math.round(s1)}px`;
        if (i === index + 1) return isFr2 ? `${(s2 / (s1 + s2) * (parseFloat(t1.size) + parseFloat(t2.size))).toFixed(2)}fr` : `${Math.round(s2)}px`;
        return t.size;
      }).join(' ');
      updateTemplate(axis, template);
    };
    const onUp = () => { document.removeEventListener('pointermove', onMove); document.removeEventListener('pointerup', onUp); };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {/* Column lines */}
      {cols.map((col, i) => i < cols.length - 1 && (
        <div key={`c${i}`} className="absolute pointer-events-auto cursor-col-resize group" style={{ left: ox + col.end, top: oy, width: 8, height: h, transform: 'translateX(-4px)' }} onPointerDown={(e) => onDragTrack('col', i, e)}>
          <div className="absolute left-1/2 top-0 w-px h-full -translate-x-px bg-indigo-400/40 group-hover:bg-indigo-500/80 transition-colors" />
        </div>
      ))}
      {/* Row lines */}
      {rows.map((row, i) => i < rows.length - 1 && (
        <div key={`r${i}`} className="absolute pointer-events-auto cursor-row-resize group" style={{ left: ox, top: oy + row.end, width: w, height: 8, transform: 'translateY(-4px)' }} onPointerDown={(e) => onDragTrack('row', i, e)}>
          <div className="absolute top-1/2 left-0 h-px w-full -translate-y-px bg-indigo-400/40 group-hover:bg-indigo-500/80 transition-colors" />
        </div>
      ))}
      {/* Track size labels */}
      {cols.map((col, i) => (
        <span key={`cl${i}`} className="absolute text-[7px] font-mono text-indigo-400/70 pointer-events-none" style={{ left: ox + col.start + (col.end - col.start) / 2, top: oy - 12, transform: 'translateX(-50%)' }}>{col.size}</span>
      ))}
      {rows.map((row, i) => (
        <span key={`rl${i}`} className="absolute text-[7px] font-mono text-indigo-400/70 pointer-events-none" style={{ top: oy + row.start + (row.end - row.start) / 2, left: ox - 4, transform: 'translateX(-100%) translateY(-50%)' }}>{row.size}</span>
      ))}
      {/* Add/remove track buttons (only when selected) */}
      {isSelected && (
        <>
          <button className="absolute pointer-events-auto size-4 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center hover:bg-indigo-600 shadow-sm" style={{ left: ox + w + 4, top: oy + h / 2 - 8 }} onClick={() => addTrack('col')}>+</button>
          <button className="absolute pointer-events-auto size-4 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center hover:bg-indigo-600 shadow-sm" style={{ left: ox + w / 2 - 8, top: oy + h + 4 }} onClick={() => addTrack('row')}>+</button>
          {cols.length > 1 && <button className="absolute pointer-events-auto size-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center hover:bg-rose-600 shadow-sm" style={{ left: ox + w + 4, top: oy + h / 2 + 8 }} onClick={() => removeTrack('col', cols.length - 1)}>−</button>}
          {rows.length > 1 && <button className="absolute pointer-events-auto size-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center hover:bg-rose-600 shadow-sm" style={{ left: ox + w / 2 + 8, top: oy + h + 4 }} onClick={() => removeTrack('row', rows.length - 1)}>−</button>}
        </>
      )}
    </div>
  );
}
