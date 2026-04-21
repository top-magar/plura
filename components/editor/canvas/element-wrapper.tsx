'use client';

import { useRef, type CSSProperties, type ReactNode } from 'react';
import { useDocumentStore } from '../core/document-store';
import { useEditorStore } from '../core/editor-store';
import { useEditor } from '../core/provider';
import { ContextMenu, ContextMenuTrigger } from '@/components/ui/context-menu';
import { cn } from '@/lib/utils';
import type { El } from '../core/types';
import { resolveStyles } from '../core/types';
import { findParentId } from '../core/tree-helpers';
import { isContainer } from '../core/registry';
import { splitContentStyles } from './interactions/use-style-split';
import { BoxHandlesOverlay } from './interactions/box-handles-overlay';
import { ElementContextMenu } from './interactions/context-menu';
import { ResizeHandles } from './handles/resize-handles';
import { FontSizeHandle } from './handles/font-size-handle';

const TEXT_TYPES = new Set(['text', 'heading', 'subheading', 'quote', 'code', 'badge', 'list']);

type Props = { element: El; children: ReactNode; className?: string; style?: CSSProperties; containerEl?: boolean };

export default function ElementWrapper({ element, children, className, style, containerEl }: Props) {
  const { dispatch } = useEditor();
  const selected = useEditorStore(s => s.selected);
  const preview = useEditorStore(s => s.preview);
  const hovered = useEditorStore(s => s.hovered);
  const dropTarget = useEditorStore(s => s.dropTarget);
  const device = useEditorStore(s => s.device);
  const elements = useDocumentStore(s => s.elements);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const isBody = element.type === '__body';
  const isSel = selected?.id === element.id;
  const isHov = hovered === element.id && !isSel;
  const isDrop = dropTarget === element.id && containerEl;
  const parentId = findParentId(elements, element.id);
  const resolved = style ?? resolveStyles(element, device);

  const { wrapperStyles, contentStyles, hasContentStyles } = splitContentStyles(resolved);

  if (element.hidden && preview) return null;
  if (element.hidden && !preview) return <div className="relative opacity-20 pointer-events-none" style={resolved}>{children}</div>;
  if (preview) return <div style={resolved} className={className}>{children}</div>;

  return (
    <ContextMenu>
    <ContextMenuTrigger disabled={isBody} asChild>
    <div
      ref={wrapperRef}
      data-wrapper
      className={cn(
        'relative group/el min-w-0',
        isSel && !isBody && 'ring-2 ring-inset ring-primary',
        isHov && !isBody && 'ring-1 ring-inset ring-primary/25',
        isDrop && 'ring-2 ring-primary/50 bg-primary/[0.03]',
        isBody && 'min-h-full',
        className,
      )}
      style={wrapperStyles as CSSProperties}
      onClick={(e) => { e.stopPropagation(); dispatch({ type: 'CHANGE_CLICKED_ELEMENT', payload: { element } }); }}
      onDragOver={(e) => { e.preventDefault(); }}
      onMouseEnter={() => dispatch({ type: 'SET_HOVERED', payload: { id: element.id } })}
      onMouseLeave={() => { if (hovered === element.id) dispatch({ type: 'SET_HOVERED', payload: { id: null } }); }}
    >
      {!isBody && <BoxHandlesOverlay element={element} isSel={isSel} isHov={isHov} dispatch={dispatch} />}

      {isSel && !isBody && !element.locked && (<>
        {!isContainer(element.type) && <ResizeHandles element={element} wrapperRef={wrapperRef} dispatch={dispatch} />}
        {TEXT_TYPES.has(element.type) && <FontSizeHandle element={element} dispatch={dispatch} />}
      </>)}

      {hasContentStyles ? <div style={contentStyles as CSSProperties}>{children}</div> : children}
    </div>
    </ContextMenuTrigger>
    {!isBody && <ElementContextMenu element={element} parentId={parentId} dispatch={dispatch} />}
    </ContextMenu>
  );
}
