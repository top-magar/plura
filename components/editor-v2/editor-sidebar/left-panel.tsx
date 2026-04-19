'use client';

import React, { useState } from 'react';
import { Plus, Layers } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import ComponentsTab from './components-tab';
import LayersTab from './layers-tab';

const tabs = [
  { id: 'components', icon: Plus, label: 'Components' },
  { id: 'layers', icon: Layers, label: 'Layers' },
] as const;

type TabId = (typeof tabs)[number]['id'];

export default function LeftPanel() {
  const [active, setActive] = useState<TabId | null>('components');

  const toggle = (id: TabId) => setActive((prev) => (prev === id ? null : id));

  return (
    <div className="flex shrink-0 h-full">
      {/* Icon rail */}
      <TooltipProvider delayDuration={0}>
        <div className="w-12 shrink-0 border-r border-sidebar-border pt-3 flex flex-col items-center gap-1 bg-sidebar">
          {tabs.map((t) => (
            <Tooltip key={t.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => toggle(t.id)}
                  className={cn(
                    'flex items-center justify-center size-8 rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors',
                    active === t.id && 'bg-sidebar-accent text-sidebar-foreground'
                  )}
                >
                  <t.icon size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">{t.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      {/* Flyout */}
      <div
        className="shrink-0 overflow-y-auto overflow-x-hidden border-r border-sidebar-border transition-[width] duration-200 bg-sidebar"
        style={{ width: active ? 256 : 0 }}
      >
        {active === 'components' && (
          <div className="w-64">
            <div className="p-4 pb-2">
              <h3 className="font-medium text-sm">Components</h3>
              <p className="text-xs text-muted-foreground">Drag onto the canvas</p>
            </div>
            <ComponentsTab />
          </div>
        )}
        {active === 'layers' && (
          <div className="w-64">
            <div className="p-4 pb-2">
              <h3 className="font-medium text-sm">Layers</h3>
              <p className="text-xs text-muted-foreground">Element tree</p>
            </div>
            <LayersTab />
          </div>
        )}
      </div>
    </div>
  );
}
