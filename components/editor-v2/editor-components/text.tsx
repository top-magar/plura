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
      className={`relative outline-1 outline-dashed outline-transparent transition-[outline-color] duration-100 hover:outline-primary ${isSelected ? 'outline-2 outline-solid outline-primary' : ''}`}
      onClick={handleClick}
      draggable
      onDragStart={handleDragStart}
    >
      {isSelected && <span className="absolute -top-5 left-0 text-[10px] px-1.5 py-px bg-primary text-primary-foreground z-10 pointer-events-none whitespace-nowrap">{element.name}</span>}
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
