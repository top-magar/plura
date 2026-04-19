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
        <div className="w-12 shrink-0 border-r pt-3 flex flex-col items-center gap-1 bg-background">
          {tabs.map((t) => (
            <Tooltip key={t.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => toggle(t.id)}
                  className={cn(
                    'flex items-center justify-center size-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors',
                    active === t.id && 'bg-accent text-foreground'
                  )}
                >
                  <t.icon size={18} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">{t.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      {/* Flyout */}
      <div
        className="shrink-0 overflow-y-auto overflow-x-hidden border-r transition-[width] duration-200 bg-background"
        style={{ width: active ? 280 : 0 }}
      >
        {active === 'components' && (
          <div className="w-[280px]">
            <div className="p-4 pb-2">
              <h3 className="font-medium text-sm">Components</h3>
              <p className="text-xs text-muted-foreground">Drag onto the canvas</p>
            </div>
            <ComponentsTab />
          </div>
        )}
        {active === 'layers' && (
          <div className="w-[280px]">
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
