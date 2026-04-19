'use client';

import React, { useEffect, useCallback } from 'react';
import { EyeOff } from 'lucide-react';
import { useEditor } from './editor-provider';
import { upsertFunnelPage } from '@/lib/queries';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import EditorNavigation from './editor-navigation';
import EditorSidebar from './editor-sidebar';
import Recursive from './recursive';
import './editor.css';

const deviceWidths = { Desktop: '100%', Tablet: '768px', Mobile: '420px' } as const;

export default function Editor() {
  const { state, dispatch, funnelId, pageDetails } = useEditor();
  const { elements, device, previewMode, selectedElement } = state.editor;
  const body = elements[0];

  const handleSave = useCallback(async () => {
    try {
      await upsertFunnelPage({
        id: pageDetails.id,
        name: pageDetails.name,
        funnelId,
        order: pageDetails.order,
        content: JSON.stringify(elements),
      });
      toast.success('Saved');
    } catch {
      toast.error('Failed to save');
    }
  }, [elements, pageDetails, funnelId]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key === 'z' && !e.shiftKey) { e.preventDefault(); dispatch({ type: 'UNDO' }); }
      if (meta && e.key === 'z' && e.shiftKey) { e.preventDefault(); dispatch({ type: 'REDO' }); }
      if (meta && e.key === 's') { e.preventDefault(); handleSave(); }
      if (e.key === 'Escape') { dispatch({ type: 'CHANGE_CLICKED_ELEMENT', payload: {} }); }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement.id && selectedElement.type !== '__body') {
        const t = e.target as HTMLElement;
        if (t.isContentEditable || t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') return;
        dispatch({ type: 'DELETE_ELEMENT', payload: { elementDetails: selectedElement } });
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, handleSave, selectedElement]);

  return (
    <div className="fixed inset-0 z-[20] bg-background flex flex-col">
      <EditorNavigation />

      {previewMode && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-[100] bg-background border shadow-md"
          onClick={() => dispatch({ type: 'TOGGLE_PREVIEW_MODE' })}
        >
          <EyeOff size={16} />
        </Button>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <div
          className="editor-canvas flex-1 overflow-auto"
          onClick={() => dispatch({ type: 'CHANGE_CLICKED_ELEMENT', payload: {} })}
        >
          <div
            className="editor-canvas-inner mx-auto"
            style={{ width: previewMode ? '100%' : deviceWidths[device] }}
          >
            {body && <Recursive element={body} />}
          </div>
        </div>

        {/* Sidebar */}
        {!previewMode && <EditorSidebar />}
      </div>
    </div>
  );
}
