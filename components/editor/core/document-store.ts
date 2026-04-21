'use client';

import { create } from 'zustand';
import type { El } from './types';
import { addEl, updateEl, deleteEl, moveEl, reorderEl, cloneEl, findEl, defaultBody } from './tree-helpers';

const MAX_HISTORY = 50;

type DocumentState = {
  elements: El[];
  dirty: boolean;
  // History
  snapshots: El[][];
  currentIndex: number;
};

type DocumentActions = {
  addElement: (containerId: string, element: El, index?: number) => void;
  updateElement: (element: El) => void;
  updateElementLive: (element: El) => void;
  commitHistory: () => void;
  deleteElement: (id: string) => void;
  moveElement: (elId: string, targetContainerId: string, index?: number) => void;
  reorderElement: (elId: string, direction: 'up' | 'down') => void;
  duplicateElement: (elId: string, containerId: string) => void;
  setElements: (elements: El[]) => void;
  loadData: (elements: El[]) => void;
  undo: () => void;
  redo: () => void;
  setDirty: (dirty: boolean) => void;
};

function pushHistory(state: DocumentState, elements: El[]): Partial<DocumentState> {
  const trimmed = state.snapshots.slice(Math.max(0, state.currentIndex + 1 - MAX_HISTORY), state.currentIndex + 1);
  return { elements, dirty: true, snapshots: [...trimmed, elements], currentIndex: trimmed.length };
}

export const useDocumentStore = create<DocumentState & DocumentActions>()((set, get) => ({
  elements: [defaultBody],
  dirty: false,
  snapshots: [[defaultBody]],
  currentIndex: 0,

  addElement: (containerId, element, index) => set(s => pushHistory(s, addEl(s.elements, containerId, element, index))),

  updateElement: (element) => set(s => pushHistory(s, updateEl(s.elements, element))),

  updateElementLive: (element) => set(s => ({ elements: updateEl(s.elements, element), dirty: true })),

  commitHistory: () => set(s => pushHistory(s, s.elements)),

  deleteElement: (id) => set(s => pushHistory(s, deleteEl(s.elements, id))),

  moveElement: (elId, targetContainerId, index) => set(s => pushHistory(s, moveEl(s.elements, elId, targetContainerId, index))),

  reorderElement: (elId, direction) => set(s => pushHistory(s, reorderEl(s.elements, elId, direction))),

  duplicateElement: (elId, containerId) => {
    const original = findEl(get().elements, elId);
    if (!original) return;
    set(s => pushHistory(s, addEl(s.elements, containerId, cloneEl(original))));
  },

  setElements: (elements) => set(s => pushHistory(s, elements)),

  loadData: (elements) => set({ elements, dirty: false, snapshots: [elements], currentIndex: 0 }),

  undo: () => set(s => {
    if (s.currentIndex <= 0) return s;
    const idx = s.currentIndex - 1;
    return { elements: s.snapshots[idx], currentIndex: idx };
  }),

  redo: () => set(s => {
    if (s.currentIndex >= s.snapshots.length - 1) return s;
    const idx = s.currentIndex + 1;
    return { elements: s.snapshots[idx], currentIndex: idx };
  }),

  setDirty: (dirty) => set({ dirty }),
}));
