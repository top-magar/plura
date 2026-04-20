'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useEditor } from '../../core/provider';
import { findParentId, findEl } from '../../core/tree-helpers';
import type { El } from '../../core/types';

type Guide = { x1: number; y1: number; x2: number; y2: number };

const SNAP_THRESH = 2; // px tolerance for alignment

export default function SnapGuides(): ReactNode {
  const { state } = useEditor();
  const { selected, elements, preview } = state.editor;
  const [guides, setGuides] = useState<Guide[]>([]);

  useEffect(() => {
    if (!selected || preview || selected.type === '__body') { setGuides([]); return; }

    const selDom = document.querySelector(`[data-el-id="${selected.id}"]`);
    const canvasEl = document.querySelector('[data-canvas]');
    if (!selDom || !canvasEl) { setGuides([]); return; }

    const parentId = findParentId(elements, selected.id);
    if (!parentId) { setGuides([]); return; }
    const parent = findEl(elements, parentId);
    if (!parent || !Array.isArray(parent.content)) { setGuides([]); return; }

    const sr = selDom.getBoundingClientRect();
    const cr = canvasEl.getBoundingClientRect();
    const toLocal = (x: number, y: number) => ({ x: x - cr.left, y: y - cr.top });

    const selEdges = {
      left: sr.left, right: sr.right, cx: sr.left + sr.width / 2,
      top: sr.top, bottom: sr.bottom, cy: sr.top + sr.height / 2,
    };

    const result: Guide[] = [];

    for (const sib of parent.content as El[]) {
      if (sib.id === selected.id) continue;
      const sibDom = document.querySelector(`[data-el-id="${sib.id}"]`);
      if (!sibDom) continue;
      const r = sibDom.getBoundingClientRect();

      const sibEdges = {
        left: r.left, right: r.right, cx: r.left + r.width / 2,
        top: r.top, bottom: r.bottom, cy: r.top + r.height / 2,
      };

      // Vertical guides (same x-position)
      const vPairs: [number, number][] = [
        [selEdges.left, sibEdges.left], [selEdges.right, sibEdges.right],
        [selEdges.cx, sibEdges.cx], [selEdges.left, sibEdges.right],
        [selEdges.right, sibEdges.left],
      ];
      for (const [a, b] of vPairs) {
        if (Math.abs(a - b) <= SNAP_THRESH) {
          const minY = Math.min(sr.top, r.top);
          const maxY = Math.max(sr.bottom, r.bottom);
          const p1 = toLocal(a, minY);
          const p2 = toLocal(a, maxY);
          result.push({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y });
        }
      }

      // Horizontal guides (same y-position)
      const hPairs: [number, number][] = [
        [selEdges.top, sibEdges.top], [selEdges.bottom, sibEdges.bottom],
        [selEdges.cy, sibEdges.cy], [selEdges.top, sibEdges.bottom],
        [selEdges.bottom, sibEdges.top],
      ];
      for (const [a, b] of hPairs) {
        if (Math.abs(a - b) <= SNAP_THRESH) {
          const minX = Math.min(sr.left, r.left);
          const maxX = Math.max(sr.right, r.right);
          const p1 = toLocal(minX, a);
          const p2 = toLocal(maxX, a);
          result.push({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y });
        }
      }
    }

    setGuides(result);
  }, [selected, elements, preview]);

  if (guides.length === 0) return null;

  return (
    <svg className="absolute inset-0 pointer-events-none z-50 overflow-visible" style={{ width: '100%', height: '100%' }}>
      {guides.map((g, i) => (
        <line key={i} x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2} stroke="#818cf8" strokeWidth={0.5} strokeDasharray="3 2" />
      ))}
    </svg>
  );
}
