'use client';

import { useEffect, useState, useRef, type ReactNode } from 'react';
import { useEditor } from '../../core/provider';
import type { El } from '../../core/types';

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
  const [cols, setCols] = useState<Track[]>([]);
  const [rows, setRows] = useState<Track[]>([]);
  const containerRef = useRef<HTMLElement | null>(null);

  const isGrid = selected && (selected.styles.display === 'grid');

  useEffect(() => {
    if (!isGrid || !selected) { setCols([]); setRows([]); return; }
    const el = document.querySelector(`[data-el-id="${selected.id}"]`) as HTMLElement | null;
    if (!el) return;
    containerRef.current = el;
    const rect = el.getBoundingClientRect();
    const colTemplate = (selected.styles as Record<string, string>).gridTemplateColumns || '';
    const rowTemplate = (selected.styles as Record<string, string>).gridTemplateRows || '';
    setCols(parseTracks(colTemplate, rect.width));
    setRows(parseTracks(rowTemplate, rect.height));
  }, [selected, isGrid]);

  if (!isGrid || !selected || (cols.length === 0 && rows.length === 0)) return null;

  const el = containerRef.current;
  if (!el) return null;
  const canvasEl = document.querySelector('[data-canvas]');
  if (!canvasEl) return null;
  const cr = canvasEl.getBoundingClientRect();
  const er = el.getBoundingClientRect();
  const ox = er.left - cr.left;
  const oy = er.top - cr.top;
  const w = er.width;
  const h = er.height;

  const onDragTrack = (axis: 'col' | 'row', index: number, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const tracks = axis === 'col' ? cols : rows;
    const prop = axis === 'col' ? 'gridTemplateColumns' : 'gridTemplateRows';
    const startPos = axis === 'col' ? e.clientX : e.clientY;
    const containerSize = axis === 'col' ? w : h;

    const onMove = (ev: PointerEvent) => {
      const delta = (axis === 'col' ? ev.clientX : ev.clientY) - startPos;
      const newTracks = [...tracks];
      // Resize track[index] and track[index+1]
      const t1 = newTracks[index];
      const t2 = newTracks[index + 1];
      if (!t1 || !t2) return;
      const s1 = t1.end - t1.start + delta;
      const s2 = t2.end - t2.start - delta;
      if (s1 < 10 || s2 < 10) return;
      // Convert back to template string
      const template = newTracks.map((t, i) => {
        if (i === index) return `${Math.round(s1)}px`;
        if (i === index + 1) return `${Math.round(s2)}px`;
        return t.size;
      }).join(' ');
      dispatch({ type: 'UPDATE_ELEMENT', payload: { element: { ...selected, styles: { ...selected.styles, [prop]: template } } } });
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
          <div className="absolute left-1/2 top-0 w-px h-full -translate-x-px bg-indigo-400/40 group-hover:bg-indigo-500/80" />
        </div>
      ))}
      {/* Row lines */}
      {rows.map((row, i) => i < rows.length - 1 && (
        <div key={`r${i}`} className="absolute pointer-events-auto cursor-row-resize group" style={{ left: ox, top: oy + row.end, width: w, height: 8, transform: 'translateY(-4px)' }} onPointerDown={(e) => onDragTrack('row', i, e)}>
          <div className="absolute top-1/2 left-0 h-px w-full -translate-y-px bg-indigo-400/40 group-hover:bg-indigo-500/80" />
        </div>
      ))}
      {/* Track size labels */}
      {cols.map((col, i) => (
        <span key={`cl${i}`} className="absolute text-[7px] font-mono text-indigo-400/70 pointer-events-none" style={{ left: ox + col.start + (col.end - col.start) / 2, top: oy - 12, transform: 'translateX(-50%)' }}>{col.size}</span>
      ))}
      {rows.map((row, i) => (
        <span key={`rl${i}`} className="absolute text-[7px] font-mono text-indigo-400/70 pointer-events-none" style={{ top: oy + row.start + (row.end - row.start) / 2, left: ox - 4, transform: 'translateX(-100%) translateY(-50%)' }}>{row.size}</span>
      ))}
    </div>
  );
}
