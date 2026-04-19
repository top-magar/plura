'use client';

import React from 'react';
import { Trash } from 'lucide-react';
import { useEditor } from '../editor-provider';
import type { EditorElement } from '../types';

export default function ContactFormComponent({ element }: { element: EditorElement }) {
  const { state, dispatch } = useEditor();
  const { previewMode, liveMode, selectedElement } = state.editor;
  const isSelected = selectedElement?.id === element.id;

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    dispatch({ type: 'CHANGE_CLICKED_ELEMENT', payload: { elementDetails: element } });
  }

  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData('moveElementId', element.id);
  }

  const form = (
    <form style={element.styles} onSubmit={(e) => e.preventDefault()}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <input type="text" placeholder="Name" disabled={!previewMode && !liveMode} style={{ padding: '8px', border: '1px solid #ccc' }} />
        <input type="email" placeholder="Email" disabled={!previewMode && !liveMode} style={{ padding: '8px', border: '1px solid #ccc' }} />
        <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer' }}>
          Submit
        </button>
      </div>
    </form>
  );

  if (previewMode || liveMode) return form;

  return (
    <div
      className={`relative outline-1 outline-dashed outline-transparent transition-[outline-color] duration-100 hover:outline-primary ${isSelected ? 'outline-2 outline-solid outline-primary' : ''}`}
      onClick={handleClick}
      draggable
      onDragStart={handleDragStart}
    >
      {isSelected && <span className="absolute -top-5 left-0 text-[10px] px-1.5 py-px bg-primary text-primary-foreground z-10 pointer-events-none whitespace-nowrap">{element.name}</span>}
      {form}
      {isSelected && (
        <button
          className="absolute -top-5 right-0 bg-destructive text-white border-none py-0.5 px-1 cursor-pointer flex items-center z-10"
          onClick={(e) => {
            e.stopPropagation();
            dispatch({ type: 'DELETE_ELEMENT', payload: { elementDetails: element } });
          }}
        >
          <Trash size={14} />
        </button>
      )}
    </div>
  );
}
