'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Box, Type, Link, Image, Video, Contact, CreditCard, Columns2, Columns3 } from 'lucide-react';
import { useEditor } from '../editor-provider';
import { cn } from '@/lib/utils';
import type { EditorElement } from '../types';

const typeIcons: Record<string, React.ElementType> = {
  __body: Box, container: Box, section: Box,
  '2Col': Columns2, '3Col': Columns3,
  text: Type, link: Link, button: Link,
  image: Image, video: Video,
  contactForm: Contact, paymentForm: CreditCard,
};

function LayerNode({ element, depth }: { element: EditorElement; depth: number }) {
  const { state, dispatch } = useEditor();
  const [open, setOpen] = useState(true);
  const isContainer = Array.isArray(element.content);
  const children = isContainer ? (element.content as EditorElement[]) : [];
  const isSelected = state.editor.selectedElement?.id === element.id;
  const Icon = typeIcons[element.type] || Box;

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-1 h-7 px-2 cursor-pointer text-xs hover:bg-sidebar-accent rounded-sm',
          isSelected && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={(e) => {
          e.stopPropagation();
          dispatch({ type: 'CHANGE_CLICKED_ELEMENT', payload: { elementDetails: element } });
        }}
      >
        {isContainer && children.length > 0 ? (
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
            className="p-0 bg-transparent border-none cursor-pointer flex shrink-0"
          >
            {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
          </button>
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        <Icon className="size-3.5 shrink-0 text-sidebar-foreground/60" />
        <span className="truncate">{element.name}</span>
      </div>
      {isContainer && open && children.map((child) => (
        <LayerNode key={child.id} element={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function LayersTab() {
  const { state } = useEditor();
  const body = state.editor.elements[0];
  if (!body) return null;

  return (
    <div className="px-1 pb-2 overflow-y-auto">
      <LayerNode element={body} depth={0} />
    </div>
  );
}
