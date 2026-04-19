'use client';

import React, { useEffect, useCallback } from 'react';
import { useEditor } from './editor-provider';
import { upsertFunnelPage } from '@/lib/queries';
import { toast } from 'sonner';
import EditorNavigation from './editor-navigation';
import EditorSidebar from './editor-sidebar';
import Recursive from './recursive';
import './editor.css';

const deviceWidths = { Desktop: '100%', Tablet: '768px', Mobile: '420px' } as const;

export default function Editor() {
  const { state, dispatch, funnelId, pageDetails } = useEditor();
  const { elements, device, previewMode, liveMode } = state.editor;
  const body = elements[0];

  const handleSave = useCallback(async () => {
    try {
      const content = JSON.stringify(state.editor.elements);
      await upsertFunnelPage({
        id: pageDetails.id,
        name: pageDetails.name,
        funnelId,
        order: pageDetails.order,
        content,
      });
      toast.success('Saved');
    } catch {
      toast.error('Failed to save');
    }
  }, [state.editor.elements, pageDetails, funnelId]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;

      if (meta && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: 'UNDO' });
      }
      if (meta && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        dispatch({ type: 'REDO' });
      }
      if (meta && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Escape') {
        dispatch({ type: 'CHANGE_CLICKED_ELEMENT', payload: {} });
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && state.editor.selectedElement && !isEditing(e)) {
        dispatch({ type: 'DELETE_ELEMENT', payload: { elementDetails: state.editor.selectedElement } });
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, handleSave, state.editor.selectedElement]);

  function handleCanvasClick() {
    dispatch({ type: 'CHANGE_CLICKED_ELEMENT', payload: {} });
  }

  if (previewMode || liveMode) {
    return (
      <div className="editor-root">
        <button className="editor-preview-exit" onClick={() => dispatch({ type: 'TOGGLE_PREVIEW_MODE' })}>
          Exit Preview
        </button>
        <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
          {body && <Recursive element={body} />}
        </div>
      </div>
    );
  }

  return (
    <div className="editor-root">
      <EditorNavigation />
      <div className="editor-main">
        <EditorSidebar />
        <div className="editor-canvas" onClick={handleCanvasClick}>
          <div className="editor-canvas-inner" style={{ width: deviceWidths[device] }}>
            {body && <Recursive element={body} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function isEditing(e: KeyboardEvent): boolean {
  const target = e.target as HTMLElement;
  return target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
}
