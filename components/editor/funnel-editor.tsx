"use client";

import { useState, useCallback, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Undo2, Redo2, Eye, EyeOff, Laptop, Tablet, Smartphone, Type, Link2, Image, Layout, Columns2, Columns3, Video, Contact, CreditCard, ChevronRight, ChevronDown, Copy } from "lucide-react";
import { toast } from "sonner";
import { v4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { upsertFunnelPage } from "@/lib/queries";
import "./editor.css";

// ── Types ────────────────────────────────────────────────────

type El = { id: string; type: string; name: string; styles: CSSProperties; content: El[] | Record<string, string> };
type Device = "Desktop" | "Tablet" | "Mobile";

// ── Tree helpers ─────────────────────────────────────────────

function addEl(tree: El[], containerId: string, el: El): El[] {
  return tree.map((n) => {
    if (n.id === containerId && Array.isArray(n.content)) return { ...n, content: [...n.content, el] };
    if (Array.isArray(n.content)) return { ...n, content: addEl(n.content, containerId, el) };
    return n;
  });
}

function updateEl(tree: El[], updated: El): El[] {
  return tree.map((n) => {
    if (n.id === updated.id) return updated;
    if (Array.isArray(n.content)) return { ...n, content: updateEl(n.content, updated) };
    return n;
  });
}

function deleteEl(tree: El[], id: string): El[] {
  return tree.filter((n) => n.id !== id).map((n) => {
    if (Array.isArray(n.content)) return { ...n, content: deleteEl(n.content, id) };
    return n;
  });
}

function findEl(tree: El[], id: string): El | null {
  for (const n of tree) {
    if (n.id === id) return n;
    if (Array.isArray(n.content)) { const f = findEl(n.content, id); if (f) return f; }
  }
  return null;
}

function moveEl(tree: El[], elId: string, targetContainerId: string): El[] {
  const el = findEl(tree, elId);
  if (!el) return tree;
  const removed = deleteEl(tree, elId);
  return addEl(removed, targetContainerId, el);
}

function cloneEl(el: El): El {
  const id = v4();
  if (Array.isArray(el.content)) return { ...el, id, name: el.name + " copy", content: el.content.map(cloneEl) };
  return { ...el, id, name: el.name + " copy" };
}

// ── Element factory ──────────────────────────────────────────

function makeEl(type: string): El | null {
  const id = v4();
  const m: Record<string, () => El> = {
    text: () => ({ id, type: "text", name: "Text", styles: { fontSize: "16px" }, content: { innerText: "Edit this text" } }),
    link: () => ({ id, type: "link", name: "Link", styles: { color: "#6366f1", textDecoration: "underline" }, content: { innerText: "Click here", href: "#" } }),
    image: () => ({ id, type: "image", name: "Image", styles: { width: "100%" }, content: { src: "" } }),
    video: () => ({ id, type: "video", name: "Video", styles: { width: "100%" }, content: { src: "https://www.youtube.com/embed/dQw4w9WgXcQ" } }),
    container: () => ({ id, type: "container", name: "Container", styles: { padding: "16px" }, content: [] }),
    "2Col": () => ({ id, type: "2Col", name: "2 Columns", styles: { display: "flex", gap: "8px" }, content: [
      { id: v4(), type: "container", name: "Col 1", styles: { flex: "1", padding: "8px" }, content: [] },
      { id: v4(), type: "container", name: "Col 2", styles: { flex: "1", padding: "8px" }, content: [] },
    ]}),
    "3Col": () => ({ id, type: "3Col", name: "3 Columns", styles: { display: "flex", gap: "8px" }, content: [
      { id: v4(), type: "container", name: "Col 1", styles: { flex: "1", padding: "8px" }, content: [] },
      { id: v4(), type: "container", name: "Col 2", styles: { flex: "1", padding: "8px" }, content: [] },
      { id: v4(), type: "container", name: "Col 3", styles: { flex: "1", padding: "8px" }, content: [] },
    ]}),
    contactForm: () => ({ id, type: "contactForm", name: "Contact Form", styles: { padding: "16px" }, content: {} }),
    paymentForm: () => ({ id, type: "paymentForm", name: "Payment", styles: { padding: "16px" }, content: {} }),
  };
  return m[type]?.() ?? null;
}

// ── Sidebar components list ──────────────────────────────────

const components = [
  { type: "text", label: "Text", icon: Type },
  { type: "link", label: "Link", icon: Link2 },
  { type: "image", label: "Image", icon: Image },
  { type: "video", label: "Video", icon: Video },
  { type: "container", label: "Container", icon: Layout },
  { type: "2Col", label: "2 Columns", icon: Columns2 },
  { type: "3Col", label: "3 Columns", icon: Columns3 },
  { type: "contactForm", label: "Contact Form", icon: Contact },
  { type: "paymentForm", label: "Payment", icon: CreditCard },
];

// ── CSS property groups ──────────────────────────────────────

const propGroups = [
  { title: "Typography", props: ["fontSize", "fontWeight", "color", "textAlign", "lineHeight"] },
  { title: "Spacing", props: ["padding", "margin", "paddingTop", "paddingBottom", "paddingLeft", "paddingRight"] },
  { title: "Size", props: ["width", "height", "maxWidth", "minHeight"] },
  { title: "Background", props: ["backgroundColor", "backgroundImage"] },
  { title: "Border", props: ["borderRadius", "borderWidth", "borderColor"] },
  { title: "Layout", props: ["display", "flexDirection", "justifyContent", "alignItems", "gap", "opacity"] },
];

// ── Default body ─────────────────────────────────────────────

const defaultBody: El = { id: "__body", type: "__body", name: "Body", styles: { minHeight: "100vh" }, content: [] };

// ── Main Editor ──────────────────────────────────────────────

type Props = { pageId: string; pageName: string; funnelId: string; subAccountId: string; initialContent: string | null };

export default function FunnelEditor({ pageId, pageName, funnelId, subAccountId, initialContent }: Props) {
  const router = useRouter();

  // State
  const [elements, setElements] = useState<El[]>(() => {
    if (initialContent) { try { const p = JSON.parse(initialContent); if (Array.isArray(p) && p.length) return p; } catch {} }
    return [defaultBody];
  });
  const [selected, setSelected] = useState<El | null>(null);
  const [device, setDevice] = useState<Device>("Desktop");
  const [preview, setPreview] = useState(false);
  const [history, setHistory] = useState<El[][]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<El | null>(null);

  // History
  const pushHistory = useCallback((prev: El[]) => {
    setHistory((h) => [...h.slice(0, historyIdx + 1), prev]);
    setHistoryIdx((i) => i + 1);
  }, [historyIdx]);

  const undo = () => {
    if (historyIdx < 0) return;
    const prev = history[historyIdx];
    setElements(prev);
    setHistoryIdx((i) => i - 1);
    setSelected(null);
  };

  const redo = () => {
    if (historyIdx >= history.length - 1) return;
    const next = history[historyIdx + 2] || history[historyIdx + 1];
    if (next) { setElements(next); setHistoryIdx((i) => i + 1); }
  };

  // Actions
  const doAdd = (containerId: string, type: string) => {
    const el = makeEl(type);
    if (!el) return;
    pushHistory(elements);
    setElements((prev) => addEl(prev, containerId, el));
    setDirty(true);
  };

  const doUpdate = (updated: El) => {
    pushHistory(elements);
    setElements((prev) => updateEl(prev, updated));
    if (selected?.id === updated.id) setSelected(updated);
    setDirty(true);
  };

  const doDelete = (id: string) => {
    pushHistory(elements);
    setElements((prev) => deleteEl(prev, id));
    setSelected(null);
    setDirty(true);
  };

  const doMove = (elId: string, targetId: string) => {
    if (elId === targetId) return;
    pushHistory(elements);
    setElements((prev) => moveEl(prev, elId, targetId));
    setDirty(true);
  };

  const doDuplicate = () => {
    if (!selected || selected.type === "__body") return;
    const clone = cloneEl(selected);
    // Find parent container and add clone there
    pushHistory(elements);
    setElements((prev) => {
      const addToParent = (tree: El[]): El[] => tree.map((n) => {
        if (Array.isArray(n.content)) {
          const idx = n.content.findIndex((c) => c.id === selected.id);
          if (idx >= 0) return { ...n, content: [...n.content.slice(0, idx + 1), clone, ...n.content.slice(idx + 1)] };
          return { ...n, content: addToParent(n.content) };
        }
        return n;
      });
      return addToParent(prev);
    });
    setSelected(clone);
    setDirty(true);
  };

  const handleSave = async () => {
    try {
      await upsertFunnelPage({ id: pageId, name: pageName, funnelId, order: 0, content: JSON.stringify(elements) });
      toast.success("Saved");
      setDirty(false);
    } catch { toast.error("Could not save"); }
  };

  // Keyboard
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "z") { e.preventDefault(); e.shiftKey ? redo() : undo(); }
    if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); handleSave(); }
    if ((e.metaKey || e.ctrlKey) && e.key === "d") { e.preventDefault(); doDuplicate(); }
    if ((e.metaKey || e.ctrlKey) && e.key === "c" && selected && selected.type !== "__body") { e.preventDefault(); setClipboard(selected); toast.success("Copied"); }
    if ((e.metaKey || e.ctrlKey) && e.key === "v" && clipboard) {
      e.preventDefault();
      const target = selected && Array.isArray(selected.content) ? selected.id : "__body";
      const clone = cloneEl(clipboard);
      pushHistory(elements);
      setElements((prev) => addEl(prev, target, clone));
      setDirty(true);
    }
    if ((e.key === "Delete" || e.key === "Backspace") && selected && selected.type !== "__body") {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      doDelete(selected.id);
    }
    if (e.key === "Escape") setSelected(null);
  }, [selected, elements]);

  // ── Render element (recursive) ─────────────────────────────

  function R({ el }: { el: El }): ReactNode {
    const isSel = selected?.id === el.id;
    const isBody = el.type === "__body";
    const isContainer = Array.isArray(el.content);

    const isHov = !preview && hovered === el.id && !isSel;

    const elClass = `editor-el${isBody ? " is-body" : ""}${isSel && !preview ? " is-selected" : ""}${!preview && dropTarget === el.id && isContainer ? " is-drop-target" : ""}${isHov ? " is-hovered" : ""}`;

    const wrapStyle: CSSProperties = {
      ...el.styles,
    };

    const handleClick = (e: React.MouseEvent) => { e.stopPropagation(); if (!preview) setSelected(el); };
    const handleMouseEnter = () => { if (!preview) setHovered(el.id); };
    const handleMouseLeave = () => { if (hovered === el.id) setHovered(null); };
    const handleDragOver = (e: React.DragEvent) => {
      if (isContainer) { e.preventDefault(); e.stopPropagation(); setDropTarget(el.id); }
    };
    const handleDragLeave = () => { if (dropTarget === el.id) setDropTarget(null); };
    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault(); e.stopPropagation();
      setDropTarget(null);
      const type = e.dataTransfer.getData("componentType");
      const moveId = e.dataTransfer.getData("moveElementId");
      if (type && isContainer) doAdd(el.id, type);
      else if (moveId && isContainer) doMove(moveId, el.id);
    };
    const handleDragStart = (e: React.DragEvent) => {
      if (isBody || preview) return;
      e.stopPropagation();
      e.dataTransfer.setData("moveElementId", el.id);
    };

    // Static elements
    if (el.type === "text") {
      const c = el.content as Record<string, string>;
      return (
        <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {isSel && !preview && <SelectBadge name={el.name} onDelete={() => doDelete(el.id)} />}
          {isHov && <HoverBadge name={el.name} />}
          {isSel && !preview ? (
            <span contentEditable suppressContentEditableWarning onBlur={(e) => doUpdate({ ...el, content: { ...c, innerText: (e.target as HTMLElement).innerText } })} style={{ outline: "none", display: "block", minHeight: 20 }}>
              {c.innerText || ""}
            </span>
          ) : (
            <span>{c.innerText || "Text"}</span>
          )}
        </div>
      );
    }

    if (el.type === "link") {
      const c = el.content as Record<string, string>;
      return (
        <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {isSel && !preview && <SelectBadge name={el.name} onDelete={() => doDelete(el.id)} />}
          {isHov && <HoverBadge name={el.name} />}
          <a href={preview ? c.href : undefined} style={{ color: "inherit" }}>{c.innerText || "Link"}</a>
        </div>
      );
    }

    if (el.type === "image") {
      const c = el.content as Record<string, string>;
      return (
        <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {isSel && !preview && <SelectBadge name={el.name} onDelete={() => doDelete(el.id)} />}
          {isHov && <HoverBadge name={el.name} />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.src || "https://placehold.co/600x300/111/333?text=Image"} alt={el.name} style={{ width: "100%", display: "block" }} />
        </div>
      );
    }

    if (el.type === "video") {
      const c = el.content as Record<string, string>;
      return (
        <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {isSel && !preview && <SelectBadge name={el.name} onDelete={() => doDelete(el.id)} />}
          {isHov && <HoverBadge name={el.name} />}
          <iframe src={c.src} style={{ width: "100%", aspectRatio: "16/9", border: 0 }} allowFullScreen />
        </div>
      );
    }

    if (el.type === "contactForm") {
      return (
        <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {isSel && !preview && <SelectBadge name="Contact Form" onDelete={() => doDelete(el.id)} />}
          {isHov && <HoverBadge name="Contact Form" />}
          <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input placeholder="Name" className="editor-form-input" />
            <input placeholder="Email" className="editor-form-input" />
            <button className="editor-form-submit">Submit</button>
          </form>
        </div>
      );
    }

    if (el.type === "paymentForm") {
      return (
        <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {isSel && !preview && <SelectBadge name="Payment" onDelete={() => doDelete(el.id)} />}
          {isHov && <HoverBadge name="Payment" />}
          <div style={{ padding: 16, border: "1px solid var(--border)", borderRadius: 8, textAlign: "center", fontSize: 13 }} className="text-muted-foreground">
            <div style={{ height: 40, borderRadius: 6, marginBottom: 8 }} className="bg-muted" />
            <button className="editor-form-submit">Pay Now</button>
            <p style={{ marginTop: 8, fontSize: 10 }} className="text-muted-foreground/60">Powered by Stripe</p>
          </div>
        </div>
      );
    }

    // Containers
    const children = Array.isArray(el.content) ? el.content : [];
    const isEmpty = children.length === 0;

    return (
      <div className={elClass} style={wrapStyle} onClick={handleClick} onDragOver={handleDragOver} onDrop={handleDrop} onDragLeave={handleDragLeave} draggable={!isBody && !preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {isSel && !isBody && !preview && <SelectBadge name={el.name} onDelete={() => doDelete(el.id)} />}
        {isHov && !isBody && <HoverBadge name={el.name} />}
        {children.map((child) => <R key={child.id} el={child} />)}
        {isEmpty && !preview && (
          <div onDragOver={handleDragOver} onDrop={handleDrop} onDragLeave={handleDragLeave} className={`editor-dropzone ${isBody ? "body" : "child"} ${dropTarget === el.id ? "active" : ""}`}>
            {isBody ? "Drag a component here to start building" : "Drop here"}
          </div>
        )}
      </div>
    );
  }

  // ── Layout ─────────────────────────────────────────────────

  const body = elements[0];
  const deviceWidth = device === "Desktop" ? "100%" : device === "Tablet" ? 768 : 420;

  return (
    <div className="editor-root" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Toolbar */}
      {!preview && (
        <div className="editor-toolbar">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Button asChild variant="ghost" size="icon-xs"><Link href={`/sub-account/${subAccountId}/funnels/${funnelId}`}><ArrowLeft /></Link></Button>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{pageName}</span>
          </div>
          <div className="editor-device-toggle">
            {([["Desktop", Laptop], ["Tablet", Tablet], ["Mobile", Smartphone]] as const).map(([d, Icon]) => (
              <button key={d} onClick={() => setDevice(d as Device)} className={`editor-device-btn ${device === d ? "active" : ""}`}>
                <Icon size={14} />
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Button variant="ghost" size="icon-xs" onClick={() => setPreview(true)}><Eye /></Button>
            <Separator orientation="vertical" className="h-5" />
            <Button variant="ghost" size="icon-xs" onClick={undo} disabled={historyIdx < 0}><Undo2 /></Button>
            <Button variant="ghost" size="icon-xs" onClick={redo} disabled={historyIdx >= history.length - 1}><Redo2 /></Button>
            <Separator orientation="vertical" className="h-5" />
            <Button size="sm" onClick={handleSave} className="gap-1 text-[12px] relative">
              <Save className="h-3.5 w-3.5" /> Save
              {dirty && <span className="editor-dirty-dot" />}
            </Button>
          </div>
        </div>
      )}

      <div className="editor-body">
        {/* Sidebar */}
        {!preview && (
          <div className="editor-sidebar">
            <div className="editor-sidebar-header">Components</div>
            <ScrollArea className="flex-1">
              <div style={{ padding: "0 8px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
                {components.map(({ type, label, icon: Icon }) => (
                  <div key={type} draggable onDragStart={(e) => e.dataTransfer.setData("componentType", type)} className="editor-component-item">
                    <Icon size={14} /> {label}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Layers */}
            <div className="border-t">
              <div className="editor-sidebar-header">Layers</div>
              <ScrollArea style={{ maxHeight: 200 }}>
                <div style={{ padding: "0 8px 8px" }}>
                  {body && <LayerTree el={body} depth={0} selected={selected} onSelect={setSelected} />}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}

        {/* Canvas */}
        <div className={`editor-canvas ${preview ? "preview" : ""}`} onClick={() => !preview && setSelected(null)}>
          <div className="editor-canvas-inner" style={{ maxWidth: deviceWidth }}>
            {body && <R el={body} />}
          </div>
        </div>

        {/* Properties */}
        {!preview && selected && (
          <div className="editor-props">
            <div className="editor-props-header">
              <div style={{ fontSize: 12, fontWeight: 500 }}>{selected.name}</div>
              <div style={{ fontSize: 10 }} className="text-muted-foreground">{selected.type}</div>
            </div>

            {/* Content editor */}
            {!Array.isArray(selected.content) && (
              <div className="editor-props-section">
                <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }} className="text-muted-foreground">Content</div>
                {Object.entries(selected.content as Record<string, string>).map(([key, val]) => (
                  <div key={key} style={{ marginBottom: 6 }}>
                    <label className="editor-prop-label">{key}</label>
                    <Input value={val} onChange={(e) => doUpdate({ ...selected, content: { ...(selected.content as Record<string, string>), [key]: e.target.value } })} className="h-7 text-[11px]" />
                  </div>
                ))}
              </div>
            )}

            {/* Style editor */}
            <div style={{ padding: "8px 12px" }}>
              {propGroups.map((g) => (
                <PropGroup key={g.title} title={g.title} props={g.props} selected={selected} onUpdate={doUpdate} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Preview exit */}
      {preview && (
        <button onClick={() => setPreview(false)} className="editor-preview-exit">
          <EyeOff size={14} /> Exit Preview
        </button>
      )}
    </div>
  );
}

// ── Small components ─────────────────────────────────────────

function SelectBadge({ name, onDelete }: { name: string; onDelete: () => void }) {
  return (
    <div className="editor-badge-select">
      <span className="editor-badge-select-name">{name}</span>
      <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="editor-badge-select-delete">
        <Trash2 size={10} />
      </button>
    </div>
  );
}

function HoverBadge({ name }: { name: string }) {
  return (
    <div className="editor-badge-hover">
      <span className="editor-badge-hover-name">{name}</span>
    </div>
  );
}

const colorProps = new Set(["color", "backgroundColor", "borderColor"]);

function PropGroup({ title, props, selected, onUpdate }: { title: string; props: string[]; selected: El; onUpdate: (el: El) => void }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginBottom: 4 }}>
      <button onClick={() => setOpen(!open)} className="editor-prop-group-toggle">
        {open ? <ChevronDown size={10} /> : <ChevronRight size={10} />} {title}
      </button>
      {open && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, paddingBottom: 8 }}>
          {props.map((p) => {
            const val = String((selected.styles as Record<string, unknown>)[p] ?? "");
            const isColor = colorProps.has(p);
            return (
              <div key={p}>
                <label className="editor-prop-label">{p.replace(/([A-Z])/g, " $1")}</label>
                <div style={{ display: "flex", gap: 2 }}>
                  {isColor && (
                    <input type="color" value={val || "#000000"} onChange={(e) => onUpdate({ ...selected, styles: { ...selected.styles, [p]: e.target.value } as CSSProperties })} className="editor-color-picker" />
                  )}
                  <Input value={val} onChange={(e) => onUpdate({ ...selected, styles: { ...selected.styles, [p]: e.target.value } as CSSProperties })} className="h-6 text-[10px] flex-1" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LayerTree({ el, depth, selected, onSelect }: { el: El; depth: number; selected: El | null; onSelect: (el: El) => void }) {
  const children = Array.isArray(el.content) ? el.content : [];
  const isSel = selected?.id === el.id;
  return (
    <div>
      <button onClick={() => onSelect(el)} className={`editor-layer-btn ${isSel ? "active" : ""}`} style={{ paddingLeft: depth * 12 + 6 }}>
        {children.length > 0 && <ChevronRight size={10} />}
        {el.name}
      </button>
      {children.map((c) => <LayerTree key={c.id} el={c} depth={depth + 1} selected={selected} onSelect={onSelect} />)}
    </div>
  );
}
