'use client';

import React, { useState } from 'react';
import { useEditor } from '../editor-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Plus, SettingsIcon, SquareStackIcon } from 'lucide-react';
import ComponentsTab from './components-tab';
import LayersTab from './layers-tab';
import SettingsTab from './settings-tab';

export default function EditorSidebar() {
  const { state } = useEditor();
  const [activeTab, setActiveTab] = useState<string | null>('Settings');

  if (state.editor.previewMode) return null;

  function handleTabClick(value: string) {
    setActiveTab((prev) => (prev === value ? null : value));
  }

  return (
    <Tabs value={activeTab ?? ''} className="editor-sidebar-root">
      {/* Content panel — collapses to 0 width */}
      <div
        className="editor-sidebar-content"
        style={{ width: activeTab ? 320 : 0 }}
      >
        {activeTab && (
          <>
            <TabsContent value="Settings" className="mt-0" forceMount={activeTab === 'Settings' ? true : undefined}>
              {activeTab === 'Settings' && (
                <>
                  <div className="p-6 pb-2">
                    <h3 className="font-medium">Styles</h3>
                    <p className="text-sm text-muted-foreground">
                      Show your creativity! You can customize every component as you like.
                    </p>
                  </div>
                  <SettingsTab />
                </>
              )}
            </TabsContent>
            <TabsContent value="Components" className="mt-0" forceMount={activeTab === 'Components' ? true : undefined}>
              {activeTab === 'Components' && (
                <>
                  <div className="p-6 pb-2">
                    <h3 className="font-medium">Components</h3>
                    <p className="text-sm text-muted-foreground">
                      Drag and drop components onto the canvas.
                    </p>
                  </div>
                  <ComponentsTab />
                </>
              )}
            </TabsContent>
            <TabsContent value="Layers" className="mt-0" forceMount={activeTab === 'Layers' ? true : undefined}>
              {activeTab === 'Layers' && (
                <>
                  <div className="p-6 pb-2">
                    <h3 className="font-medium">Layers</h3>
                    <p className="text-sm text-muted-foreground">
                      View the editor layers.
                    </p>
                  </div>
                  <LayersTab />
                </>
              )}
            </TabsContent>
            <TabsContent value="Media" className="mt-0" forceMount={activeTab === 'Media' ? true : undefined}>
              {activeTab === 'Media' && (
                <div className="p-6 pb-2">
                  <h3 className="font-medium">Media</h3>
                  <p className="text-sm text-muted-foreground">
                    Media bucket coming soon.
                  </p>
                </div>
              )}
            </TabsContent>
          </>
        )}
      </div>

      {/* Icon rail — always visible */}
      <div className="editor-sidebar-icons">
        <TabsList className="flex flex-col items-center bg-transparent w-full h-auto gap-4 p-0">
          {([
            { value: 'Settings', icon: SettingsIcon },
            { value: 'Components', icon: Plus },
            { value: 'Layers', icon: SquareStackIcon },
            { value: 'Media', icon: Database },
          ] as const).map(({ value, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className={`w-10 h-10 p-0 ${activeTab === value ? 'bg-muted' : ''}`}
              onClick={() => handleTabClick(value)}
            >
              <Icon size={18} />
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  );
}
