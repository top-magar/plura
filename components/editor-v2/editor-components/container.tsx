'use client';

import React from 'react';
import { useEditor } from '../editor-provider';
import { makeElement } from '../element-factory';
import Recursive from '../recursive';
import ElementWrapper from './element-wrapper';
import type { EditorElement } from '../types';

export default function Container({ element }: { element: EditorElement }) {
  const { state, dispatch } = useEditor();
  const children = Array.isArray(element.content) ? element.content : [];

  function handleDrop(e: React.DragEvent) {
    e.stopPropagation();
    e.preventDefault();
    const componentType = e.dataTransfer.getData('componentType');
    const moveId = e.dataTransfer.getData('moveElementId');

    if (componentType) {
      const newEl = makeElement(componentType);
      if (newEl) dispatch({ type: 'ADD_ELEMENT', payload: { containerId: element.id, elementDetails: newEl } });
    } else if (moveId) {
      const found = findElement(state.editor.elements, moveId);
      if (found) {
        dispatch({ type: 'DELETE_ELEMENT', payload: { elementDetails: found } });
        dispatch({ type: 'ADD_ELEMENT', payload: { containerId: element.id, elementDetails: found } });
      }
    }
  }

  return (
    <ElementWrapper element={element} style={element.styles}>
      <div onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}>
        {children.length === 0 && element.type !== '__body' && (
          <div className="flex items-center justify-center min-h-[48px] border border-dashed border-border/60 rounded-sm text-muted-foreground/50 text-[10px]">
            Drop here
          </div>
        )}
        {children.map((child) => <Recursive key={child.id} element={child} />)}
      </div>
    </ElementWrapper>
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
