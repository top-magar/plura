'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ComponentsTab from './components-tab';
import LayersTab from './layers-tab';
import SettingsTab from './settings-tab';

export default function EditorSidebar() {
  return (
    <aside className="editor-sidebar">
      <Tabs defaultValue="components" orientation="horizontal" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <TabsList style={{ width: '100%', display: 'flex' }}>
          <TabsTrigger value="components" style={{ flex: 1 }}>Components</TabsTrigger>
          <TabsTrigger value="layers" style={{ flex: 1 }}>Layers</TabsTrigger>
          <TabsTrigger value="settings" style={{ flex: 1 }}>Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="components" style={{ flex: 1, overflow: 'auto' }}>
          <ComponentsTab />
        </TabsContent>
        <TabsContent value="layers" style={{ flex: 1, overflow: 'auto' }}>
          <LayersTab />
        </TabsContent>
        <TabsContent value="settings" style={{ flex: 1, overflow: 'auto' }}>
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
