'use client';

import React from 'react';
import { useEditor } from '../editor-provider';
import ElementWrapper from './element-wrapper';
import type { EditorElement } from '../types';

export default function VideoComponent({ element }: { element: EditorElement }) {
  const { state } = useEditor();
  const content = element.content as Record<string, string>;
  const editing = !state.editor.previewMode && !state.editor.liveMode;

  return (
    <ElementWrapper element={element}>
      <iframe
        src={content.src}
        style={{ ...element.styles, ...(editing && { pointerEvents: 'none' as const }) }}
        title={element.name}
        allowFullScreen
      />
    </ElementWrapper>
  );
}
