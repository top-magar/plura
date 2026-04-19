'use client';

import React from 'react';
import { useEditor } from '../editor-provider';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ComponentsTab from './components-tab';
import LayersTab from './layers-tab';
import SettingsTab from './settings-tab';

export default function EditorSidebar() {
  const { state } = useEditor();

  return (
    <Sheet open={true} modal={false}>
      <SheetContent
        side="right"
        className={`z-[40] w-[380px] shadow-none p-0 transition-all ${state.editor.previewMode ? 'hidden' : ''}`}
      >
        <SheetTitle className="sr-only">Editor Sidebar</SheetTitle>
        <Tabs defaultValue="components" className="h-full flex flex-col">
          <TabsList className="w-full grid grid-cols-3 rounded-none h-10 bg-transparent border-b">
            <TabsTrigger value="components" className="text-xs rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary">Components</TabsTrigger>
            <TabsTrigger value="layers" className="text-xs rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary">Layers</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="components" className="flex-1 overflow-auto mt-0 p-0">
            <ComponentsTab />
          </TabsContent>
          <TabsContent value="layers" className="flex-1 overflow-auto mt-0 p-0">
            <LayersTab />
          </TabsContent>
          <TabsContent value="settings" className="flex-1 overflow-auto mt-0 p-0">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
