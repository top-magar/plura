import { useCallback, type CSSProperties } from "react";
import type { El } from "./types";
import type { EditorAction } from "./provider";
import { cloneEl, findParentId, findEl as findElInTree } from "./tree-helpers";
import { toast } from "sonner";

type ShortcutDeps = {
  selected: El | null;
  elements: El[];
  clipboard: El | null;
  setClipboard: (el: El | null) => void;
  styleClipboard: CSSProperties | null;
  setStyleClipboard: (s: CSSProperties | null) => void;
  dispatch: React.Dispatch<EditorAction>;
  setDirty: (v: boolean) => void;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  handleSave: () => void;
};

export function useShortcuts(deps: ShortcutDeps) {
  const { selected, elements, clipboard, setClipboard, styleClipboard, setStyleClipboard, dispatch, setDirty, setZoom, handleSave } = deps;

  return useCallback((e: React.KeyboardEvent) => {
    const mod = e.metaKey || e.ctrlKey;
    const tag = (e.target as HTMLElement).tagName;
    const isInput = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement).isContentEditable;

    if (mod && e.key === "z") { e.preventDefault(); e.shiftKey ? dispatch({ type: "REDO" }) : dispatch({ type: "UNDO" }); }
    if (mod && e.key === "s") { e.preventDefault(); handleSave(); }
    if (mod && e.key === "d" && selected && selected.type !== "__body") {
      e.preventDefault();
      const pid = findParentId(elements, selected.id);
      if (pid) { dispatch({ type: "DUPLICATE_ELEMENT", payload: { elId: selected.id, containerId: pid } }); setDirty(true); }
    }
    if (mod && !e.altKey && e.key === "c" && selected && selected.type !== "__body") { e.preventDefault(); setClipboard(selected); toast.success("Copied"); }
    if (mod && e.altKey && e.key === "c" && selected) { e.preventDefault(); setStyleClipboard(selected.styles); toast.success("Styles copied"); }
    if (mod && e.altKey && e.key === "v" && selected && styleClipboard) {
      e.preventDefault();
      dispatch({ type: "UPDATE_ELEMENT", payload: { element: { ...selected, styles: { ...selected.styles, ...styleClipboard } } } });
      setDirty(true); toast.success("Styles pasted");
    }
    if (mod && !e.altKey && e.key === "v" && clipboard) {
      e.preventDefault();
      const target = selected && Array.isArray(selected.content) ? selected.id : "__body";
      dispatch({ type: "ADD_ELEMENT", payload: { containerId: target, element: cloneEl(clipboard) } });
      setDirty(true);
    }
    if ((e.key === "Delete" || e.key === "Backspace") && selected && selected.type !== "__body" && !isInput) {
      dispatch({ type: "DELETE_ELEMENT", payload: { id: selected.id } }); setDirty(true);
    }
    if (e.key === "Escape") {
      if (selected && selected.type !== "__body") {
        const pid = findParentId(elements, selected.id);
        if (pid && pid !== "__body") { dispatch({ type: "CHANGE_CLICKED_ELEMENT", payload: { element: findElInTree(elements, pid) } }); }
        else dispatch({ type: "CHANGE_CLICKED_ELEMENT", payload: { element: null } });
      } else dispatch({ type: "CHANGE_CLICKED_ELEMENT", payload: { element: null } });
    }
    if (mod && e.key === "ArrowUp" && selected && selected.type !== "__body") { e.preventDefault(); dispatch({ type: "REORDER_ELEMENT", payload: { elId: selected.id, direction: "up" } }); setDirty(true); }
    if (mod && e.key === "ArrowDown" && selected && selected.type !== "__body") { e.preventDefault(); dispatch({ type: "REORDER_ELEMENT", payload: { elId: selected.id, direction: "down" } }); setDirty(true); }
    if (!mod && (e.key === "ArrowUp" || e.key === "ArrowDown") && selected && selected.type !== "__body" && !isInput) {
      e.preventDefault();
      dispatch({ type: "REORDER_ELEMENT", payload: { elId: selected.id, direction: e.key === "ArrowUp" ? "up" : "down" } });
      setDirty(true);
    }
    if (mod && e.key === "=") { e.preventDefault(); setZoom((z) => Math.min(200, z + 10)); }
    if (mod && e.key === "-") { e.preventDefault(); setZoom((z) => Math.max(25, z - 10)); }
    if (mod && e.key === "0") { e.preventDefault(); setZoom(100); }
    if (mod && e.key === "1") { e.preventDefault(); setZoom(100); }
    if (mod && e.key === "a") { e.preventDefault(); dispatch({ type: "CHANGE_CLICKED_ELEMENT", payload: { element: elements[0] } }); }
  }, [selected, clipboard, styleClipboard, elements, dispatch, setDirty, setZoom, handleSave, setClipboard, setStyleClipboard]);
}
