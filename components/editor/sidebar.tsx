"use client";

import { Columns2, Columns3, Contact, CreditCard, Image, Layout, Link2, Minus, Type, Video } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEditor } from "./provider";
import type { EditorElement } from "./types";

const components = [
  { type: "text", label: "Text", icon: Type },
  { type: "link", label: "Link", icon: Link2 },
  { type: "image", label: "Image", icon: Image },
  { type: "video", label: "Video", icon: Video },
  { type: "container", label: "Container", icon: Layout },
  { type: "2Col", label: "2 Columns", icon: Columns2 },
  { type: "3Col", label: "3 Columns", icon: Columns3 },
  { type: "contactForm", label: "Contact Form", icon: Contact },
];

function ComponentItem({ type, label, icon: Icon }: { type: string; label: string; icon: typeof Type }) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("componentType", type);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="flex cursor-grab items-center gap-2.5 rounded-md border px-3 py-2 text-[12px] transition-colors hover:bg-muted active:cursor-grabbing"
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      {label}
    </div>
  );
}

function LayerItem({ element, depth = 0 }: { element: EditorElement; depth?: number }) {
  const { state, dispatch } = useEditor();
  const isSelected = state.editor.selectedElement?.id === element.id;
  const children = Array.isArray(element.content) ? element.content : [];

  return (
    <div>
      <button
        onClick={() => dispatch({ type: "SELECT_ELEMENT", payload: { element } })}
        className={`flex w-full items-center gap-1.5 rounded px-2 py-1 text-[11px] transition-colors hover:bg-muted ${isSelected ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"}`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {children.length > 0 ? <Minus className="h-3 w-3" /> : <div className="w-3" />}
        {element.name}
      </button>
      {children.map((child) => (
        <LayerItem key={child.id} element={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function EditorSidebar() {
  const { state } = useEditor();
  const body = state.editor.elements[0];

  if (state.editor.previewMode) return null;

  return (
    <div className="flex h-full w-[240px] shrink-0 flex-col border-r bg-background">
      <Tabs defaultValue="components" className="flex h-full flex-col">
        <TabsList className="mx-2 mt-2">
          <TabsTrigger value="components" className="text-[11px]">Components</TabsTrigger>
          <TabsTrigger value="layers" className="text-[11px]">Layers</TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="flex-1 overflow-hidden mt-0">
          <ScrollArea className="h-full p-2">
            <p className="mb-2 px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Elements</p>
            <div className="space-y-1">
              {components.slice(0, 4).map((c) => (
                <ComponentItem key={c.type} {...c} />
              ))}
            </div>
            <p className="mb-2 mt-4 px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Layout</p>
            <div className="space-y-1">
              {components.slice(4, 7).map((c) => (
                <ComponentItem key={c.type} {...c} />
              ))}
            </div>
            <p className="mb-2 mt-4 px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Forms</p>
            <div className="space-y-1">
              {components.slice(7).map((c) => (
                <ComponentItem key={c.type} {...c} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="layers" className="flex-1 overflow-hidden mt-0">
          <ScrollArea className="h-full p-2">
            {body && <LayerItem element={body} />}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
