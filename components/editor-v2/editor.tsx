'use client';

import React, { useEffect, useCallback } from 'react';
import { EyeOff } from 'lucide-react';
import { useEditor } from './editor-provider';
import { upsertFunnelPage } from '@/lib/queries';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import EditorNavigation from './editor-navigation';
import { LeftPanel, RightPanel } from './editor-sidebar';
import Recursive from './recursive';

const DEVICE_WIDTHS = { Desktop: '100%', Tablet: '768px', Mobile: '420px' } as const;

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
    function onKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === 'z' && !e.shiftKey) { e.preventDefault(); dispatch({ type: 'UNDO' }); }
      if (mod && e.key === 'z' && e.shiftKey) { e.preventDefault(); dispatch({ type: 'REDO' }); }
      if (mod && e.key === 's') { e.preventDefault(); handleSave(); }
      if (e.key === 'Escape') dispatch({ type: 'CHANGE_CLICKED_ELEMENT', payload: {} });
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement.id && selectedElement.type !== '__body') {
        const t = e.target as HTMLElement;
        if (t.isContentEditable || t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') return;
        dispatch({ type: 'DELETE_ELEMENT', payload: { elementDetails: selectedElement } });
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [dispatch, handleSave, selectedElement]);

  const deselect = () => dispatch({ type: 'CHANGE_CLICKED_ELEMENT', payload: {} });

  return (
    <div className="fixed inset-0 z-20 bg-background flex flex-col">
      <EditorNavigation />

      {previewMode && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-[100] bg-background/80 backdrop-blur border shadow-sm"
          onClick={() => dispatch({ type: 'TOGGLE_PREVIEW_MODE' })}
        >
          <EyeOff size={16} />
        </Button>
      )}

      <div className="flex flex-1 overflow-hidden">
        {!previewMode && <LeftPanel />}

        {/* Canvas */}
        <div
          className="flex-1 overflow-auto bg-muted/50 p-4"
          style={{
            backgroundImage: 'radial-gradient(circle, hsl(var(--border) / 0.5) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
          onClick={deselect}
        >
          <div
            className="bg-background border rounded-sm min-h-full mx-auto transition-[width] duration-200 shadow-sm overflow-auto"
            style={{ width: previewMode ? '100%' : DEVICE_WIDTHS[device] }}
          >
            {body && <Recursive element={body} />}
          </div>
        </div>

        {!previewMode && <RightPanel />}
      </div>
    </div>
  );
}
