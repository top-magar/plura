'use client';

import React from 'react';
import { useEditor } from '../editor-provider';
import ElementWrapper from './element-wrapper';
import type { EditorElement } from '../types';

export default function ContactFormComponent({ element }: { element: EditorElement }) {
  const { state } = useEditor();
  const editing = !state.editor.previewMode && !state.editor.liveMode;

  return (
    <ElementWrapper element={element}>
      <form style={element.styles} onSubmit={(e) => e.preventDefault()}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input type="text" placeholder="Name" disabled={editing} style={{ padding: '8px', border: '1px solid #ccc' }} />
          <input type="email" placeholder="Email" disabled={editing} style={{ padding: '8px', border: '1px solid #ccc' }} />
          <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer' }}>
            Submit
          </button>
        </div>
      </form>
    </ElementWrapper>
  );
}
