'use client';

import { useRef, type CSSProperties, type ReactNode } from 'react';
import { MIcon } from '../ui/m-icon';
import { useEditor } from '../core/provider';
import { findParentId } from '../core/tree-helpers';
import { useDragOverlay } from './drag-overlay';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger, ContextMenuShortcut } from '@/components/ui/context-menu';
import { cn } from '@/lib/utils';
import type { El } from '../core/types';
import { resolveStyles } from '../core/types';
import { parseBox, useHandles, BoxZone, BoxHandle, RadiusCorners } from './handles/index';
import { ResizeHandles } from './handles/resize-handles';
import { DimensionsBadge } from './handles/dimensions-badge';
import { FontSizeHandle } from './handles/font-size-handle';

const CONTAINER_TYPES = new Set(['__body', 'container', 'section', '2Col', '3Col', '4Col', 'row', 'column', 'grid', 'hero', 'footer', 'header', 'card', 'sidebar', 'modal', 'form']);
const TEXT_TYPES = new Set(['text', 'heading', 'subheading', 'quote', 'code', 'badge', 'list']);

// ─── Toolbar ────────────────────────────────────────────

function Toolbar({ element, dispatch, elements }: { element: El; dispatch: ReturnType<typeof useEditor>['dispatch']; elements: El[] }) {
  const parentId = findParentId(elements, element.id);
  const { start } = useDragOverlay();
  return (
    <div className="absolute -top-7 left-0 z-30 flex items-center gap-px rounded-md bg-primary text-primary-foreground shadow-md text-[9px] leading-none overflow-hidden origin-bottom-left" style={{ transform: 'scale(calc(1 / var(--zoom, 1)))' }} onClick={(e) => e.stopPropagation()}>
      <span className="flex items-center px-1 py-1 cursor-grab hover:bg-primary-foreground/10 active:cursor-grabbing" draggable onDragStart={(e) => { e.stopPropagation(); e.dataTransfer.setData('moveElementId', element.id); start(element.name, e); }}><MIcon name="drag_indicator" size={14} /></span>
      {element.locked && <MIcon name="lock" size={12} className="mx-0.5 text-amber-300" />}
      <span className="px-1 py-1 max-w-[80px] truncate pointer-events-none select-none">{element.name}</span>
      <span className="w-px h-3 bg-primary-foreground/20" />
      <button className="flex items-center px-1 py-1 hover:bg-primary-foreground/10" onClick={() => dispatch({ type: 'REORDER_ELEMENT', payload: { elId: element.id, direction: 'up' } })}><MIcon name="expand_less" size={14} /></button>
      <button className="flex items-center px-1 py-1 hover:bg-primary-foreground/10" onClick={() => dispatch({ type: 'REORDER_ELEMENT', payload: { elId: element.id, direction: 'down' } })}><MIcon name="expand_more" size={14} /></button>
      <span className="w-px h-3 bg-primary-foreground/20" />
      {parentId && <button className="flex items-center px-1 py-1 hover:bg-primary-foreground/10" onClick={() => dispatch({ type: 'DUPLICATE_ELEMENT', payload: { elId: element.id, containerId: parentId } })}><MIcon name="content_copy" size={12} /></button>}
      <button className="flex items-center px-1 py-1 hover:bg-destructive/80 hover:text-destructive-foreground" onClick={() => dispatch({ type: 'DELETE_ELEMENT', payload: { id: element.id } })}><MIcon name="delete" size={12} /></button>
    </div>
  );
}

// ─── Main Wrapper ───────────────────────────────────────

type Props = { element: El; children: ReactNode; className?: string; style?: CSSProperties; isContainer?: boolean };

