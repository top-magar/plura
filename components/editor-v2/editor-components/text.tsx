'use client';

import React, { useRef } from 'react';
import { Trash } from 'lucide-react';
import { useEditor } from '../editor-provider';
import type { EditorElement } from '../types';

export default function TextComponent({ element }: { element: EditorElement }) {
  const { state, dispatch } = useEditor();
  const spanRef = useRef<HTMLSpanElement>(null);
  const { previewMode, liveMode, selectedElement } = state.editor;
  const isSelected = selectedElement?.id === element.id;
  const content = element.content as Record<string, string>;

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    dispatch({ type: 'CHANGE_CLICKED_ELEMENT', payload: { elementDetails: element } });
  }

  function handleBlur() {
    const text = spanRef.current?.innerText ?? '';
    dispatch({
      type: 'UPDATE_ELEMENT',
      payload: { elementDetails: { ...element, content: { ...content, innerText: text } } },
    });
  }

  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData('moveElementId', element.id);
  }

  if (previewMode || liveMode) {
    return <span style={element.styles}>{content.innerText}</span>;
  }

  return (
    <div
      className={`editor-el ${isSelected ? 'is-selected' : ''}`}
      onClick={handleClick}
      draggable
      onDragStart={handleDragStart}
    >
      {isSelected && <span className="editor-badge-select">{element.name}</span>}
      <span
        ref={spanRef}
        contentEditable={isSelected && !previewMode}
        suppressContentEditableWarning
        onBlur={handleBlur}
        style={element.styles}
      >
        {content.innerText}
      </span>
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
