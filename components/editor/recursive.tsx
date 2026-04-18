"use client";

import { useEditor } from "./provider";
import type { EditorElement } from "./types";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import clsx from "clsx";
import { v4 } from "uuid";

function Recursive({ element }: { element: EditorElement }) {
  const { state, dispatch } = useEditor();
  const { selectedElement, previewMode } = state.editor;
  const isSelected = selectedElement?.id === element.id;
  const isBody = element.type === "__body";

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewMode) return;
    dispatch({ type: "SELECT_ELEMENT", payload: { element } });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: "DELETE_ELEMENT", payload: { elementId: element.id } });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const type = e.dataTransfer.getData("componentType");
    if (!type) return;

    const newElement = createElementFromType(type);
    if (newElement) {
      dispatch({ type: "ADD_ELEMENT", payload: { containerId: element.id, elementDetails: newElement } });
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (previewMode || isBody) return;
    e.dataTransfer.setData("elementId", element.id);
    e.stopPropagation();
  };

  // Render based on type
  if (element.type === "text" || element.type === "link") {
    const content = element.content as { innerText?: string; href?: string };
    const Tag = element.type === "link" ? "a" : "span";
    return (
      <div
        style={element.styles}
        className={clsx("relative p-1", !previewMode && "cursor-pointer", isSelected && "ring-2 ring-primary ring-offset-1")}
        onClick={handleClick}
        draggable={!previewMode && !isBody}
        onDragStart={handleDragStart}
      >
        {isSelected && !previewMode && (
          <div className="absolute -top-6 left-0 flex items-center gap-1">
            <Badge className="text-[10px] h-5">{element.name}</Badge>
            <button onClick={handleDelete} className="flex h-5 w-5 items-center justify-center rounded bg-destructive text-white">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}
        <Tag
          href={element.type === "link" ? (content.href || "#") : undefined}
          contentEditable={!previewMode && isSelected}
          suppressContentEditableWarning
          onBlur={(e) => {
            dispatch({
              type: "UPDATE_ELEMENT",
              payload: {
                elementDetails: {
                  ...element,
                  content: { ...content, innerText: (e.target as HTMLElement).innerText },
                },
              },
            });
          }}
          className="outline-none"
        >
          {content.innerText || (element.type === "link" ? "Link" : "Text")}
        </Tag>
      </div>
    );
  }

  if (element.type === "image") {
    const content = element.content as { src?: string };
    return (
      <div
        style={element.styles}
        className={clsx("relative", !previewMode && "cursor-pointer", isSelected && "ring-2 ring-primary ring-offset-1")}
        onClick={handleClick}
        draggable={!previewMode}
        onDragStart={handleDragStart}
      >
        {isSelected && !previewMode && (
          <div className="absolute -top-6 left-0 flex items-center gap-1 z-10">
            <Badge className="text-[10px] h-5">{element.name}</Badge>
            <button onClick={handleDelete} className="flex h-5 w-5 items-center justify-center rounded bg-destructive text-white">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={content.src || "https://placehold.co/600x400?text=Image"} alt={element.name} className="w-full" />
      </div>
    );
  }

  if (element.type === "video") {
    const content = element.content as { src?: string };
    return (
      <div
        style={element.styles}
        className={clsx("relative", !previewMode && "cursor-pointer", isSelected && "ring-2 ring-primary ring-offset-1")}
        onClick={handleClick}
        draggable={!previewMode}
        onDragStart={handleDragStart}
      >
        {isSelected && !previewMode && (
          <div className="absolute -top-6 left-0 flex items-center gap-1 z-10">
            <Badge className="text-[10px] h-5">{element.name}</Badge>
            <button onClick={handleDelete} className="flex h-5 w-5 items-center justify-center rounded bg-destructive text-white">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}
        <iframe src={content.src} className="w-full aspect-video" allowFullScreen />
      </div>
    );
  }

  if (element.type === "contactForm") {
    return (
      <div
        style={element.styles}
        className={clsx("relative p-4", !previewMode && "cursor-pointer", isSelected && "ring-2 ring-primary ring-offset-1")}
        onClick={handleClick}
        draggable={!previewMode}
        onDragStart={handleDragStart}
      >
        {isSelected && !previewMode && (
          <div className="absolute -top-6 left-0 flex items-center gap-1 z-10">
            <Badge className="text-[10px] h-5">Contact Form</Badge>
            <button onClick={handleDelete} className="flex h-5 w-5 items-center justify-center rounded bg-destructive text-white">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}
        <form className="space-y-2" onSubmit={(e) => e.preventDefault()}>
          <input placeholder="Name" className="w-full rounded border px-3 py-2 text-sm" />
          <input placeholder="Email" className="w-full rounded border px-3 py-2 text-sm" />
          <button className="w-full rounded bg-primary px-3 py-2 text-sm text-white">Submit</button>
        </form>
      </div>
    );
  }

  // Container types (__body, container, 2Col, 3Col)
  const children = Array.isArray(element.content) ? element.content : [];
  const isColumn = element.type === "2Col" || element.type === "3Col";

  return (
    <div
      style={element.styles}
      className={clsx(
        "relative",
        isBody && "min-h-full",
        !previewMode && !isBody && "cursor-pointer",
        isSelected && !isBody && "ring-2 ring-primary ring-offset-1",
        isColumn && "flex gap-2",
        !previewMode && children.length === 0 && "min-h-[60px] border-2 border-dashed border-muted-foreground/20",
      )}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      draggable={!previewMode && !isBody}
      onDragStart={handleDragStart}
    >
      {isSelected && !isBody && !previewMode && (
        <div className="absolute -top-6 left-0 flex items-center gap-1 z-10">
          <Badge className="text-[10px] h-5">{element.name}</Badge>
          <button onClick={handleDelete} className="flex h-5 w-5 items-center justify-center rounded bg-destructive text-white">
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      )}
      {children.map((child) => (
        <div key={child.id} className={isColumn ? "flex-1" : ""}>
          <Recursive element={child} />
        </div>
      ))}
      {!previewMode && children.length === 0 && (
        <div className="flex h-full items-center justify-center text-[11px] text-muted-foreground/50">
          Drop here
        </div>
      )}
    </div>
  );
}

function createElementFromType(type: string): EditorElement | null {
  const id = v4();
  switch (type) {
    case "text":
      return { id, type: "text", name: "Text", styles: { color: "inherit", fontSize: "16px" }, content: { innerText: "Edit this text" } };
    case "link":
      return { id, type: "link", name: "Link", styles: { color: "#3b82f6", textDecoration: "underline" }, content: { innerText: "Click here", href: "#" } };
    case "image":
      return { id, type: "image", name: "Image", styles: { width: "100%" }, content: { src: "" } };
    case "video":
      return { id, type: "video", name: "Video", styles: { width: "100%" }, content: { src: "https://www.youtube.com/embed/dQw4w9WgXcQ" } };
    case "container":
      return { id, type: "container", name: "Container", styles: { padding: "16px" }, content: [] };
    case "2Col":
      return { id, type: "2Col", name: "2 Columns", styles: { display: "flex", gap: "8px" }, content: [
        { id: v4(), type: "container", name: "Col 1", styles: { padding: "8px", flex: "1" }, content: [] },
        { id: v4(), type: "container", name: "Col 2", styles: { padding: "8px", flex: "1" }, content: [] },
      ] };
    case "3Col":
      return { id, type: "3Col", name: "3 Columns", styles: { display: "flex", gap: "8px" }, content: [
        { id: v4(), type: "container", name: "Col 1", styles: { padding: "8px", flex: "1" }, content: [] },
        { id: v4(), type: "container", name: "Col 2", styles: { padding: "8px", flex: "1" }, content: [] },
        { id: v4(), type: "container", name: "Col 3", styles: { padding: "8px", flex: "1" }, content: [] },
      ] };
    case "contactForm":
      return { id, type: "contactForm", name: "Contact Form", styles: { padding: "16px" }, content: [] };
    default:
      return null;
  }
}

export default Recursive;
export { createElementFromType };
