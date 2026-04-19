'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { El, Device, EditorProps } from './types';
import {
  addEl,
  updateEl,
  deleteEl,
  moveEl,
  reorderEl,
  cloneEl,
  findEl,
  defaultBody,
} from './tree-helpers';

// ─── Actions ────────────────────────────────────────────────

type EditorAction =
  | { type: 'ADD_ELEMENT'; payload: { containerId: string; element: El } }
  | { type: 'UPDATE_ELEMENT'; payload: { element: El } }
  | { type: 'DELETE_ELEMENT'; payload: { id: string } }
  | { type: 'MOVE_ELEMENT'; payload: { elId: string; targetContainerId: string } }
  | { type: 'REORDER_ELEMENT'; payload: { elId: string; direction: 'up' | 'down' } }
  | { type: 'DUPLICATE_ELEMENT'; payload: { elId: string; containerId: string } }
  | { type: 'CHANGE_CLICKED_ELEMENT'; payload: { element: El | null } }
  | { type: 'CHANGE_DEVICE'; payload: { device: Device } }
  | { type: 'TOGGLE_PREVIEW' }
  | { type: 'SET_HOVERED'; payload: { id: string | null } }
  | { type: 'SET_DROP_TARGET'; payload: { id: string | null } }
  | { type: 'LOAD_DATA'; payload: { elements: El[] } }
  | { type: 'SET_ELEMENTS'; payload: { elements: El[] } }
  | { type: 'UNDO' }
  | { type: 'REDO' };

export type { EditorAction };

// ─── State ──────────────────────────────────────────────────

type EditorState = {
  elements: El[];
  selected: El | null;
  device: Device;
  preview: boolean;
  hovered: string | null;
  dropTarget: string | null;
  dirty: boolean;
  clipboard: El | null;
  zoom: number;
};

type HistoryState = {
  history: EditorState[];
  currentIndex: number;
};

type EditorStore = {
  editor: EditorState;
  history: HistoryState;
};

export type { EditorState, HistoryState, EditorStore };

// ─── Initial state ──────────────────────────────────────────

const initialEditorState: EditorState = {
  elements: [defaultBody],
  selected: null,
  device: 'Desktop',
  preview: false,
  hovered: null,
  dropTarget: null,
  dirty: false,
  clipboard: null,
  zoom: 100,
};

const initialStore: EditorStore = {
  editor: initialEditorState,
  history: { history: [initialEditorState], currentIndex: 0 },
};

// ─── Helpers ────────────────────────────────────────────────

function pushHistory(store: EditorStore, next: EditorState): EditorStore {
  const trimmed = store.history.history.slice(0, store.history.currentIndex + 1);
  return {
    editor: next,
    history: { history: [...trimmed, next], currentIndex: trimmed.length },
  };
}

// ─── Reducer ────────────────────────────────────────────────

function editorReducer(store: EditorStore, action: EditorAction): EditorStore {
  switch (action.type) {
    case 'ADD_ELEMENT': {
      const elements = addEl(store.editor.elements, action.payload.containerId, action.payload.element);
      return pushHistory(store, { ...store.editor, elements, dirty: true });
    }
    case 'UPDATE_ELEMENT': {
      const { element } = action.payload;
      const elements = updateEl(store.editor.elements, element);
      const selected = store.editor.selected?.id === element.id ? element : store.editor.selected;
      return pushHistory(store, { ...store.editor, elements, selected, dirty: true });
    }
    case 'DELETE_ELEMENT': {
      const elements = deleteEl(store.editor.elements, action.payload.id);
      const selected = store.editor.selected?.id === action.payload.id ? null : store.editor.selected;
      return pushHistory(store, { ...store.editor, elements, selected, dirty: true });
    }
    case 'MOVE_ELEMENT': {
      const elements = moveEl(store.editor.elements, action.payload.elId, action.payload.targetContainerId);
      return pushHistory(store, { ...store.editor, elements, dirty: true });
    }
    case 'REORDER_ELEMENT': {
      const elements = reorderEl(store.editor.elements, action.payload.elId, action.payload.direction);
      return pushHistory(store, { ...store.editor, elements, dirty: true });
    }
    case 'DUPLICATE_ELEMENT': {
      const original = findEl(store.editor.elements, action.payload.elId);
      if (!original) return store;
      const elements = addEl(store.editor.elements, action.payload.containerId, cloneEl(original));
      return pushHistory(store, { ...store.editor, elements, dirty: true });
    }
    case 'CHANGE_CLICKED_ELEMENT':
      return { ...store, editor: { ...store.editor, selected: action.payload.element } };
    case 'CHANGE_DEVICE':
      return { ...store, editor: { ...store.editor, device: action.payload.device } };
    case 'TOGGLE_PREVIEW':
      return { ...store, editor: { ...store.editor, preview: !store.editor.preview } };
    case 'SET_HOVERED':
      return { ...store, editor: { ...store.editor, hovered: action.payload.id } };
    case 'SET_DROP_TARGET':
      return { ...store, editor: { ...store.editor, dropTarget: action.payload.id } };
    case 'LOAD_DATA': {
      const next: EditorState = { ...initialEditorState, elements: action.payload.elements };
      return { editor: next, history: { history: [next], currentIndex: 0 } };
    }
    case 'SET_ELEMENTS': {
      const elements = action.payload.elements;
      return pushHistory(store, { ...store.editor, elements, dirty: true });
    }
    case 'UNDO': {
      if (store.history.currentIndex <= 0) return store;
      const idx = store.history.currentIndex - 1;
      return { editor: store.history.history[idx], history: { ...store.history, currentIndex: idx } };
    }
    case 'REDO': {
      if (store.history.currentIndex >= store.history.history.length - 1) return store;
      const idx = store.history.currentIndex + 1;
      return { editor: store.history.history[idx], history: { ...store.history, currentIndex: idx } };
    }
    default:
      return store;
  }
}

// ─── Context ────────────────────────────────────────────────

type EditorContextValue = {
  state: EditorStore;
  dispatch: React.Dispatch<EditorAction>;
  pageId: string;
  pageName: string;
  funnelId: string;
  subAccountId: string;
  agencyId: string;
};

const EditorContext = createContext<EditorContextValue | null>(null);

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditor must be used inside EditorProvider');
  return ctx;
}

// ─── Provider ───────────────────────────────────────────────

type EditorProviderProps = EditorProps & { children: React.ReactNode };

export function EditorProvider({
  children,
  pageId,
  pageName,
  funnelId,
  subAccountId,
  agencyId,
  initialContent,
}: EditorProviderProps) {
  const [state, dispatch] = useReducer(editorReducer, initialStore);

  useEffect(() => {
    if (!initialContent) return;
    try {
      const parsed = JSON.parse(initialContent) as El[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        dispatch({ type: 'LOAD_DATA', payload: { elements: parsed } });
      }
    } catch {
      // invalid JSON — keep default body
    }
  }, [initialContent]);

  return (
    <EditorContext.Provider value={{ state, dispatch, pageId, pageName, funnelId, subAccountId, agencyId }}>
      {children}
    </EditorContext.Provider>
  );
}
