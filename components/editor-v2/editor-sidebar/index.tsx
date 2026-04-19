'use client';

import React from 'react';
import { useEditor } from '../editor-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Plus, SettingsIcon, SquareStackIcon } from 'lucide-react';
import ComponentsTab from './components-tab';
import LayersTab from './layers-tab';
import SettingsTab from './settings-tab';

export default function EditorSidebar() {
  const { state } = useEditor();

  if (state.editor.previewMode) return null;

  return (
    <Tabs defaultValue="Settings" className="editor-sidebar-root">
      {/* Icon strip */}
      <div className="editor-sidebar-icons">
        <TabsList className="flex flex-col items-center bg-transparent w-full h-auto gap-4 p-0">
          <TabsTrigger value="Settings" className="w-10 h-10 p-0 data-[state=active]:bg-muted">
            <SettingsIcon size={18} />
          </TabsTrigger>
          <TabsTrigger value="Components" className="w-10 h-10 p-0 data-[state=active]:bg-muted">
            <Plus size={18} />
          </TabsTrigger>
          <TabsTrigger value="Layers" className="w-10 h-10 p-0 data-[state=active]:bg-muted">
            <SquareStackIcon size={18} />
          </TabsTrigger>
          <TabsTrigger value="Media" className="w-10 h-10 p-0 data-[state=active]:bg-muted">
            <Database size={18} />
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Content panel */}
      <div className="editor-sidebar-content">
        <TabsContent value="Settings" className="mt-0 h-full">
          <div className="p-6 pb-2">
            <h3 className="font-medium">Styles</h3>
            <p className="text-sm text-muted-foreground">
              Show your creativity! You can customize every component as you like.
            </p>
          </div>
          <SettingsTab />
        </TabsContent>
        <TabsContent value="Components" className="mt-0 h-full">
          <div className="p-6 pb-2">
            <h3 className="font-medium">Components</h3>
            <p className="text-sm text-muted-foreground">
              Drag and drop components onto the canvas.
            </p>
          </div>
          <ComponentsTab />
        </TabsContent>
        <TabsContent value="Layers" className="mt-0 h-full">
          <div className="p-6 pb-2">
            <h3 className="font-medium">Layers</h3>
            <p className="text-sm text-muted-foreground">
              View the editor layers.
            </p>
          </div>
          <LayersTab />
        </TabsContent>
        <TabsContent value="Media" className="mt-0 h-full">
          <div className="p-6 pb-2">
            <h3 className="font-medium">Media</h3>
            <p className="text-sm text-muted-foreground">
              Media bucket coming soon.
            </p>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}
