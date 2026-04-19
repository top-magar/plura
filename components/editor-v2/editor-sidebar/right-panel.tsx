'use client';

import React, { useState } from 'react';
import { useEditor } from '../editor-provider';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import SettingsTab from './settings-tab';

export default function RightPanel() {
  const { state } = useEditor();
  const [open, setOpen] = useState(true);
  const el = state.editor.selectedElement;
  const hasSelection = el.id !== '';

  if (!open) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="w-12 shrink-0 h-full border-l border-sidebar-border flex items-start justify-center pt-3 bg-sidebar text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors cursor-pointer"
              onClick={() => setOpen(true)}
            >
              <PanelRightOpen size={16} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">Open properties</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="w-64 shrink-0 h-full border-l border-sidebar-border bg-sidebar flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border shrink-0">
        <div className="min-w-0">
          <h3 className="font-medium text-sm truncate">
            {hasSelection ? el.name || el.type : 'Properties'}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {hasSelection ? el.type : 'Select an element'}
          </p>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="p-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground/60 shrink-0"
        >
          <PanelRightClose size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <SettingsTab />
      </div>
    </div>
  );
}
