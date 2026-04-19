'use client';

import type { CSSProperties, ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import { useEditor } from './editor-provider';
import { cn } from '@/lib/utils';
import type { El, Device } from './types';
import { resolveStyles } from './types';

type Props = {
  element: El;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  isContainer?: boolean;
};

export default function ElementWrapper({ element, children, className, style, isContainer }: Props) {
  const { state, dispatch } = useEditor();
  const { selected, preview, hovered, dropTarget, device } = state.editor;

  const isBody = element.type === '__body';
  const isSel = selected?.id === element.id;
  const isHov = hovered === element.id && !isSel;
  const isDrop = dropTarget === element.id && isContainer;

  const resolved = style ?? resolveStyles(element, device);

  if (preview) {
    return <div style={resolved} className={className}>{children}</div>;
  }

  return (
    <div
      className={cn(
        'relative group/el',
        !isBody && 'ring-1 ring-transparent hover:ring-primary/40 transition-shadow',
        isSel && !isBody && 'ring-2 ring-primary',
        isHov && !isBody && 'ring-1 ring-primary/40',
        isDrop && 'ring-2 ring-primary/60 bg-primary/5',
        isBody && 'min-h-full p-3',
        className,
      )}
      style={resolved}
      onClick={(e) => { e.stopPropagation(); dispatch({ type: 'CHANGE_CLICKED_ELEMENT', payload: { element } }); }}
      draggable={!isBody}
      onDragStart={(e) => { if (isBody) return; e.stopPropagation(); e.dataTransfer.setData('moveElementId', element.id); }}
      onDragOver={(e) => { e.preventDefault(); }}
      onMouseEnter={() => dispatch({ type: 'SET_HOVERED', payload: { id: element.id } })}
      onMouseLeave={() => { if (hovered === element.id) dispatch({ type: 'SET_HOVERED', payload: { id: null } }); }}
    >
      {/* Select badge: name + delete */}
      {isSel && !isBody && (
        <span className="absolute -top-5 left-1 flex items-center gap-1 text-[9px] leading-none px-1.5 py-0.5 rounded-sm bg-primary text-primary-foreground z-10">
          <span className="pointer-events-none">{element.name}</span>
          <button
            className="ml-0.5 hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DELETE_ELEMENT', payload: { id: element.id } }); }}
          >
            <Trash2 className="size-2.5" />
          </button>
        </span>
      )}
      {/* Hover badge: just name */}
      {isHov && !isBody && (
        <span className="absolute -top-5 left-1 text-[9px] leading-none px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground z-10 pointer-events-none">
          {element.name}
        </span>
      )}
      {children}
    </div>
  );
}
