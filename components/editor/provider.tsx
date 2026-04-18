"use client";

import { createContext, useContext, useReducer, type Dispatch } from "react";
import type { EditorAction, EditorElement, EditorState } from "./types";
import { initialEditorState, initialEditor } from "./types";
import type { FunnelPage } from "@/lib/generated/prisma/client";

// ── Helpers ──────────────────────────────────────────────────

function addElement(elements: EditorElement[], containerId: string, element: EditorElement): EditorElement[] {
  return elements.map((el) => {
    if (el.id === containerId && Array.isArray(el.content)) {
      return { ...el, content: [...el.content, element] };
    }
    if (Array.isArray(el.content)) {
      return { ...el, content: addElement(el.content, containerId, element) };
    }
    return el;
  });
}

function updateElement(elements: EditorElement[], updated: EditorElement): EditorElement[] {
  return elements.map((el) => {
    if (el.id === updated.id) return updated;
    if (Array.isArray(el.content)) {
      return { ...el, content: updateElement(el.content, updated) };
    }
    return el;
  });
}

function deleteElement(elements: EditorElement[], id: string): EditorElement[] {
  return elements
    .filter((el) => el.id !== id)
    .map((el) => {
      if (Array.isArray(el.content)) {
        return { ...el, content: deleteElement(el.content, id) };
      }
      return el;
    });
}

function removeElement(elements: EditorElement[], id: string): { elements: EditorElement[]; removed: EditorElement | null } {
  let removed: EditorElement | null = null;
  const filtered = elements
    .filter((el) => {
      if (el.id === id) { removed = el; return false; }
      return true;
    })
    .map((el) => {
      if (Array.isArray(el.content) && !removed) {
        const result = removeElement(el.content, id);
        if (result.removed) removed = result.removed;
        return { ...el, content: result.elements };
      }
      return el;
    });
  return { elements: filtered, removed };
}

function insertElement(elements: EditorElement[], containerId: string, element: EditorElement, index: number): EditorElement[] {
  return elements.map((el) => {
    if (el.id === containerId && Array.isArray(el.content)) {
      const newContent = [...el.content];
      newContent.splice(index, 0, element);
      return { ...el, content: newContent };
    }
    if (Array.isArray(el.content)) {
      return { ...el, content: insertElement(el.content, containerId, element, index) };
    }
    return el;
  });
}

// ── Reducer ──────────────────────────────────────────────────

function pushToHistory(state: EditorState, newEditor: typeof state.editor): EditorState {
  const newHistory = [
    ...state.history.history.slice(0, state.history.currentIndex + 1),
    { ...newEditor },
  ];
  return {
    editor: newEditor,
    history: { history: newHistory, currentIndex: newHistory.length - 1 },
  };
}

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "ADD_ELEMENT": {
      const newElements = addElement(state.editor.elements, action.payload.containerId, action.payload.elementDetails);
      return pushToHistory(state, { ...state.editor, elements: newElements });
    }

    case "UPDATE_ELEMENT": {
      const newElements = updateElement(state.editor.elements, action.payload.elementDetails);
      const isSelected = state.editor.selectedElement?.id === action.payload.elementDetails.id;
      return pushToHistory(state, {
        ...state.editor,
        elements: newElements,
        selectedElement: isSelected ? action.payload.elementDetails : state.editor.selectedElement,
      });
    }

    case "DELETE_ELEMENT": {
      const newElements = deleteElement(state.editor.elements, action.payload.elementId);
      return pushToHistory(state, { ...state.editor, elements: newElements, selectedElement: null });
    }

    case "SELECT_ELEMENT": {
      // Tutorial saves select to history for undo
      const newEditor = { ...state.editor, selectedElement: action.payload.element };
      const newHistory = [
        ...state.history.history.slice(0, state.history.currentIndex + 1),
        { ...newEditor },
      ];
      return {
        editor: newEditor,
        history: { history: newHistory, currentIndex: newHistory.length - 1 },
      };
    }

    case "CHANGE_DEVICE":
      return { ...state, editor: { ...state.editor, device: action.payload.device } };

    case "TOGGLE_PREVIEW":
      return { ...state, editor: { ...state.editor, previewMode: !state.editor.previewMode, selectedElement: null } };

    case "TOGGLE_LIVE_MODE":
      return {
        ...state,
        editor: {
          ...state.editor,
          liveMode: action.payload?.value ?? !state.editor.liveMode,
        },
      };

    case "UNDO": {
      if (state.history.currentIndex <= 0) return state;
      const prevIndex = state.history.currentIndex - 1;
      const prevEditor = state.history.history[prevIndex];
      return { editor: { ...prevEditor }, history: { ...state.history, currentIndex: prevIndex } };
    }

    case "REDO": {
      if (state.history.currentIndex >= state.history.history.length - 1) return state;
      const nextIndex = state.history.currentIndex + 1;
      const nextEditor = state.history.history[nextIndex];
      return { editor: { ...nextEditor }, history: { ...state.history, currentIndex: nextIndex } };
    }

    case "LOAD_DATA": {
      return {
        editor: {
          ...initialEditor,
          elements: action.payload.elements.length > 0 ? action.payload.elements : initialEditor.elements,
          liveMode: !!action.payload.withLive,
        },
        history: {
          history: [{
            ...initialEditor,
            elements: action.payload.elements.length > 0 ? action.payload.elements : initialEditor.elements,
          }],
          currentIndex: 0,
        },
      };
    }

    case "SET_FUNNELPAGE_ID": {
      const newEditor = { ...state.editor, funnelPageId: action.payload.funnelPageId };
      return pushToHistory(state, newEditor);
    }

    case "MOVE_ELEMENT": {
      const { elementId, newContainerId, index } = action.payload;
      const { elements, removed } = removeElement(state.editor.elements, elementId);
      if (!removed) return state;
      const newElements = insertElement(elements, newContainerId, removed, index);
      return pushToHistory(state, { ...state.editor, elements: newElements });
    }

    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────────────

type EditorContextType = {
  state: EditorState;
  dispatch: Dispatch<EditorAction>;
  subAccountId: string;
  funnelId: string;
  pageDetails: FunnelPage | null;
};

const EditorContext = createContext<EditorContextType>({
  state: initialEditorState,
  dispatch: () => {},
  subAccountId: "",
  funnelId: "",
  pageDetails: null,
});

type EditorProviderProps = {
  children: React.ReactNode;
  subAccountId: string;
  funnelId: string;
  pageDetails: FunnelPage | null;
};

export function EditorProvider({ children, subAccountId, funnelId, pageDetails }: EditorProviderProps) {
  const [state, dispatch] = useReducer(editorReducer, initialEditorState);
  return (
    <EditorContext.Provider value={{ state, dispatch, subAccountId, funnelId, pageDetails }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used within EditorProvider");
  return ctx;
}
