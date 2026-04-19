'use client';

import React from 'react';
import { Trash } from 'lucide-react';
import { useEditor } from '../editor-provider';
import type { EditorElement } from '../types';

export default function ImageComponent({ element }: { element: EditorElement }) {
  const { state, dispatch } = useEditor();
  const { previewMode, liveMode, selectedElement } = state.editor;
  const isSelected = selectedElement?.id === element.id;
  const content = element.content as Record<string, string>;

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    dispatch({ type: 'CHANGE_CLICKED_ELEMENT', payload: { elementDetails: element } });
  }

  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData('moveElementId', element.id);
  }

  if (previewMode || liveMode) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={content.src} alt={content.alt || ''} style={element.styles} />;
  }

  return (
    <div
      className={`editor-el ${isSelected ? 'is-selected' : ''}`}
      onClick={handleClick}
      draggable
      onDragStart={handleDragStart}
    >
      {isSelected && <span className="editor-badge-select">{element.name}</span>}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={content.src} alt={content.alt || ''} style={element.styles} />
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
