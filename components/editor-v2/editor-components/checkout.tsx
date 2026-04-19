'use client';

import React from 'react';
import { Trash } from 'lucide-react';
import { useEditor } from '../editor-provider';
import type { EditorElement } from '../types';

export default function CheckoutComponent({ element }: { element: EditorElement }) {
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

  const placeholder = (
    <div style={{ ...element.styles, border: '2px dashed #ccc', padding: '20px', textAlign: 'center' as const }}>
      <p style={{ color: '#888' }}>Payment Form Placeholder</p>
      <p style={{ fontSize: '12px', color: '#aaa' }}>Connect Stripe to enable payments</p>
    </div>
  );

  if (previewMode || liveMode) return placeholder;

  return (
    <div
      className={`editor-el ${isSelected ? 'is-selected' : ''}`}
      onClick={handleClick}
      draggable
      onDragStart={handleDragStart}
    >
      {isSelected && <span className="editor-badge-select">{element.name}</span>}
      {placeholder}
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
