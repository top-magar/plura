'use client';

import { type ReactNode } from 'react';
import type { El } from '../../core/types';

const SNAP_THRESHOLD = 6; // px distance to snap

export type Guide = { pos: number; dir: 'h' | 'v' };

/** Given a dragging element rect and sibling rects, find snap guides and adjusted position */
export function calcSnap(
  el: { x: number; y: number; w: number; h: number },
  siblings: { x: number; y: number; w: number; h: number }[],
  sectionW: number,
  sectionH: number,
): { nx: number; ny: number; guides: Guide[] } {
  const guides: Guide[] = [];
  let nx = el.x, ny = el.y;
  let bestDx = SNAP_THRESHOLD + 1, bestDy = SNAP_THRESHOLD + 1;

  // Element edges and center
  const elL = el.x, elR = el.x + el.w, elCx = el.x + el.w / 2;
  const elT = el.y, elB = el.y + el.h, elCy = el.y + el.h / 2;

  // Collect all snap targets: sibling edges/centers + section edges/center
  const xTargets: number[] = [0, sectionW, sectionW / 2];
  const yTargets: number[] = [0, sectionH, sectionH / 2];

  for (const s of siblings) {
    xTargets.push(s.x, s.x + s.w, s.x + s.w / 2);
    yTargets.push(s.y, s.y + s.h, s.y + s.h / 2);
  }

  // Check X snaps (left, right, center of dragging element against targets)
  for (const tx of xTargets) {
    for (const [edge, offset] of [[elL, 0], [elR, -el.w], [elCx, -el.w / 2]] as [number, number][]) {
      const d = Math.abs(edge - tx);
      if (d < bestDx) { bestDx = d; nx = tx + offset; }
    }
  }

  // Check Y snaps
  for (const ty of yTargets) {
    for (const [edge, offset] of [[elT, 0], [elB, -el.h], [elCy, -el.h / 2]] as [number, number][]) {
      const d = Math.abs(edge - ty);
      if (d < bestDy) { bestDy = d; ny = ty + offset; }
    }
  }

  // Build guide lines for snapped positions
  if (bestDx <= SNAP_THRESHOLD) {
    // Which edge snapped?
    const snappedL = nx, snappedR = nx + el.w, snappedCx = nx + el.w / 2;
    for (const tx of xTargets) {
      if (Math.abs(snappedL - tx) < 1 || Math.abs(snappedR - tx) < 1 || Math.abs(snappedCx - tx) < 1) {
        guides.push({ pos: tx, dir: 'v' });
      }
    }
  } else {
    nx = el.x; // no snap
  }

  if (bestDy <= SNAP_THRESHOLD) {
    const snappedT = ny, snappedB = ny + el.h, snappedCy = ny + el.h / 2;
    for (const ty of yTargets) {
      if (Math.abs(snappedT - ty) < 1 || Math.abs(snappedB - ty) < 1 || Math.abs(snappedCy - ty) < 1) {
        guides.push({ pos: ty, dir: 'h' });
      }
    }
  } else {
    ny = el.y; // no snap
  }

  // Deduplicate guides
  const seen = new Set<string>();
  const unique = guides.filter(g => {
    const k = `${g.dir}:${g.pos}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  return { nx, ny, guides: unique };
}

/** Get sibling rects from element tree */
export function getSiblingRects(sectionContent: El[], dragId: string): { x: number; y: number; w: number; h: number }[] {
  return (sectionContent as El[])
    .filter(c => c.id !== dragId && c.x !== undefined && c.y !== undefined)
    .map(c => ({ x: c.x ?? 0, y: c.y ?? 0, w: c.w ?? 100, h: c.h ?? 100 }));
}

/** Render snap guide lines — rendered inside the dragging element, offset to section coords */
export function SnapGuides({ guides, elX, elY, sectionW, sectionH }: { guides: Guide[]; elX: number; elY: number; sectionW: number; sectionH: number }): ReactNode {
  if (guides.length === 0) return null;
  return (
    <div className="pointer-events-none z-[50]" style={{ position: 'absolute', left: -elX, top: -elY, width: sectionW, height: sectionH }}>
      {guides.map((g, i) =>
        g.dir === 'v' ? (
          <div key={i} className="absolute top-0 w-px bg-primary/60" style={{ left: g.pos, height: sectionH }} />
        ) : (
          <div key={i} className="absolute left-0 h-px bg-primary/60" style={{ top: g.pos, width: sectionW }} />
        )
      )}
    </div>
  );
}
