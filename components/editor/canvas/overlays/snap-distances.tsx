'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useEditor } from '../../core/provider';
import { findParentId, findEl } from '../../core/tree-helpers';
import type { El } from '../../core/types';

type Line = { x: number; y: number; w: number; h: number; label: string; dir: 'h' | 'v' };

function measure(selRect: DOMRect, sibRect: DOMRect): Line[] {
  const lines: Line[] = [];
  const THRESH = 400; // max distance to show

  // Vertical distance (above/below)
  if (Math.max(selRect.left, sibRect.left) < Math.min(selRect.right, sibRect.right)) {
    const cx = Math.max(selRect.left, sibRect.left) + (Math.min(selRect.right, sibRect.right) - Math.max(selRect.left, sibRect.left)) / 2;
    // Sibling above
    if (sibRect.bottom <= selRect.top) {
      const gap = selRect.top - sibRect.bottom;
      if (gap > 0 && gap < THRESH) lines.push({ x: cx, y: sibRect.bottom, w: 0, h: gap, label: `${Math.round(gap)}`, dir: 'v' });
    }
    // Sibling below
    if (sibRect.top >= selRect.bottom) {
      const gap = sibRect.top - selRect.bottom;
      if (gap > 0 && gap < THRESH) lines.push({ x: cx, y: selRect.bottom, w: 0, h: gap, label: `${Math.round(gap)}`, dir: 'v' });
    }
  }

  // Horizontal distance (left/right)
  if (Math.max(selRect.top, sibRect.top) < Math.min(selRect.bottom, sibRect.bottom)) {
    const cy = Math.max(selRect.top, sibRect.top) + (Math.min(selRect.bottom, sibRect.bottom) - Math.max(selRect.top, sibRect.top)) / 2;
    // Sibling left
    if (sibRect.right <= selRect.left) {
      const gap = selRect.left - sibRect.right;
      if (gap > 0 && gap < THRESH) lines.push({ x: sibRect.right, y: cy, w: gap, h: 0, label: `${Math.round(gap)}`, dir: 'h' });
    }
    // Sibling right
    if (sibRect.left >= selRect.right) {
      const gap = sibRect.left - selRect.right;
      if (gap > 0 && gap < THRESH) lines.push({ x: selRect.right, y: cy, w: gap, h: 0, label: `${Math.round(gap)}`, dir: 'h' });
    }
  }

  return lines;
}

export default function SnapDistances(): ReactNode {
  const { state } = useEditor();
  const { selected, elements, preview } = state.editor;
  const [lines, setLines] = useState<Line[]>([]);

  useEffect(() => {
    if (!selected || preview || selected.type === '__body') { setLines([]); return; }

    const selDom = document.querySelector(`[data-el-id="${selected.id}"]`);
    if (!selDom) { setLines([]); return; }

    const parentId = findParentId(elements, selected.id);
    if (!parentId) { setLines([]); return; }
    const parent = findEl(elements, parentId);
    if (!parent || !Array.isArray(parent.content)) { setLines([]); return; }

    const selRect = selDom.getBoundingClientRect();
    const canvasEl = document.querySelector('[data-canvas]');
    const canvasRect = canvasEl?.getBoundingClientRect() ?? { left: 0, top: 0 };

    const result: Line[] = [];
    for (const sib of parent.content as El[]) {
      if (sib.id === selected.id) continue;
      const sibDom = document.querySelector(`[data-el-id="${sib.id}"]`);
      if (!sibDom) continue;
      const sibRect = sibDom.getBoundingClientRect();
      result.push(...measure(selRect, sibRect));
    }

    // Offset to canvas-relative coordinates
    setLines(result.map(l => ({ ...l, x: l.x - canvasRect.left, y: l.y - canvasRect.top })));
  }, [selected, elements, preview]);

  if (lines.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {lines.map((l, i) => (
        <div key={i} className="absolute" style={{ left: l.x, top: l.y, width: l.dir === 'h' ? l.w : 1, height: l.dir === 'v' ? l.h : 1 }}>
          {/* Line */}
          <div className={l.dir === 'v' ? 'w-px h-full bg-rose-500 mx-auto' : 'h-px w-full bg-rose-500 my-auto'} />
          {/* End caps */}
          {l.dir === 'v' && <><div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-px bg-rose-500" /><div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-px bg-rose-500" /></>}
          {l.dir === 'h' && <><div className="absolute left-0 top-1/2 -translate-y-1/2 h-2 w-px bg-rose-500" /><div className="absolute right-0 top-1/2 -translate-y-1/2 h-2 w-px bg-rose-500" /></>}
          {/* Label */}
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-rose-500 text-white text-[8px] font-mono px-1 py-px rounded shadow-sm whitespace-nowrap">{l.label}</span>
        </div>
      ))}
    </div>
  );
}
