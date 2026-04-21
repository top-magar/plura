'use client';

import type { ReactNode } from 'react';
import { MIcon } from '../../ui/m-icon';
import { ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuShortcut } from '@/components/ui/context-menu';
import type { El } from '../../core/types';
import type { useEditor } from '../../core/provider';

export function ElementContextMenu({ element, parentId, dispatch }: {
  element: El; parentId: string | null; dispatch: ReturnType<typeof useEditor>['dispatch'];
}): ReactNode {
  return (
    <ContextMenuContent className="w-48 text-xs">
      <ContextMenuItem onClick={() => dispatch({ type: 'REORDER_ELEMENT', payload: { elId: element.id, direction: 'up' } })}>Move Up <ContextMenuShortcut>Cmd+up</ContextMenuShortcut></ContextMenuItem>
      <ContextMenuItem onClick={() => dispatch({ type: 'REORDER_ELEMENT', payload: { elId: element.id, direction: 'down' } })}>Move Down <ContextMenuShortcut>Cmd+down</ContextMenuShortcut></ContextMenuItem>
      <ContextMenuSeparator />
      {parentId && <ContextMenuItem onClick={() => dispatch({ type: 'DUPLICATE_ELEMENT', payload: { elId: element.id, containerId: parentId } })}>Duplicate <ContextMenuShortcut>Cmd+D</ContextMenuShortcut></ContextMenuItem>}
      <ContextMenuItem onClick={() => navigator.clipboard.writeText(JSON.stringify(element))}>Copy <ContextMenuShortcut>Cmd+C</ContextMenuShortcut></ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem onClick={() => dispatch({ type: 'UPDATE_ELEMENT', payload: { element: { ...element, locked: !element.locked } } })}>{element.locked ? <><MIcon name="lock_open" size={14} className="mr-2" /> Unlock</> : <><MIcon name="lock" size={14} className="mr-2" /> Lock</>}</ContextMenuItem>
      <ContextMenuItem onClick={() => dispatch({ type: 'UPDATE_ELEMENT', payload: { element: { ...element, hidden: !element.hidden } } })}>{element.hidden ? <><MIcon name="visibility" size={14} className="mr-2" /> Show</> : <><MIcon name="visibility_off" size={14} className="mr-2" /> Hide</>}</ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem className="text-destructive focus:text-destructive" onClick={() => dispatch({ type: 'DELETE_ELEMENT', payload: { id: element.id } })}>Delete <ContextMenuShortcut>Del</ContextMenuShortcut></ContextMenuItem>
    </ContextMenuContent>
  );
}
