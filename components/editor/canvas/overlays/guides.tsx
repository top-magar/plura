'use client';

import { useState, type ReactNode } from 'react';
import { useEditor } from '../../core/provider';

/**
 * Draggable guide lines — Penpot: guides.cljs
 * Drag from ruler edge to create a guide. Drag guide to reposition. Double-click to remove.
 */
export default function Guides({ zoom, scrollLeft, scrollTop }: { zoom: number; scrollLeft: number; scrollTop: number }): ReactNode {
  const { state, dispatch } = useEditor();
  const guides = state.editor.guides;
  const z = zoom / 100;
  const [dragging, setDragging] = useState<{ axis: 'x' | 'y'; index: number | null; pos: number } | null>(null);

  const startDragFromRuler = (axis: 'x' | 'y', e: React.PointerEvent) => {
    e.preventDefault();
    const startPos = axis === 'x' ? e.clientX : e.clientY;
    setDragging({ axis, index: null, pos: axis === 'x' ? (e.clientX + scrollLeft) / z : (e.clientY + scrollTop) / z });

    const onMove = (ev: PointerEvent) => {
      const pos = axis === 'x' ? (ev.clientX + scrollLeft) / z : (ev.clientY + scrollTop) / z;
      setDragging(d => d ? { ...d, pos } : null);
    };
    const onUp = (ev: PointerEvent) => {
      const pos = axis === 'x' ? (ev.clientX + scrollLeft) / z : (ev.clientY + scrollTop) / z;
      if (pos > 0) dispatch({ type: 'ADD_GUIDE', payload: { axis, position: Math.round(pos) } });
      setDragging(null);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  const startDragGuide = (index: number, axis: 'x' | 'y', e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startPos = axis === 'x' ? e.clientX : e.clientY;
    const startVal = guides[index].position;
    setDragging({ axis, index, pos: startVal });

    const onMove = (ev: PointerEvent) => {
      const delta = ((axis === 'x' ? ev.clientX : ev.clientY) - startPos) / z;
      setDragging(d => d ? { ...d, pos: Math.round(startVal + delta) } : null);
    };
    const onUp = (ev: PointerEvent) => {
      const delta = ((axis === 'x' ? ev.clientX : ev.clientY) - startPos) / z;
      const newPos = Math.round(startVal + delta);
      if (newPos < 0) {
        dispatch({ type: 'REMOVE_GUIDE', payload: { index } });
      } else {
        const updated = [...guides];
        updated[index] = { axis, position: newPos };
        // Replace by removing and re-adding
        dispatch({ type: 'REMOVE_GUIDE', payload: { index } });
        dispatch({ type: 'ADD_GUIDE', payload: { axis, position: newPos } });
      }
      setDragging(null);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  return (
    <>
      {/* Drag zones on ruler edges */}
      <div className="absolute top-0 left-[22px] right-0 h-[22px] z-30 cursor-row-resize" onPointerDown={(e) => startDragFromRuler('y', e)} />
      <div className="absolute left-0 top-[22px] bottom-0 w-[22px] z-30 cursor-col-resize" onPointerDown={(e) => startDragFromRuler('x', e)} />

      {/* Existing guides */}
      {guides.map((g, i) => {
        const pos = g.axis === 'x'
          ? { left: g.position * z - scrollLeft, top: 0, width: 1, height: '100%' as const, cursor: 'col-resize' as const }
          : { top: g.position * z - scrollTop, left: 0, height: 1, width: '100%' as const, cursor: 'row-resize' as const };
        return (
          <div
            key={`${g.axis}-${i}`}
            className="absolute z-20 pointer-events-auto"
            style={{ ...pos, backgroundColor: '#818cf8' }}
            onPointerDown={(e) => startDragGuide(i, g.axis, e)}
            onDoubleClick={() => dispatch({ type: 'REMOVE_GUIDE', payload: { index: i } })}
          >
            {/* Wider hit area */}
            <div className={g.axis === 'x' ? 'absolute -left-2 top-0 w-5 h-full cursor-col-resize' : 'absolute -top-2 left-0 h-5 w-full cursor-row-resize'} />
            {/* Label */}
            <span className="absolute bg-indigo-500 text-white text-[8px] font-mono px-1 py-px rounded shadow-sm whitespace-nowrap pointer-events-none" style={g.axis === 'x' ? { top: 24, left: 4 } : { left: 24, top: -2 }}>{g.position}</span>
          </div>
        );
      })}

      {/* Dragging preview */}
      {dragging && (
        <div className="absolute z-50 pointer-events-none" style={dragging.axis === 'x'
          ? { left: dragging.pos * z - scrollLeft, top: 0, width: 1, height: '100%', backgroundColor: '#818cf8' }
          : { top: dragging.pos * z - scrollTop, left: 0, height: 1, width: '100%', backgroundColor: '#818cf8' }
        }>
          <span className="absolute bg-indigo-500 text-white text-[8px] font-mono px-1 py-px rounded shadow-sm whitespace-nowrap" style={dragging.axis === 'x' ? { top: 24, left: 4 } : { left: 24, top: -2 }}>{dragging.pos}</span>
        </div>
      )}
    </>
  );
}
