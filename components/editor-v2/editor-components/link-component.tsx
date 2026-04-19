'use client';

import React from 'react';
import { useEditor } from '../editor-provider';
import ElementWrapper from './element-wrapper';
import type { EditorElement } from '../types';

export default function LinkComponent({ element }: { element: EditorElement }) {
  const { state } = useEditor();
  const content = element.content as Record<string, string>;
  const editing = !state.editor.previewMode && !state.editor.liveMode;

  return (
    <ElementWrapper element={element}>
      {editing ? (
        <span style={element.styles}>{content.innerText}</span>
      ) : (
        <a href={content.href} style={element.styles}>{content.innerText}</a>
      )}
    </ElementWrapper>
  );
}
