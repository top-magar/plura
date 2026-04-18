"use client";

import { useState, useCallback, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Undo2, Redo2, Eye, EyeOff, Laptop, Tablet, Smartphone, Type, Link2, Image, Layout, Columns2, Columns3, Video, Contact, CreditCard, ChevronRight } from "lucide-react";
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
  };

  const doUpdate = (updated: El) => {
    pushHistory(elements);
    setElements((prev) => updateEl(prev, updated));
    if (selected?.id === updated.id) setSelected(updated);
  };

  const doDelete = (id: string) => {
    pushHistory(elements);
    setElements((prev) => deleteEl(prev, id));
    setSelected(null);
  };

  const handleSave = async () => {
    try {
      await upsertFunnelPage({ id: pageId, name: pageName, funnelId, order: 0, content: JSON.stringify(elements) });
      toast.success("Saved");
    } catch { toast.error("Could not save"); }
  };

  // Keyboard
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "z") { e.preventDefault(); e.shiftKey ? redo() : undo(); }
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

    const wrapStyle: CSSProperties = {
      ...el.styles,
      position: "relative" as const,
      outline: !preview && isSel ? "2px solid #6366f1" : undefined,
      outlineOffset: !preview && isSel ? 2 : undefined,
      cursor: !preview && !isBody ? "pointer" : undefined,
    };

    const handleClick = (e: React.MouseEvent) => { e.stopPropagation(); if (!preview) setSelected(el); };
    const handleDragOver = (e: React.DragEvent) => { if (isContainer) { e.preventDefault(); e.stopPropagation(); } };
    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault(); e.stopPropagation();
      const type = e.dataTransfer.getData("componentType");
      if (type && isContainer) doAdd(el.id, type);
    };

    // Static elements
    if (el.type === "text") {
      const c = el.content as Record<string, string>;
      return (
        <div style={wrapStyle} onClick={handleClick}>
          {isSel && !preview && <SelectBadge name={el.name} onDelete={() => doDelete(el.id)} />}
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
        <div style={wrapStyle} onClick={handleClick}>
          {isSel && !preview && <SelectBadge name={el.name} onDelete={() => doDelete(el.id)} />}
          <a href={preview ? c.href : undefined} style={{ color: "inherit" }}>{c.innerText || "Link"}</a>
        </div>
      );
    }

    if (el.type === "image") {
      const c = el.content as Record<string, string>;
      return (
        <div style={wrapStyle} onClick={handleClick}>
          {isSel && !preview && <SelectBadge name={el.name} onDelete={() => doDelete(el.id)} />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.src || "https://placehold.co/600x300/111/333?text=Image"} alt={el.name} style={{ width: "100%", display: "block" }} />
        </div>
      );
    }

    if (el.type === "video") {
      const c = el.content as Record<string, string>;
      return (
        <div style={wrapStyle} onClick={handleClick}>
          {isSel && !preview && <SelectBadge name={el.name} onDelete={() => doDelete(el.id)} />}
          <iframe src={c.src} style={{ width: "100%", aspectRatio: "16/9", border: 0 }} allowFullScreen />
        </div>
      );
    }

    if (el.type === "contactForm") {
      return (
        <div style={wrapStyle} onClick={handleClick}>
          {isSel && !preview && <SelectBadge name="Contact Form" onDelete={() => doDelete(el.id)} />}
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
        <div style={wrapStyle} onClick={handleClick}>
          {isSel && !preview && <SelectBadge name="Payment" onDelete={() => doDelete(el.id)} />}
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
      <div style={wrapStyle} onClick={handleClick} onDragOver={handleDragOver} onDrop={handleDrop}>
        {isSel && !isBody && !preview && <SelectBadge name={el.name} onDelete={() => doDelete(el.id)} />}
        {children.map((child) => <R key={child.id} el={child} />)}
        {isEmpty && !preview && (
          <div onDragOver={handleDragOver} onDrop={handleDrop} style={{ minHeight: isBody ? "calc(100vh - 48px)" : 60, display: "flex", alignItems: "center", justifyContent: "center", border: "2px dashed #333", borderRadius: 8, color: "#555", fontSize: 12, margin: isBody ? 0 : undefined }}>
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
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#0a0a0a", color: "#fff" }} onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Toolbar */}
      {!preview && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px", borderBottom: "1px solid #1a1a1a", flexShrink: 0, background: "#0f0f0f" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Button asChild variant="ghost" size="icon-xs"><Link href={`/sub-account/${subAccountId}/funnels/${funnelId}`}><ArrowLeft /></Link></Button>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{pageName}</span>
          </div>
          <div style={{ display: "flex", gap: 2, border: "1px solid #222", borderRadius: 8, padding: 2 }}>
            {([["Desktop", Laptop], ["Tablet", Tablet], ["Mobile", Smartphone]] as const).map(([d, Icon]) => (
              <button key={d} onClick={() => setDevice(d as Device)} style={{ padding: "4px 8px", borderRadius: 6, background: device === d ? "#6366f1" : "transparent", color: device === d ? "#fff" : "#888", border: 0, cursor: "pointer", display: "flex", alignItems: "center" }}>
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
            <Button size="sm" onClick={handleSave} className="gap-1 text-[12px]"><Save className="h-3.5 w-3.5" /> Save</Button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        {!preview && (
          <div style={{ width: 220, borderRight: "1px solid #1a1a1a", flexShrink: 0, display: "flex", flexDirection: "column", background: "#0f0f0f" }}>
            <div style={{ padding: "8px 12px", fontSize: 11, fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: 1 }}>Components</div>
            <ScrollArea className="flex-1">
              <div style={{ padding: "0 8px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
                {components.map(({ type, label, icon: Icon }) => (
                  <div key={type} draggable onDragStart={(e) => e.dataTransfer.setData("componentType", type)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 6, border: "1px solid #1a1a1a", fontSize: 12, cursor: "grab", color: "#ccc" }}>
                    <Icon size={14} style={{ color: "#666" }} /> {label}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Layers */}
            <div style={{ borderTop: "1px solid #1a1a1a" }}>
              <div style={{ padding: "8px 12px", fontSize: 11, fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: 1 }}>Layers</div>
              <ScrollArea style={{ maxHeight: 200 }}>
                <div style={{ padding: "0 8px 8px" }}>
                  {body && <LayerTree el={body} depth={0} selected={selected} onSelect={setSelected} />}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}

        {/* Canvas */}
        <div style={{ flex: 1, overflow: "auto", padding: preview ? 0 : 16, background: "#111" }} onClick={() => !preview && setSelected(null)}>
          <div style={{ maxWidth: deviceWidth, margin: "0 auto", background: "#0a0a0a", minHeight: "100%", transition: "max-width 0.3s" }}>
            {body && <R el={body} />}
          </div>
        </div>

        {/* Properties */}
        {!preview && selected && (
          <div style={{ width: 260, borderLeft: "1px solid #1a1a1a", flexShrink: 0, overflow: "auto", background: "#0f0f0f" }}>
            <div style={{ padding: "8px 12px", borderBottom: "1px solid #1a1a1a" }}>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{selected.name}</div>
              <div style={{ fontSize: 10, color: "#666" }}>{selected.type}</div>
            </div>

            {/* Content editor */}
            {!Array.isArray(selected.content) && (
              <div style={{ padding: "8px 12px", borderBottom: "1px solid #1a1a1a" }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#666", textTransform: "uppercase", marginBottom: 6 }}>Content</div>
                {Object.entries(selected.content as Record<string, string>).map(([key, val]) => (
                  <div key={key} style={{ marginBottom: 6 }}>
                    <label style={{ fontSize: 10, color: "#888", display: "block", marginBottom: 2 }}>{key}</label>
                    <Input value={val} onChange={(e) => doUpdate({ ...selected, content: { ...(selected.content as Record<string, string>), [key]: e.target.value } })} className="h-7 text-[11px]" />
                  </div>
                ))}
              </div>
            )}

            {/* Style editor */}
            <div style={{ padding: "8px 12px" }}>
              {propGroups.map((g) => (
                <div key={g.title} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#666", textTransform: "uppercase", marginBottom: 6 }}>{g.title}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                    {g.props.map((p) => (
                      <div key={p}>
                        <label style={{ fontSize: 9, color: "#555", display: "block" }}>{p.replace(/([A-Z])/g, " $1")}</label>
                        <Input value={String((selected.styles as Record<string, unknown>)[p] ?? "")} onChange={(e) => doUpdate({ ...selected, styles: { ...selected.styles, [p]: e.target.value } as CSSProperties })} className="h-6 text-[10px]" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Preview exit */}
      {preview && (
        <button onClick={() => setPreview(false)} style={{ position: "fixed", top: 16, left: 16, zIndex: 100, padding: "6px 12px", borderRadius: 8, background: "#6366f1", color: "#fff", border: 0, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
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
      <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "#6366f1", color: "#fff", whiteSpace: "nowrap" }}>{name}</span>
      <button onClick={(e) => { e.stopPropagation(); onDelete(); }} style={{ width: 20, height: 20, borderRadius: 4, background: "#ef4444", color: "#fff", border: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Trash2 size={10} />
      </button>
    </div>
  );
}

function LayerTree({ el, depth, selected, onSelect }: { el: El; depth: number; selected: El | null; onSelect: (el: El) => void }) {
  const children = Array.isArray(el.content) ? el.content : [];
  const isSel = selected?.id === el.id;
  return (
    <div>
      <button onClick={() => onSelect(el)} style={{ display: "flex", alignItems: "center", gap: 4, width: "100%", padding: "3px 6px", paddingLeft: depth * 12 + 6, borderRadius: 4, border: 0, background: isSel ? "rgba(99,102,241,0.15)" : "transparent", color: isSel ? "#818cf8" : "#888", fontSize: 11, cursor: "pointer", textAlign: "left" }}>
        {children.length > 0 && <ChevronRight size={10} />}
        {el.name}
      </button>
      {children.map((c) => <LayerTree key={c.id} el={c} depth={depth + 1} selected={selected} onSelect={onSelect} />)}
    </div>
  );
}
