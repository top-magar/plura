'use client';

import React from 'react';
import { Trash } from 'lucide-react';
import { useEditor } from '../editor-provider';
import { makeElement } from '../element-factory';
import Recursive from '../recursive';
import type { EditorElement } from '../types';

export default function Container({ element }: { element: EditorElement }) {
  const { state, dispatch } = useEditor();
  const { previewMode, liveMode, selectedElement } = state.editor;
  const isSelected = selectedElement?.id === element.id;
  const isBody = element.type === '__body';
  const children = Array.isArray(element.content) ? element.content : [];

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    dispatch({ type: 'CHANGE_CLICKED_ELEMENT', payload: { elementDetails: element } });
  }

  function handleDrop(e: React.DragEvent) {
    e.stopPropagation();
    e.preventDefault();
    const componentType = e.dataTransfer.getData('componentType');
    const moveId = e.dataTransfer.getData('moveElementId');

    if (componentType) {
      const newEl = makeElement(componentType);
      if (newEl) {
        dispatch({ type: 'ADD_ELEMENT', payload: { containerId: element.id, elementDetails: newEl } });
      }
    } else if (moveId) {
      // Move is handled as delete + add — find the element in tree first
      const found = findElement(state.editor.elements, moveId);
      if (found) {
        dispatch({ type: 'DELETE_ELEMENT', payload: { elementDetails: found } });
        dispatch({ type: 'ADD_ELEMENT', payload: { containerId: element.id, elementDetails: found } });
      }
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDragStart(e: React.DragEvent) {
    if (isBody) return;
    e.dataTransfer.setData('moveElementId', element.id);
  }

  if (previewMode || liveMode) {
    return (
      <div style={element.styles}>
        {children.map((child) => (
          <Recursive key={child.id} element={child} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`relative outline-1 outline-dashed outline-transparent transition-[outline-color] duration-100 hover:outline-primary ${isSelected ? 'outline-2 outline-solid outline-primary' : ''} ${isBody ? 'min-h-full p-4' : ''}`}
      style={element.styles}
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      draggable={!isBody}
      onDragStart={handleDragStart}
    >
      {isSelected && !isBody && <span className="absolute -top-5 left-0 text-[10px] px-1.5 py-px bg-primary text-primary-foreground z-10 pointer-events-none whitespace-nowrap">{element.name}</span>}
      {children.length === 0 && !isBody && (
        <div className="flex items-center justify-center min-h-[60px] border-2 border-dashed border-border text-muted-foreground text-xs">Drop here</div>
      )}
      {children.map((child) => (
        <Recursive key={child.id} element={child} />
      ))}
      {isSelected && !isBody && (
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

function findElement(elements: EditorElement[], id: string): EditorElement | null {
  for (const el of elements) {
    if (el.id === id) return el;
    if (Array.isArray(el.content)) {
      const found = findElement(el.content, id);
      if (found) return found;
    }
  }
  return null;
}
