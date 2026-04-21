import { v4 } from "uuid";
import type { El } from "./types";

export function addEl(tree: El[], containerId: string, el: El, index?: number): El[] {
  return tree.map((n) => {
    if (n.id === containerId && Array.isArray(n.content)) {
      const arr = [...n.content];
      if (index !== undefined && index >= 0) arr.splice(index, 0, el);
      else arr.push(el);
      return { ...n, content: arr };
    }
    if (Array.isArray(n.content)) return { ...n, content: addEl(n.content, containerId, el, index) };
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

export function moveEl(tree: El[], elId: string, targetContainerId: string, index?: number): El[] {
  const el = findEl(tree, elId);
  if (!el) return tree;
  const target = findEl(tree, targetContainerId);
  if (!target || !Array.isArray(target.content)) return tree;
  return addEl(deleteEl(tree, elId), targetContainerId, el, index);
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

export function findParentId(tree: El[], id: string): string | null {
  for (const n of tree) {
    if (Array.isArray(n.content)) {
      if (n.content.some((c) => c.id === id)) return n.id;
      const found = findParentId(n.content, id);
      if (found) return found;
    }
  }
  return null;
}

/** Returns the path from root to the element with the given id */
export function getAncestorPath(tree: El[], id: string): El[] {
  for (const n of tree) {
    if (n.id === id) return [n];
    if (Array.isArray(n.content)) {
      const sub = getAncestorPath(n.content, id);
      if (sub.length) return [n, ...sub];
    }
  }
  return [];
}

export function cloneEl(el: El): El {
  const id = v4();
  if (Array.isArray(el.content)) return { ...el, id, name: el.name + " copy", content: el.content.map(cloneEl) };
  return { ...el, id, name: el.name + " copy" };
}

export const defaultBody: El = { id: "__body", type: "__body", name: "Body", styles: { display: "flex", flexDirection: "column", gap: "0px", minHeight: "100vh", width: "100%" }, content: [] };
