'use client';

import React, { useState } from 'react';
import { useEditor } from '../editor-provider';
import { SettingsIcon, X } from 'lucide-react';
import SettingsTab from './settings-tab';

export default function RightPanel() {
  const { state } = useEditor();
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <button
        className="w-12 shrink-0 h-full border-l border-border bg-background flex items-start justify-center pt-4 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
        onClick={() => setOpen(true)}
        title="Open properties"
      >
        <SettingsIcon size={18} />
      </button>
    );
  }

  const hasSelection = state.editor.selectedElement.id !== '';

  return (
    <div className="w-80 shrink-0 h-full border-l border-border bg-background overflow-y-auto overflow-x-hidden">
      <div className="flex items-center justify-between p-4 pb-2">
        <div>
          <h3 className="font-medium text-sm">
            {hasSelection ? state.editor.selectedElement.name || 'Element' : 'Styles'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {hasSelection ? state.editor.selectedElement.type : 'Select an element to edit'}
          </p>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="p-1 rounded hover:bg-muted text-muted-foreground"
        >
          <X size={14} />
        </button>
      </div>
      <SettingsTab />
    </div>
  );
}
