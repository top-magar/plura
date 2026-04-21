'use client';

import { useRef, type CSSProperties, type ReactNode } from 'react';
import { MIcon } from '../ui/m-icon';
import { useEditor } from '../core/provider';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger, ContextMenuShortcut } from '@/components/ui/context-menu';
import { cn } from '@/lib/utils';
import type { El } from '../core/types';
import { resolveStyles } from '../core/types';
import { findParentId } from '../core/tree-helpers';
import { parseBox, useHandles, BoxZone, BoxHandle, RadiusCorners } from './handles/index';
import { ResizeHandles } from './handles/resize-handles';
import { FontSizeHandle } from './handles/font-size-handle';

const CONTAINER_TYPES = new Set(['__body', 'container', 'section', '2Col', '3Col', '4Col', 'row', 'column', 'grid', 'hero', 'footer', 'header', 'card', 'sidebar', 'modal', 'form']);
const TEXT_TYPES = new Set(['text', 'heading', 'subheading', 'quote', 'code', 'badge', 'list']);


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
  const parentId = findParentId(elements, element.id);
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

  // Freeform positioning: apply x/y/w/h as absolute position
  const isFreeform = !isBody && element.x !== undefined && element.y !== undefined;
  if (isFreeform) {
    wrapperStyles.position = 'absolute';
    wrapperStyles.left = element.x;
    wrapperStyles.top = element.y;
    if (element.w !== undefined) wrapperStyles.width = element.w;
    if (element.h !== undefined) wrapperStyles.height = element.h;
    wrapperStyles.boxSizing = 'border-box';
    // Remove conflicting CSS sizing — freeform w/h takes precedence
    delete wrapperStyles.flex;
    delete wrapperStyles.margin;
    delete wrapperStyles.marginTop;
    delete wrapperStyles.marginRight;
    delete wrapperStyles.marginBottom;
    delete wrapperStyles.marginLeft;
  }

  if (element.hidden && !preview) return <div className="relative opacity-20 pointer-events-none" style={resolved}>{children}</div>;
  if (preview) return <div style={wrapperStyles as CSSProperties} className={className}>{hasContentStyles ? <div style={contentStyles as CSSProperties}>{children}</div> : children}</div>;

  const s = element.styles;
  const [pt, pr, pb, pl] = parseBox(s, 'padding');
  const [mt, mr, mb, ml] = parseBox(s, 'margin');
  const hasPad = pt > 0 || pr > 0 || pb > 0 || pl > 0;
  const hasMar = mt > 0 || mr > 0 || mb > 0 || ml > 0;

  // Free drag for freeform elements
  const onPointerDown = (e: React.PointerEvent) => {
    if (!isFreeform || !isSel || element.locked || e.button !== 0) return;
    // Don't drag if clicking on a handle or interactive child
    const target = e.target as HTMLElement;
    if (target.closest('[data-handle]') || target.closest('input') || target.closest('textarea') || target.closest('[contenteditable]')) return;

    e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const startElX = element.x ?? 0, startElY = element.y ?? 0;
    const z = parseFloat(getComputedStyle(document.querySelector('[data-canvas]')!).getPropertyValue('--zoom')) || 1;
    let moved = false;

    const onMove = (ev: PointerEvent) => {
      const dx = (ev.clientX - startX) / z;
      const dy = (ev.clientY - startY) / z;
      if (!moved && Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
      moved = true;
      const snap = ev.shiftKey ? 10 : 1;
      const nx = Math.round((startElX + dx) / snap) * snap;
      const ny = Math.round((startElY + dy) / snap) * snap;
      dispatch({ type: 'UPDATE_ELEMENT_LIVE', payload: { element: { ...element, x: nx, y: ny } } });
    };
    const onUp = () => {
      if (moved) dispatch({ type: 'COMMIT_HISTORY' });
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  return (
    <ContextMenu>
    <ContextMenuTrigger disabled={isBody} asChild>
    <div
      ref={wrapperRef}
      data-wrapper
      className={cn(
        'relative group/el min-w-0',
        !isBody && 'transition-shadow duration-150',
        isSel && !isBody && 'outline outline-2 outline-primary -outline-offset-1',
        isHov && !isBody && 'outline outline-1 outline-primary/25',
        isDrop && 'ring-2 ring-primary/50 bg-primary/[0.03]',
        isBody && 'min-h-full p-3',
        isFreeform && isSel && 'cursor-move',
        className,
      )}
      style={wrapperStyles as React.CSSProperties}
      onClick={(e) => { e.stopPropagation(); dispatch({ type: 'CHANGE_CLICKED_ELEMENT', payload: { element } }); }}
      onPointerDown={onPointerDown}
      onDragOver={(e) => { e.preventDefault(); }}
      onMouseEnter={() => dispatch({ type: 'SET_HOVERED', payload: { id: element.id } })}
      onMouseLeave={() => { if (hovered === element.id) dispatch({ type: 'SET_HOVERED', payload: { id: null } }); }}
    >
      {/* Hover: ring only (className above). Padding peek on hover if exists */}
      {!isBody && !element.locked && isHov && hasPad && (
        <>
          {pt > 0 && <BoxZone id="p-T" val={pt} color="emerald" style={{ top: 0, left: 0, right: 0, height: pt }} h={h} />}
          {pr > 0 && <BoxZone id="p-R" val={pr} color="emerald" style={{ top: 0, right: 0, bottom: 0, width: pr }} h={h} />}
          {pb > 0 && <BoxZone id="p-B" val={pb} color="emerald" style={{ bottom: 0, left: 0, right: 0, height: pb }} h={h} />}
          {pl > 0 && <BoxZone id="p-L" val={pl} color="emerald" style={{ top: 0, left: 0, bottom: 0, width: pl }} h={h} />}
        </>
      )}

      {/* Selected state: interactive handles */}
      {isSel && !isBody && !element.locked && (<>
          {/* Padding — zones + handles only when padding exists */}
          {hasPad && (<>
            <BoxZone id="p-T" val={pt} color="emerald" style={{ top: 0, left: 0, right: 0, height: pt }} h={h} />
            <BoxZone id="p-R" val={pr} color="emerald" style={{ top: 0, right: 0, bottom: 0, width: pr }} h={h} />
            <BoxZone id="p-B" val={pb} color="emerald" style={{ bottom: 0, left: 0, right: 0, height: pb }} h={h} />
            <BoxZone id="p-L" val={pl} color="emerald" style={{ top: 0, left: 0, bottom: 0, width: pl }} h={h} />
            <BoxHandle element={element} id="p-T" prop="paddingTop" val={pt} dir="y" sign={-1} color="emerald" style={{ top: 0, left: 0, right: 0, height: Math.max(pt, 6) }} cls="cursor-ns-resize" h={h} />
            <BoxHandle element={element} id="p-R" prop="paddingRight" val={pr} dir="x" sign={1} color="emerald" style={{ top: 0, right: 0, bottom: 0, width: Math.max(pr, 6) }} cls="cursor-ew-resize" h={h} />
            <BoxHandle element={element} id="p-B" prop="paddingBottom" val={pb} dir="y" sign={1} color="emerald" style={{ bottom: 0, left: 0, right: 0, height: Math.max(pb, 6) }} cls="cursor-ns-resize" h={h} />
            <BoxHandle element={element} id="p-L" prop="paddingLeft" val={pl} dir="x" sign={-1} color="emerald" style={{ top: 0, left: 0, bottom: 0, width: Math.max(pl, 6) }} cls="cursor-ew-resize" h={h} />
          </>)}

          {/* Margin — only for non-freeform elements (margin doesn't apply to absolute positioned) */}
          {!isFreeform && hasMar && (<>
            {mt > 0 && <><BoxZone id="m-T" val={mt} color="orange" style={{ top: -mt, left: 0, right: 0, height: mt }} h={h} /><BoxHandle element={element} id="m-T" prop="marginTop" val={mt} dir="y" sign={-1} color="orange" style={{ top: -mt, left: 0, right: 0, height: mt }} cls="cursor-ns-resize" h={h} /></>}
            {mr > 0 && <><BoxZone id="m-R" val={mr} color="orange" style={{ top: 0, right: -mr, bottom: 0, width: mr }} h={h} /><BoxHandle element={element} id="m-R" prop="marginRight" val={mr} dir="x" sign={1} color="orange" style={{ top: 0, right: -mr, bottom: 0, width: mr }} cls="cursor-ew-resize" h={h} /></>}
            {mb > 0 && <><BoxZone id="m-B" val={mb} color="orange" style={{ bottom: -mb, left: 0, right: 0, height: mb }} h={h} /><BoxHandle element={element} id="m-B" prop="marginBottom" val={mb} dir="y" sign={1} color="orange" style={{ bottom: -mb, left: 0, right: 0, height: mb }} cls="cursor-ns-resize" h={h} /></>}
            {ml > 0 && <><BoxZone id="m-L" val={ml} color="orange" style={{ top: 0, left: -ml, bottom: 0, width: ml }} h={h} /><BoxHandle element={element} id="m-L" prop="marginLeft" val={ml} dir="x" sign={-1} color="orange" style={{ top: 0, left: -ml, bottom: 0, width: ml }} cls="cursor-ew-resize" h={h} /></>}
          </>)}

          {/* Radius corners — always (can drag from 0) */}
          <RadiusCorners element={element} h={h} />

          {/* Resize — leaf elements only */}
          {isFreeform && <ResizeHandles element={element} wrapperRef={wrapperRef} dispatch={dispatch} />}

          {/* Font size — text elements only */}
          {TEXT_TYPES.has(element.type) && <FontSizeHandle element={element} dispatch={dispatch} />}
      </>)}

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
