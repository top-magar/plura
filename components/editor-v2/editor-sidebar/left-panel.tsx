'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, SquareStackIcon } from 'lucide-react';
import ComponentsTab from './components-tab';
import LayersTab from './layers-tab';

export default function LeftPanel() {
  const [activeTab, setActiveTab] = useState<string | null>('Components');

  function handleTabClick(value: string) {
    setActiveTab((prev) => (prev === value ? null : value));
  }

  return (
    <Tabs value={activeTab ?? ''} className="editor-left-panel">
      {/* Icon rail */}
      <div className="editor-left-icons">
        <TabsList className="flex flex-col items-center bg-transparent w-full h-auto gap-4 p-0">
          <TabsTrigger
            value="Components"
            className={`w-10 h-10 p-0 ${activeTab === 'Components' ? 'bg-muted' : ''}`}
            onClick={() => handleTabClick('Components')}
          >
            <Plus size={18} />
          </TabsTrigger>
          <TabsTrigger
            value="Layers"
            className={`w-10 h-10 p-0 ${activeTab === 'Layers' ? 'bg-muted' : ''}`}
            onClick={() => handleTabClick('Layers')}
          >
            <SquareStackIcon size={18} />
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Flyout content */}
      <div className="editor-left-content" style={{ width: activeTab ? 280 : 0 }}>
        {activeTab === 'Components' && (
          <TabsContent value="Components" className="mt-0" forceMount>
            <div className="p-4 pb-2">
              <h3 className="font-medium text-sm">Components</h3>
              <p className="text-xs text-muted-foreground">Drag onto the canvas</p>
            </div>
            <ComponentsTab />
          </TabsContent>
        )}
        {activeTab === 'Layers' && (
          <TabsContent value="Layers" className="mt-0" forceMount>
            <div className="p-4 pb-2">
              <h3 className="font-medium text-sm">Layers</h3>
              <p className="text-xs text-muted-foreground">Element tree</p>
            </div>
            <LayersTab />
          </TabsContent>
        )}
      </div>
    </Tabs>
  );
}