export default function ElementWrapper({ element, children, className, style, isContainer }: Props) {
  const { state, dispatch } = useEditor();
  const { selected, preview, hovered, dropTarget, device } = state.editor;
  const elements = state.editor.elements;
  const wrapperRef = useRef<HTMLDivElement>(null);

  const isBody = element.type === '__body';
  const isSel = selected?.id === element.id;
  const isHov = hovered === element.id && !isSel;
  const isDrop = dropTarget === element.id && isContainer;
  const resolved = style ?? resolveStyles(element, device);
  const h = useHandles(dispatch);

  if (element.hidden && preview) return null;
  // Separate styles that would leak to handles/overlays
  // - Effects: filter, opacity, mixBlendMode, backdropFilter
  // - Inheriting text props: color, font*, text*, letterSpacing, lineHeight
  // - overflow: clips handles outside the element
  const contentKeys = [
    'filter', 'opacity', 'mixBlendMode', 'backdropFilter',
    'color', 'fontFamily', 'fontSize', 'fontWeight', 'fontStyle',
    'letterSpacing', 'lineHeight', 'textAlign', 'textDecoration', 'textTransform',
    'overflow',
  ] as const;
  const contentStyles: Record<string, unknown> = {};
  const wrapperStyles = { ...resolved } as Record<string, unknown>;
  for (const k of contentKeys) {
    if (wrapperStyles[k] !== undefined && wrapperStyles[k] !== '') {
      contentStyles[k] = wrapperStyles[k];
      delete wrapperStyles[k];
    }
  }
  const hasContentStyles = Object.keys(contentStyles).length > 0;

  if (element.hidden && !preview) return <div className="relative opacity-20 pointer-events-none" style={resolved}>{children}</div>;
  if (preview) return <div style={resolved} className={className}>{children}</div>;

  const s = element.styles;
  const [pt, pr, pb, pl] = parseBox(s, 'padding');
  const [mt, mr, mb, ml] = parseBox(s, 'margin');
  const parentId = findParentId(elements, element.id);

  return (
    <ContextMenu>
    <ContextMenuTrigger disabled={isBody} asChild>
    <div
      ref={wrapperRef}
      data-wrapper
      className={cn(
        'relative group/el min-w-0',
        !isBody && 'ring-1 ring-transparent transition-shadow duration-150',
        isSel && !isBody && 'ring-2 ring-primary',
        isHov && !isBody && 'ring-1 ring-primary/25',
        isDrop && 'ring-2 ring-primary/50 bg-primary/[0.03]',
        isBody && 'min-h-full p-3',
        className,
      )}
      style={wrapperStyles as React.CSSProperties}
      onClick={(e) => { e.stopPropagation(); dispatch({ type: 'CHANGE_CLICKED_ELEMENT', payload: { element } }); }}
      onDragOver={(e) => { e.preventDefault(); }}
      onMouseEnter={() => dispatch({ type: 'SET_HOVERED', payload: { id: element.id } })}
      onMouseLeave={() => { if (hovered === element.id) dispatch({ type: 'SET_HOVERED', payload: { id: null } }); }}
    >
      {isSel && !isBody && <Toolbar element={element} dispatch={dispatch} elements={elements} />}
      {/* ── Smart Handles (context-aware, priority-based) ──
        
        Priority chain (only show what's relevant):
        1. Locked → nothing
        2. Hover → name label + dimensions badge only (minimal)
        3. Selected → toolbar + selection ring + contextual handles:
           - Padding handles: only if element HAS padding (>0 on any side)
           - Margin handles: only if element HAS margin (>0 on any side)
           - Radius corners: always (can drag from 0)
           - Resize handles: leaf elements only (not containers)
           - Font size handle: text elements only
           - Dimensions badge: always
        4. Alt+hover on non-selected → padding zones visible
      */}

      {/* Hover state: just name + dims */}
      {isHov && !isBody && (
        <>
          <span className="absolute -top-4 left-1 text-[8px] leading-none px-1 py-0.5 rounded-sm bg-muted/80 text-muted-foreground/70 z-10 pointer-events-none origin-bottom-left" style={{ transform: 'scale(calc(1 / var(--zoom, 1)))' }}>{element.name}</span>
          <DimensionsBadge wrapperRef={wrapperRef} isSelected={false} />
        </>
      )}

      {/* Padding zones: show on hover only if padding exists (visual feedback, not interactive) */}
      {!isBody && !element.locked && isHov && (pt > 0 || pr > 0 || pb > 0 || pl > 0) && (
        <>
          {pt > 0 && <BoxZone id="p-T" val={pt} color="emerald" style={{ top: 0, left: 0, right: 0, height: pt }} h={h} />}
          {pr > 0 && <BoxZone id="p-R" val={pr} color="emerald" style={{ top: 0, right: 0, bottom: 0, width: pr }} h={h} />}
          {pb > 0 && <BoxZone id="p-B" val={pb} color="emerald" style={{ bottom: 0, left: 0, right: 0, height: pb }} h={h} />}
          {pl > 0 && <BoxZone id="p-L" val={pl} color="emerald" style={{ top: 0, left: 0, bottom: 0, width: pl }} h={h} />}
        </>
      )}

      {/* Selected state: full interactive handles */}
      {isSel && !isBody && !element.locked && (
        <>
          {/* Padding handles — always interactive (can drag from 0) */}
          <BoxHandle element={element} id="p-T" prop="paddingTop" val={pt} dir="y" sign={-1} color="emerald" style={{ top: 0, left: 0, right: 0, height: pt }} cls="cursor-ns-resize" h={h} />
          <BoxHandle element={element} id="p-R" prop="paddingRight" val={pr} dir="x" sign={1} color="emerald" style={{ top: 0, right: 0, bottom: 0, width: pr }} cls="cursor-ew-resize" h={h} />
          <BoxHandle element={element} id="p-B" prop="paddingBottom" val={pb} dir="y" sign={1} color="emerald" style={{ bottom: 0, left: 0, right: 0, height: pb }} cls="cursor-ns-resize" h={h} />
          <BoxHandle element={element} id="p-L" prop="paddingLeft" val={pl} dir="x" sign={-1} color="emerald" style={{ top: 0, left: 0, bottom: 0, width: pl }} cls="cursor-ew-resize" h={h} />
          {/* Padding zones — only when handle is active/hovered */}
          <BoxZone id="p-T" val={pt} color="emerald" style={{ top: 0, left: 0, right: 0, height: pt }} h={h} />
          <BoxZone id="p-R" val={pr} color="emerald" style={{ top: 0, right: 0, bottom: 0, width: pr }} h={h} />
          <BoxZone id="p-B" val={pb} color="emerald" style={{ bottom: 0, left: 0, right: 0, height: pb }} h={h} />
          <BoxZone id="p-L" val={pl} color="emerald" style={{ top: 0, left: 0, bottom: 0, width: pl }} h={h} />

          {/* Margin — only show if margin exists (don't clutter with empty margins) */}
          {(mt > 0 || mr > 0 || mb > 0 || ml > 0) && (
            <>
              {mt > 0 && <><BoxZone id="m-T" val={mt} color="orange" style={{ top: -mt, left: 0, right: 0, height: mt }} h={h} /><BoxHandle element={element} id="m-T" prop="marginTop" val={mt} dir="y" sign={-1} color="orange" style={{ top: -mt, left: 0, right: 0, height: mt }} cls="cursor-ns-resize" h={h} /></>}
              {mr > 0 && <><BoxZone id="m-R" val={mr} color="orange" style={{ top: 0, right: -mr, bottom: 0, width: mr }} h={h} /><BoxHandle element={element} id="m-R" prop="marginRight" val={mr} dir="x" sign={1} color="orange" style={{ top: 0, right: -mr, bottom: 0, width: mr }} cls="cursor-ew-resize" h={h} /></>}
              {mb > 0 && <><BoxZone id="m-B" val={mb} color="orange" style={{ bottom: -mb, left: 0, right: 0, height: mb }} h={h} /><BoxHandle element={element} id="m-B" prop="marginBottom" val={mb} dir="y" sign={1} color="orange" style={{ bottom: -mb, left: 0, right: 0, height: mb }} cls="cursor-ns-resize" h={h} /></>}
              {ml > 0 && <><BoxZone id="m-L" val={ml} color="orange" style={{ top: 0, left: -ml, bottom: 0, width: ml }} h={h} /><BoxHandle element={element} id="m-L" prop="marginLeft" val={ml} dir="x" sign={-1} color="orange" style={{ top: 0, left: -ml, bottom: 0, width: ml }} cls="cursor-ew-resize" h={h} /></>}
            </>
          )}

          {/* Radius — always (can drag from 0) */}
          <RadiusCorners element={element} h={h} />

          {/* Resize — leaf elements only (not containers) */}
          {!CONTAINER_TYPES.has(element.type) && <ResizeHandles element={element} wrapperRef={wrapperRef} dispatch={dispatch} />}

          {/* Font size — text elements only */}
          {TEXT_TYPES.has(element.type) && <FontSizeHandle element={element} dispatch={dispatch} />}

          {/* Dimensions — always on selected */}
          <DimensionsBadge wrapperRef={wrapperRef} isSelected={true} />
        </>
      )}

      {hasContentStyles ? <div style={contentStyles as React.CSSProperties}>{children}</div> : children}
    </div>
    </ContextMenuTrigger>
    {!isBody && (
      <ContextMenuContent className="w-48 text-xs">
        <ContextMenuItem onClick={() => dispatch({ type: 'REORDER_ELEMENT', payload: { elId: element.id, direction: 'up' } })}>Move Up <ContextMenuShortcut>Cmd+↑</ContextMenuShortcut></ContextMenuItem>
        <ContextMenuItem onClick={() => dispatch({ type: 'REORDER_ELEMENT', payload: { elId: element.id, direction: 'down' } })}>Move Down <ContextMenuShortcut>Cmd+↓</ContextMenuShortcut></ContextMenuItem>
        <ContextMenuSeparator />
        {parentId && <ContextMenuItem onClick={() => dispatch({ type: 'DUPLICATE_ELEMENT', payload: { elId: element.id, containerId: parentId } })}>Duplicate <ContextMenuShortcut>Cmd+D</ContextMenuShortcut></ContextMenuItem>}
        <ContextMenuItem onClick={() => navigator.clipboard.writeText(JSON.stringify(element))}>Copy <ContextMenuShortcut>Cmd+C</ContextMenuShortcut></ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => dispatch({ type: 'UPDATE_ELEMENT', payload: { element: { ...element, locked: !element.locked } } })}>{element.locked ? <><MIcon name="lock_open" size={14} className="mr-2" /> Unlock</> : <><MIcon name="lock" size={14} className="mr-2" /> Lock</>}</ContextMenuItem>
        <ContextMenuItem onClick={() => dispatch({ type: 'UPDATE_ELEMENT', payload: { element: { ...element, hidden: !element.hidden } } })}>{element.hidden ? <><MIcon name="visibility" size={14} className="mr-2" /> Show</> : <><MIcon name="visibility_off" size={14} className="mr-2" /> Hide</>}</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem className="text-destructive focus:text-destructive" onClick={() => dispatch({ type: 'DELETE_ELEMENT', payload: { id: element.id } })}>Delete <ContextMenuShortcut>Del</ContextMenuShortcut></ContextMenuItem>
      </ContextMenuContent>
    )}
    </ContextMenu>
  );
}
