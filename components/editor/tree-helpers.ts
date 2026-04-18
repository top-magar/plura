import { v4 } from "uuid";
import type { El } from "./types";

export function addEl(tree: El[], containerId: string, el: El): El[] {
  return tree.map((n) => {
    if (n.id === containerId && Array.isArray(n.content)) return { ...n, content: [...n.content, el] };
    if (Array.isArray(n.content)) return { ...n, content: addEl(n.content, containerId, el) };
    return n;
  });
}

export function updateEl(tree: El[], updated: El): El[] {
  return tree.map((n) => {
    if (n.id === updated.id) return updated;
    if (Array.isArray(n.content)) return { ...n, content: updateEl(n.content, updated) };
    return n;
  });
}

export function deleteEl(tree: El[], id: string): El[] {
  return tree.filter((n) => n.id !== id).map((n) => {
    if (Array.isArray(n.content)) return { ...n, content: deleteEl(n.content, id) };
    return n;
  });
}

export function findEl(tree: El[], id: string): El | null {
  for (const n of tree) {
    if (n.id === id) return n;
    if (Array.isArray(n.content)) { const f = findEl(n.content, id); if (f) return f; }
  }
  return null;
}

export function moveEl(tree: El[], elId: string, targetContainerId: string): El[] {
  const el = findEl(tree, elId);
  if (!el) return tree;
  return addEl(deleteEl(tree, elId), targetContainerId, el);
}

export function reorderEl(tree: El[], elId: string, direction: "up" | "down"): El[] {
  return tree.map((n) => {
    if (Array.isArray(n.content)) {
      const idx = n.content.findIndex((c) => c.id === elId);
      if (idx >= 0) {
        const newIdx = direction === "up" ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= n.content.length) return n;
        const arr = [...n.content];
        [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
        return { ...n, content: arr };
      }
      return { ...n, content: reorderEl(n.content, elId, direction) };
    }
    return n;
  });
}

export function cloneEl(el: El): El {
  const id = v4();
  if (Array.isArray(el.content)) return { ...el, id, name: el.name + " copy", content: el.content.map(cloneEl) };
  return { ...el, id, name: el.name + " copy" };
}

export const defaultBody: El = { id: "__body", type: "__body", name: "Body", styles: { minHeight: "100vh" }, content: [] };
