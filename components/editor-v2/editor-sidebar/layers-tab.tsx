'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Box, Type, Link, Image, Video, Contact, CreditCard, Columns2, Columns3 } from 'lucide-react';
import { useEditor } from '../editor-provider';
import type { EditorElement } from '../types';

const typeIcons: Record<string, React.ElementType> = {
  __body: Box,
  container: Box,
  section: Box,
  '2Col': Columns2,
  '3Col': Columns3,
  text: Type,
  link: Link,
  button: Link,
  image: Image,
  video: Video,
  contactForm: Contact,
  paymentForm: CreditCard,
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
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
          paddingLeft: `${depth * 16 + 8}px`,
          cursor: 'pointer',
          fontSize: '13px',
          backgroundColor: isSelected ? 'var(--accent)' : 'transparent',
        }}
        onClick={(e) => {
          e.stopPropagation();
          dispatch({ type: 'CHANGE_CLICKED_ELEMENT', payload: { elementDetails: element } });
        }}
      >
        {isContainer && children.length > 0 ? (
          <button onClick={(e) => { e.stopPropagation(); setOpen(!open); }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}>
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span style={{ width: '14px' }} />
        )}
        <Icon size={14} />
        <span>{element.name}</span>
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
    <div className="p-3 overflow-y-auto flex-1">
      <LayerNode element={body} depth={0} />
    </div>
  );
}
