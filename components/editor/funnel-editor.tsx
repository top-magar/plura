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

    const wrapStyle: CSSProperties = {
      ...el.styles,
      position: "relative" as const,
      outline: !preview && isSel ? "2px solid hsl(var(--primary))" : !preview && dropTarget === el.id && isContainer ? "2px dashed hsl(var(--primary))" : isHov ? "1px dashed hsl(var(--border))" : undefined,
      outlineOffset: !preview && (isSel || dropTarget === el.id) ? 2 : isHov ? 1 : undefined,
      cursor: !preview && !isBody ? "pointer" : undefined,
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
        <div style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
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
        <div style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {isSel && !preview && <SelectBadge name={el.name} onDelete={() => doDelete(el.id)} />}
          {isHov && <HoverBadge name={el.name} />}
          <a href={preview ? c.href : undefined} style={{ color: "inherit" }}>{c.innerText || "Link"}</a>
        </div>
      );
    }

    if (el.type === "image") {
      const c = el.content as Record<string, string>;
      return (
        <div style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
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
        <div style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {isSel && !preview && <SelectBadge name={el.name} onDelete={() => doDelete(el.id)} />}
          {isHov && <HoverBadge name={el.name} />}
          <iframe src={c.src} style={{ width: "100%", aspectRatio: "16/9", border: 0 }} allowFullScreen />
        </div>
      );
    }

    if (el.type === "contactForm") {
      return (
        <div style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {isSel && !preview && <SelectBadge name="Contact Form" onDelete={() => doDelete(el.id)} />}
          {isHov && <HoverBadge name="Contact Form" />}
          <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input placeholder="Name" style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #333", background: "#111", color: "#fff" }} />
            <input placeholder="Email" style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #333", background: "#111", color: "#fff" }} />
            <button style={{ padding: "10px", borderRadius: 6, background: "#6366f1", color: "#fff", border: 0, cursor: "pointer" }}>Submit</button>
          </form>
        </div>
      );
    }

    if (el.type === "paymentForm") {
      return (
        <div style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {isSel && !preview && <SelectBadge name="Payment" onDelete={() => doDelete(el.id)} />}
          {isHov && <HoverBadge name="Payment" />}
          <div style={{ padding: 16, border: "1px solid #333", borderRadius: 8, textAlign: "center", color: "#666", fontSize: 13 }}>
            <div style={{ height: 40, background: "#1a1a1a", borderRadius: 6, marginBottom: 8 }} />
            <button style={{ width: "100%", padding: 10, borderRadius: 6, background: "#6366f1", color: "#fff", border: 0 }}>Pay Now</button>
            <p style={{ marginTop: 8, fontSize: 10, color: "#555" }}>Powered by Stripe</p>
          </div>
        </div>
      );
    }

    // Containers
    const children = Array.isArray(el.content) ? el.content : [];
    const isEmpty = children.length === 0;

    return (
      <div style={wrapStyle} onClick={handleClick} onDragOver={handleDragOver} onDrop={handleDrop} onDragLeave={handleDragLeave} draggable={!isBody && !preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {isSel && !isBody && !preview && <SelectBadge name={el.name} onDelete={() => doDelete(el.id)} />}
        {isHov && !isBody && <HoverBadge name={el.name} />}
        {children.map((child) => <R key={child.id} el={child} />)}
        {isEmpty && !preview && (
          <div onDragOver={handleDragOver} onDrop={handleDrop} onDragLeave={handleDragLeave} className={`flex items-center justify-center rounded-lg border-2 border-dashed text-xs transition-colors ${dropTarget === el.id ? "border-primary text-primary" : "border-border text-muted-foreground"}`} style={{ minHeight: isBody ? "calc(100vh - 48px)" : 60, margin: isBody ? 0 : undefined }}>
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
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }} className="bg-background text-foreground" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Toolbar */}
      {!preview && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px", flexShrink: 0 }} className="border-b bg-card">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Button asChild variant="ghost" size="icon-xs"><Link href={`/sub-account/${subAccountId}/funnels/${funnelId}`}><ArrowLeft /></Link></Button>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{pageName}</span>
          </div>
          <div className="flex gap-0.5 border rounded-lg p-0.5">
            {([["Desktop", Laptop], ["Tablet", Tablet], ["Mobile", Smartphone]] as const).map(([d, Icon]) => (
              <button key={d} onClick={() => setDevice(d as Device)} className={`p-1 px-2 rounded-md flex items-center cursor-pointer ${device === d ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
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
              {dirty && <span style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} />}
            </Button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        {!preview && (
          <div style={{ width: 220, flexShrink: 0, display: "flex", flexDirection: "column" }} className="border-r bg-card">
            <div style={{ padding: "8px 12px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }} className="text-muted-foreground">Components</div>
            <ScrollArea className="flex-1">
              <div style={{ padding: "0 8px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
                {components.map(({ type, label, icon: Icon }) => (
                  <div key={type} draggable onDragStart={(e) => e.dataTransfer.setData("componentType", type)} className="flex items-center gap-2 p-2 px-2.5 rounded-md border text-xs cursor-grab text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                    <Icon size={14} className="text-muted-foreground/60" /> {label}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Layers */}
            <div className="border-t">
              <div style={{ padding: "8px 12px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }} className="text-muted-foreground">Layers</div>
              <ScrollArea style={{ maxHeight: 200 }}>
                <div style={{ padding: "0 8px 8px" }}>
                  {body && <LayerTree el={body} depth={0} selected={selected} onSelect={setSelected} />}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}

        {/* Canvas */}
        <div style={{ flex: 1, overflow: "auto", padding: preview ? 0 : 16 }} className="bg-muted/30" onClick={() => !preview && setSelected(null)}>
          <div style={{ maxWidth: deviceWidth, margin: "0 auto", minHeight: "100%", transition: "max-width 0.3s" }} className="bg-background shadow-lg">
            {body && <R el={body} />}
          </div>
        </div>

        {/* Properties */}
        {!preview && selected && (
          <div style={{ width: 260, flexShrink: 0, overflow: "auto" }} className="border-l bg-card">
            <div style={{ padding: "8px 12px" }} className="border-b">
              <div style={{ fontSize: 12, fontWeight: 500 }}>{selected.name}</div>
              <div style={{ fontSize: 10 }} className="text-muted-foreground">{selected.type}</div>
            </div>

            {/* Content editor */}
            {!Array.isArray(selected.content) && (
              <div style={{ padding: "8px 12px" }} className="border-b">
                <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }} className="text-muted-foreground">Content</div>
                {Object.entries(selected.content as Record<string, string>).map(([key, val]) => (
                  <div key={key} style={{ marginBottom: 6 }}>
                    <label style={{ fontSize: 10, display: "block", marginBottom: 2 }} className="text-muted-foreground">{key}</label>
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
        <button onClick={() => setPreview(false)} className="fixed top-4 left-4 z-[100] px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs flex items-center gap-1 cursor-pointer border-0">
          <EyeOff size={14} /> Exit Preview
        </button>
      )}
    </div>
  );
}

// ── Small components ─────────────────────────────────────────

function SelectBadge({ name, onDelete }: { name: string; onDelete: () => void }) {
  return (
    <div style={{ position: "absolute", top: -24, left: 0, display: "flex", gap: 4, zIndex: 10 }}>
      <span className="bg-primary text-primary-foreground" style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, whiteSpace: "nowrap" }}>{name}</span>
      <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="bg-destructive text-destructive-foreground" style={{ width: 20, height: 20, borderRadius: 4, border: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Trash2 size={10} />
      </button>
    </div>
  );
}

function HoverBadge({ name }: { name: string }) {
  return (
    <div style={{ position: "absolute", top: -18, left: 0, zIndex: 9, pointerEvents: "none" }}>
      <span className="bg-muted text-muted-foreground" style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, whiteSpace: "nowrap" }}>{name}</span>
    </div>
  );
}

const colorProps = new Set(["color", "backgroundColor", "borderColor"]);

function PropGroup({ title, props, selected, onUpdate }: { title: string; props: string[]; selected: El; onUpdate: (el: El) => void }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginBottom: 4 }}>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1 w-full py-1 border-0 bg-transparent text-muted-foreground text-[10px] font-semibold uppercase cursor-pointer tracking-wide">
        {open ? <ChevronDown size={10} /> : <ChevronRight size={10} />} {title}
      </button>
      {open && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, paddingBottom: 8 }}>
          {props.map((p) => {
            const val = String((selected.styles as Record<string, unknown>)[p] ?? "");
            const isColor = colorProps.has(p);
            return (
              <div key={p}>
                <label style={{ fontSize: 9, display: "block" }} className="text-muted-foreground/70">{p.replace(/([A-Z])/g, " $1")}</label>
                <div style={{ display: "flex", gap: 2 }}>
                  {isColor && (
                    <input type="color" value={val || "#000000"} onChange={(e) => onUpdate({ ...selected, styles: { ...selected.styles, [p]: e.target.value } as CSSProperties })} className="border rounded cursor-pointer" style={{ width: 24, height: 24, padding: 0, background: "transparent" }} />
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
      <button onClick={() => onSelect(el)} className={`flex items-center gap-1 w-full rounded text-[11px] cursor-pointer text-left ${isSel ? "bg-primary/10 text-primary" : "text-muted-foreground"}`} style={{ padding: "3px 6px", paddingLeft: depth * 12 + 6, border: 0, background: isSel ? undefined : "transparent" }}>
        {children.length > 0 && <ChevronRight size={10} />}
        {el.name}
      </button>
      {children.map((c) => <LayerTree key={c.id} el={c} depth={depth + 1} selected={selected} onSelect={onSelect} />)}
    </div>
  );
}
