'use client';

import React, { useRef } from 'react';
import { useEditor } from '../editor-provider';
import ElementWrapper from './element-wrapper';
import type { EditorElement } from '../types';

export default function TextComponent({ element }: { element: EditorElement }) {
  const { state, dispatch } = useEditor();
  const spanRef = useRef<HTMLSpanElement>(null);
  const content = element.content as Record<string, string>;
  const isSelected = state.editor.selectedElement?.id === element.id;

  function handleBlur() {
    const text = spanRef.current?.innerText ?? '';
    dispatch({
      type: 'UPDATE_ELEMENT',
      payload: { elementDetails: { ...element, content: { ...content, innerText: text } } },
    });
  }

  return (
    <ElementWrapper element={element}>
      <span
        ref={spanRef}
        contentEditable={isSelected && !state.editor.previewMode}
        suppressContentEditableWarning
        onBlur={handleBlur}
        style={element.styles}
      >
        {content.innerText}
      </span>
    </ElementWrapper>
  );
}
