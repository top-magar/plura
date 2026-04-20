'use client';

import { type ReactNode } from 'react';
import { useEditor } from '../../core/provider';

/**
 * Gradient editor overlay — shows angle handle for linear gradients on canvas.
 * Penpot: gradients.cljs (539 lines) — we implement the core UX.
 */
export default function GradientEditor(): ReactNode {
  const { state, dispatch } = useEditor();
  const selected = state.editor.selected;
  if (!selected) return null;

  const bg = (selected.styles as Record<string, string>).backgroundImage || '';
  const isLinear = bg.startsWith('linear-gradient');
  if (!isLinear) return null;

  const el = document.querySelector(`[data-el-id="${selected.id}"]`);
  const canvasEl = document.querySelector('[data-canvas]');
  if (!el || !canvasEl) return null;

  const er = el.getBoundingClientRect();
  const cr = canvasEl.getBoundingClientRect();
  const cx = er.left - cr.left + er.width / 2;
  const cy = er.top - cr.top + er.height / 2;
  const radius = Math.min(er.width, er.height) / 2;

  const angleMatch = bg.match(/(\d+)deg/);
  const angle = angleMatch ? parseInt(angleMatch[1]) : 180;
  const rad = (angle - 90) * (Math.PI / 180);
  const x1 = cx - Math.cos(rad) * radius;
  const y1 = cy - Math.sin(rad) * radius;
  const x2 = cx + Math.cos(rad) * radius;
  const y2 = cy + Math.sin(rad) * radius;

  const onDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - cr.left - cx;
      const dy = ev.clientY - cr.top - cy;
      const newAngle = Math.round((Math.atan2(dy, dx) * 180 / Math.PI + 90 + 360) % 360);
      const stops = bg.replace(/linear-gradient\([^,]+,/, '').replace(/\)$/, '');
      dispatch({ type: 'UPDATE_ELEMENT', payload: { element: { ...selected, styles: { ...selected.styles, backgroundImage: `linear-gradient(${newAngle}deg,${stops})` } } } });
    };
    const onUp = () => { document.removeEventListener('pointermove', onMove); document.removeEventListener('pointerup', onUp); };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {/* Gradient line */}
      <svg className="absolute inset-0 overflow-visible" style={{ width: '100%', height: '100%' }}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#818cf8" strokeWidth={1.5} strokeDasharray="4 3" />
      </svg>
      {/* Start handle */}
      <div className="absolute pointer-events-auto cursor-crosshair" style={{ left: x1 - 5, top: y1 - 5, width: 10, height: 10 }} onPointerDown={onDrag}>
        <div className="size-2.5 rounded-full bg-white border-2 border-indigo-500 mx-auto mt-[2.5px]" />
      </div>
      {/* End handle */}
      <div className="absolute pointer-events-auto cursor-crosshair" style={{ left: x2 - 5, top: y2 - 5, width: 10, height: 10 }} onPointerDown={onDrag}>
        <div className="size-2.5 rounded-full bg-indigo-500 border-2 border-indigo-500 mx-auto mt-[2.5px]" />
      </div>
      {/* Angle label */}
      <span className="absolute bg-indigo-500 text-white text-[8px] font-mono px-1 py-px rounded shadow-sm pointer-events-none" style={{ left: cx + 8, top: cy - 8 }}>{angle}°</span>
    </div>
  );
}
