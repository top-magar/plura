'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { EditorAction, EditorElement, EditorState, Editor, HistoryState } from './types';

const defaultBody: EditorElement = {
  id: '__body',
  type: '__body',
  name: 'Body',
  styles: {},
  content: [],
};


const emptyElement: EditorElement = {
  id: '',
  type: '',
  name: '',
  styles: {},
  content: [],
};

const initialEditorState: EditorState = {
  elements: [defaultBody],
  selectedElement: emptyElement,
  device: 'Desktop',
  previewMode: false,
  liveMode: false,
  funnelPageId: '',
};

const initialHistory: HistoryState = {
  history: [initialEditorState],
  currentIndex: 0,
};

const initialState: Editor = {
  editor: initialEditorState,
  history: initialHistory,
};

// ─── Tree helpers ───────────────────────────────────────────

function addElement(elements: EditorElement[], containerId: string, el: EditorElement): EditorElement[] {
  return elements.map((item) => {
    if (item.id === containerId && Array.isArray(item.content)) {
      return { ...item, content: [...item.content, el] };
    }
    if (Array.isArray(item.content)) {
      return { ...item, content: addElement(item.content, containerId, el) };
    }
    return item;
  });
}

function updateElement(elements: EditorElement[], updated: EditorElement): EditorElement[] {
  return elements.map((item) => {
    if (item.id === updated.id) return updated;
    if (Array.isArray(item.content)) {
      return { ...item, content: updateElement(item.content, updated) };
    }
    return item;
  });
}

function deleteElement(elements: EditorElement[], id: string): EditorElement[] {
  return elements
    .filter((item) => item.id !== id)
    .map((item) => {
      if (Array.isArray(item.content)) {
        return { ...item, content: deleteElement(item.content, id) };
      }
      return item;
    });
}

// ─── Reducer ────────────────────────────────────────────────

function editorReducer(state: Editor, action: EditorAction): Editor {
  switch (action.type) {
    case 'ADD_ELEMENT': {
      const newElements = addElement(state.editor.elements, action.payload.containerId, action.payload.elementDetails);
      const newEditor: EditorState = { ...state.editor, elements: newElements };
      const newHistory = state.history.history.slice(0, state.history.currentIndex + 1);
      return {
        editor: newEditor,
        history: { history: [...newHistory, newEditor], currentIndex: newHistory.length },
      };
    }
    case 'UPDATE_ELEMENT': {
      const newElements = updateElement(state.editor.elements, action.payload.elementDetails);
      const isSelected = state.editor.selectedElement?.id === action.payload.elementDetails.id;
      const newEditor: EditorState = {
        ...state.editor,
        elements: newElements,
        selectedElement: isSelected ? action.payload.elementDetails : state.editor.selectedElement,
      };
      const newHistory = state.history.history.slice(0, state.history.currentIndex + 1);
      return {
        editor: newEditor,
        history: { history: [...newHistory, newEditor], currentIndex: newHistory.length },
      };
    }
    case 'DELETE_ELEMENT': {
      const newElements = deleteElement(state.editor.elements, action.payload.elementDetails.id);
      const newEditor: EditorState = { ...state.editor, elements: newElements, selectedElement: emptyElement };
      const newHistory = state.history.history.slice(0, state.history.currentIndex + 1);
      return {
        editor: newEditor,
        history: { history: [...newHistory, newEditor], currentIndex: newHistory.length },
      };
    }
    case 'CHANGE_CLICKED_ELEMENT': {
      return {
        ...state,
        editor: { ...state.editor, selectedElement: action.payload.elementDetails ?? emptyElement },
      };
    }
    case 'CHANGE_DEVICE': {
      return { ...state, editor: { ...state.editor, device: action.payload.device } };
    }
    case 'TOGGLE_PREVIEW_MODE': {
      return { ...state, editor: { ...state.editor, previewMode: !state.editor.previewMode } };
    }
    case 'TOGGLE_LIVE_MODE': {
      return { ...state, editor: { ...state.editor, liveMode: !state.editor.liveMode } };
    }
    case 'UNDO': {
      if (state.history.currentIndex <= 0) return state;
      const prevIndex = state.history.currentIndex - 1;
      return {
        editor: state.history.history[prevIndex],
        history: { ...state.history, currentIndex: prevIndex },
      };
    }
    case 'REDO': {
      if (state.history.currentIndex >= state.history.history.length - 1) return state;
      const nextIndex = state.history.currentIndex + 1;
      return {
        editor: state.history.history[nextIndex],
        history: { ...state.history, currentIndex: nextIndex },
      };
    }
    case 'LOAD_DATA': {
      const newEditor: EditorState = {
        ...state.editor,
        elements: action.payload.elements,
        liveMode: action.payload.withLive,
      };
      return {
        editor: newEditor,
        history: { history: [newEditor], currentIndex: 0 },
      };
    }
    case 'SET_FUNNELPAGE_ID': {
      return { ...state, editor: { ...state.editor, funnelPageId: action.payload.funnelPageId } };
    }
    default:
      return state;
  }
}

// ─── Context ────────────────────────────────────────────────

type EditorContextType = {
  state: Editor;
  dispatch: React.Dispatch<EditorAction>;
  subaccountId: string;
  funnelId: string;
  pageDetails: { id: string; name: string; order: number; content: string | null; funnelId: string; published?: boolean };
};

const EditorContext = createContext<EditorContextType | null>(null);

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditor must be used inside EditorProvider');
  return ctx;
}

type EditorProviderProps = {
  children: React.ReactNode;
  subaccountId: string;
  funnelId: string;
  pageDetails: { id: string; name: string; order: number; content: string | null; funnelId: string; published?: boolean };
};

export function EditorProvider({ children, subaccountId, funnelId, pageDetails }: EditorProviderProps) {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  useEffect(() => {
    if (pageDetails.content) {
      try {
        const parsed = JSON.parse(pageDetails.content) as EditorElement[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          dispatch({ type: 'LOAD_DATA', payload: { elements: parsed, withLive: false } });
        }
      } catch {
        // invalid JSON, keep default body
      }
    }
    dispatch({ type: 'SET_FUNNELPAGE_ID', payload: { funnelPageId: pageDetails.id } });
  }, [pageDetails]);

  return (
    <EditorContext.Provider value={{ state, dispatch, subaccountId, funnelId, pageDetails }}>
      {children}
    </EditorContext.Provider>
  );
}
