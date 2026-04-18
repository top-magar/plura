"use client";

import { useEffect } from "react";
import clsx from "clsx";
import { useEditor } from "./provider";
import Recursive from "./recursive";
import type { EditorElement } from "./types";

type Props = { funnelPageId: string; pageContent: string | null };

export default function EditorCanvas({ funnelPageId, pageContent }: Props) {
  const { state, dispatch } = useEditor();

  useEffect(() => {
    if (pageContent) {
      try {
        const elements = JSON.parse(pageContent) as EditorElement[];
        dispatch({ type: "LOAD_DATA", payload: { elements, funnelPageId } });
      } catch {
        dispatch({
          type: "LOAD_DATA",
          payload: {
            elements: [{ id: "__body", type: "__body", name: "Body", styles: {}, content: [] }],
            funnelPageId,
          },
        });
      }
    } else {
      dispatch({
        type: "LOAD_DATA",
        payload: {
          elements: [{ id: "__body", type: "__body", name: "Body", styles: {}, content: [] }],
          funnelPageId,
        },
      });
    }
  }, [funnelPageId, pageContent, dispatch]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        dispatch({ type: e.shiftKey ? "REDO" : "UNDO" });
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (state.editor.selectedElement && state.editor.selectedElement.type !== "__body") {
          const active = document.activeElement;
          if (active?.tagName === "INPUT" || active?.tagName === "TEXTAREA" || (active as HTMLElement)?.isContentEditable) return;
          dispatch({ type: "DELETE_ELEMENT", payload: { elementId: state.editor.selectedElement.id } });
        }
      }
      if (e.key === "Escape") {
        dispatch({ type: "SELECT_ELEMENT", payload: { element: null } });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.editor.selectedElement, dispatch]);

  const body = state.editor.elements[0];
  if (!body) return null;

  return (
    <div
      className={clsx(
        "flex-1 overflow-auto bg-muted/30 p-4",
        state.editor.previewMode && "p-0"
      )}
      onClick={() => {
        if (!state.editor.previewMode) {
          dispatch({ type: "SELECT_ELEMENT", payload: { element: null } });
        }
      }}
    >
      <div
        className={clsx(
          "mx-auto min-h-full bg-background shadow-sm transition-all duration-300",
          state.editor.previewMode && "shadow-none",
          state.editor.device === "Desktop" && "w-full max-w-full",
          state.editor.device === "Tablet" && "max-w-[768px]",
          state.editor.device === "Mobile" && "max-w-[420px]",
        )}
      >
        <Recursive element={body} />
      </div>
    </div>
  );
}
