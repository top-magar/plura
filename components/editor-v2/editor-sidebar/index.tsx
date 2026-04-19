'use client';

import React from 'react';
import { useEditor } from '../editor-provider';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Plus, SettingsIcon, SquareStackIcon } from 'lucide-react';
import ComponentsTab from './components-tab';
import LayersTab from './layers-tab';
import SettingsTab from './settings-tab';

export default function EditorSidebar() {
  const { state } = useEditor();

  return (
    <Sheet open={true} modal={false}>
      <Tabs className="w-full" defaultValue="Settings">
        <SheetContent
          
          side="right"
          className={`mt-[97px] w-16 z-[80] shadow-none p-0 focus:border-none transition-all overflow-hidden ${state.editor.previewMode ? 'hidden' : ''}`}
        >
          <SheetTitle className="sr-only">Editor Sidebar</SheetTitle>
          <TabsList className="flex items-center flex-col justify-evenly w-full bg-transparent h-fit gap-4">
            <TabsTrigger value="Settings" className="w-10 h-10 p-0 data-[state=active]:bg-muted">
              <SettingsIcon />
            </TabsTrigger>
            <TabsTrigger value="Components" className="data-[state=active]:bg-muted w-10 h-10 p-0">
              <Plus />
            </TabsTrigger>
            <TabsTrigger value="Layers" className="w-10 h-10 p-0 data-[state=active]:bg-muted">
              <SquareStackIcon />
            </TabsTrigger>
            <TabsTrigger value="Media" className="w-10 h-10 p-0 data-[state=active]:bg-muted">
              <Database />
            </TabsTrigger>
          </TabsList>
        </SheetContent>

        <SheetContent
          
          side="right"
          className={`mt-[97px] w-80 z-[40] mr-16 shadow-none p-0 focus:border-none transition-all overflow-hidden ${state.editor.previewMode ? 'hidden' : ''}`}
        >
          <SheetTitle className="sr-only">Sidebar Content</SheetTitle>
          <div className="h-full overflow-auto px-4 py-4">
            <TabsContent value="Settings" className="mt-0">
              <SettingsTab />
            </TabsContent>
            <TabsContent value="Components" className="mt-0">
              <ComponentsTab />
            </TabsContent>
            <TabsContent value="Layers" className="mt-0">
              <LayersTab />
            </TabsContent>
            <TabsContent value="Media" className="mt-0">
              <div className="text-sm text-muted-foreground text-center py-8">
                Media bucket coming soon
              </div>
            </TabsContent>
          </div>
        </SheetContent>
      </Tabs>
    </Sheet>
  );
}
