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
              className="w-12 shrink-0 h-full border-l flex items-start justify-center pt-3 bg-background text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              onClick={() => setOpen(true)}
            >
              <PanelRightOpen size={18} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">Open properties</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="w-80 shrink-0 h-full border-l bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
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
          className="p-1 rounded-md hover:bg-accent text-muted-foreground shrink-0"
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
