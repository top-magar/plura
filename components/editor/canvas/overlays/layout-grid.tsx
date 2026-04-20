'use client';

import { type ReactNode } from 'react';
import { useEditor } from '../../core/provider';

/**
 * Layout grid overlay — shows 8px grid on selected container.
 * Penpot: frame_grid.cljs (181 lines) — square grid pattern.
 */
export default function LayoutGrid(): ReactNode {
  const { state } = useEditor();
  const selected = state.editor.selected;
  if (!selected || !Array.isArray(selected.content)) return null;

  const el = document.querySelector(`[data-el-id="${selected.id}"]`);
  const canvasEl = document.querySelector('[data-canvas]');
  if (!el || !canvasEl) return null;

  const er = el.getBoundingClientRect();
  const cr = canvasEl.getBoundingClientRect();

  return (
    <div className="absolute pointer-events-none z-30" style={{
      left: er.left - cr.left, top: er.top - cr.top,
      width: er.width, height: er.height,
      backgroundImage: 'linear-gradient(to right, hsl(var(--primary) / 0.06) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--primary) / 0.06) 1px, transparent 1px)',
      backgroundSize: '8px 8px',
    }} />
  );
}
