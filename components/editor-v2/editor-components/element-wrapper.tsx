'use client';

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useEditor } from '../editor-provider';
import { cn } from '@/lib/utils';
import type { EditorElement } from '../types';

interface Props {
  element: EditorElement;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function ElementWrapper({ element, children, className, style }: Props) {
  const { state, dispatch } = useEditor();
  const [dragOver, setDragOver] = useState(false);
  const isSelected = state.editor.selectedElement?.id === element.id;
  const isBody = element.type === '__body';
  const editing = !state.editor.previewMode && !state.editor.liveMode;

  if (!editing) return <div style={style} className={className}>{children}</div>;

  return (
    <div
      className={cn(
        'relative group/el',
        !isBody && 'ring-1 ring-transparent hover:ring-primary/40 transition-shadow',
        isSelected && !isBody && 'ring-2 ring-primary',
        dragOver && 'ring-2 ring-primary/60 bg-primary/5',
        isBody && 'min-h-full p-3',
        className,
      )}
      style={style}
      onClick={(e) => { e.stopPropagation(); dispatch({ type: 'CHANGE_CLICKED_ELEMENT', payload: { elementDetails: element } }); }}
      draggable={!isBody}
      onDragStart={(e) => { if (!isBody) e.dataTransfer.setData('moveElementId', element.id); }}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { setDragOver(false); }}
    >
      {/* Badge */}
      {isSelected && !isBody && (
        <span className="absolute -top-4 left-1 text-[9px] leading-none px-1.5 py-0.5 rounded-sm bg-primary text-primary-foreground z-10 pointer-events-none">
          {element.name}
        </span>
      )}
      {children}
      {/* Delete */}
      {isSelected && !isBody && (
        <button
          className="absolute -top-4 right-1 size-4 rounded-sm bg-destructive text-white flex items-center justify-center z-10 opacity-0 group-hover/el:opacity-100 transition-opacity"
          onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DELETE_ELEMENT', payload: { elementDetails: element } }); }}
        >
          <Trash2 className="size-2.5" />
        </button>
      )}
    </div>
  );
}
