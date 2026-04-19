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
      className={`editor-el ${isSelected ? 'is-selected' : ''}`}
      onClick={handleClick}
      draggable
      onDragStart={handleDragStart}
    >
      {isSelected && <span className="editor-badge-select">{element.name}</span>}
      {form}
      {isSelected && (
        <button
          className="editor-el-delete"
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
