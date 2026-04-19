'use client';

import React from 'react';
import { useEditor } from '../editor-provider';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
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
          className={`mt-[97px] w-80 z-[40] shadow-none p-0 mr-16 bg-background h-full transition-all overflow-hidden ${state.editor.previewMode ? 'hidden' : ''}`}
        >
          <div className="grid gap-4 h-full pb-36 overflow-scroll">
            <TabsContent value="Settings">
              <SheetHeader className="text-left p-6">
                <SheetTitle>Styles</SheetTitle>
                <SheetDescription>
                  Show your creativity! You can customize every component as you like.
                </SheetDescription>
              </SheetHeader>
              <SettingsTab />
            </TabsContent>
            <TabsContent value="Components">
              <SheetHeader className="text-left p-6">
                <SheetTitle>Components</SheetTitle>
                <SheetDescription>
                  Drag and drop components onto the canvas.
                </SheetDescription>
              </SheetHeader>
              <ComponentsTab />
            </TabsContent>
            <TabsContent value="Layers">
              <SheetHeader className="text-left p-6">
                <SheetTitle>Layers</SheetTitle>
                <SheetDescription>
                  View the editor layers.
                </SheetDescription>
              </SheetHeader>
              <LayersTab />
            </TabsContent>
            <TabsContent value="Media">
              <SheetHeader className="text-left p-6">
                <SheetTitle>Media</SheetTitle>
                <SheetDescription>
                  Media bucket coming soon.
                </SheetDescription>
              </SheetHeader>
            </TabsContent>
          </div>
        </SheetContent>
      </Tabs>
    </Sheet>
  );
}
