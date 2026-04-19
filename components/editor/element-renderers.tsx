"use client";

import { useState, type ReactNode } from "react";
import { useEditor } from "./editor-provider";
import ElementWrapper from "./element-wrapper";
import { makeEl } from "./element-factory";
import type { El } from "./types";

export function ElementRenderer({ el }: { el: El }): ReactNode {
  const { state, dispatch } = useEditor();
  const { preview } = state.editor;
  const isContainer = Array.isArray(el.content);

  // ── Text (contentEditable) ──
  if (el.type === "text") {
    const c = el.content as Record<string, string>;
    const isSel = state.editor.selected?.id === el.id;
    return (
      <ElementWrapper element={el} style={el.styles}>
        {isSel && !preview ? (
          <span contentEditable suppressContentEditableWarning onBlur={(e) => dispatch({ type: "UPDATE_ELEMENT", payload: { element: { ...el, content: { ...c, innerText: (e.target as HTMLElement).innerText } } } })} style={{ outline: "none", display: "block", minHeight: 20 }}>
            {c.innerText || ""}
          </span>
        ) : (
          <span>{c.innerText || "Text"}</span>
        )}
      </ElementWrapper>
    );
  }

  if (el.type === "link") {
    const c = el.content as Record<string, string>;
    return (
      <ElementWrapper element={el} style={el.styles}>
        <a href={preview ? c.href : undefined} style={{ color: "inherit" }}>{c.innerText || "Link"}</a>
      </ElementWrapper>
    );
  }

  if (el.type === "image") {
    const c = el.content as Record<string, string>;
    return (
      <ElementWrapper element={el} style={el.styles}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={c.src || "https://placehold.co/600x300/111/333?text=Image"} alt={el.name} style={{ width: "100%", display: "block" }} />
      </ElementWrapper>
    );
  }

  if (el.type === "video") {
    const c = el.content as Record<string, string>;
    return (
      <ElementWrapper element={el} style={el.styles}>
        <iframe src={c.src} style={{ width: "100%", aspectRatio: "16/9", border: 0 }} allowFullScreen />
      </ElementWrapper>
    );
  }

  if (el.type === "button") {
    const c = el.content as Record<string, string>;
    return (
      <ElementWrapper element={el} style={el.styles}>
        <a href={preview ? c.href : undefined} style={{ display: "block", textDecoration: "none", color: "inherit" }}>{c.innerText || "Button"}</a>
      </ElementWrapper>
    );
  }

  if (el.type === "divider") {
    return (
      <ElementWrapper element={el} style={el.styles}>
        <hr style={{ border: "none", borderTop: "inherit" }} />
      </ElementWrapper>
    );
  }

  if (el.type === "spacer") {
    return (
      <ElementWrapper element={el} style={el.styles}>
        {!preview && <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 10, color: "var(--ed-text-placeholder)" }}>spacer</div>}
      </ElementWrapper>
    );
  }

  if (el.type === "quote") {
    const c = el.content as Record<string, string>;
    return (
      <ElementWrapper element={el} style={el.styles}>
        <blockquote style={{ margin: 0 }}>{c.innerText || "Quote"}</blockquote>
      </ElementWrapper>
    );
  }

  if (el.type === "badge") {
    const c = el.content as Record<string, string>;
    return (
      <ElementWrapper element={el} style={el.styles}>
        <span>{c.innerText || "Badge"}</span>
      </ElementWrapper>
    );
  }

  if (el.type === "list") {
    const c = el.content as Record<string, string>;
    const items = (c.innerText || "").split("\n").filter(Boolean);
    return (
      <ElementWrapper element={el} style={{ ...el.styles, listStyleType: "disc" }}>
        <ul style={{ margin: 0, paddingLeft: "inherit" }}>
          {items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </ElementWrapper>
    );
  }

  if (el.type === "code") {
    const c = el.content as Record<string, string>;
    return (
      <ElementWrapper element={el} style={el.styles}>
        <code>{c.innerText || "// code"}</code>
      </ElementWrapper>
    );
  }

  if (el.type === "icon") {
    const c = el.content as Record<string, string>;
    return (
      <ElementWrapper element={el} style={el.styles}>
        <span>{c.innerText || "★"}</span>
      </ElementWrapper>
    );
  }

  if (el.type === "accordion") {
    const c = el.content as Record<string, string>;
    const items: { title: string; body: string }[] = (() => { try { return JSON.parse(c.items || "[]"); } catch { return []; } })();
    return (
      <ElementWrapper element={el} style={el.styles}>
        {items.map((item, i) => (
          <details key={i} style={{ borderBottom: "1px solid var(--ed-border-subtle)", padding: "12px 0" }}>
            <summary style={{ cursor: "pointer", fontWeight: 500, fontSize: 14 }}>{item.title}</summary>
            <p style={{ marginTop: 8, fontSize: 13, opacity: 0.7 }}>{item.body}</p>
          </details>
        ))}
      </ElementWrapper>
    );
  }

  if (el.type === "countdown") {
    return (
      <ElementWrapper element={el} style={el.styles}>
        <CountdownDisplay content={el.content as Record<string, string>} />
      </ElementWrapper>
    );
  }

  if (el.type === "tabs") {
    const c = el.content as Record<string, string>;
    const items: { title: string; body: string }[] = (() => { try { return JSON.parse(c.items || "[]"); } catch { return []; } })();
    return (
      <ElementWrapper element={el} style={el.styles}>
        <TabsDisplay items={items} />
      </ElementWrapper>
    );
  }

  if (el.type === "navbar") {
    const c = el.content as Record<string, string>;
    return (
      <ElementWrapper element={el} style={el.styles}>
        <span style={{ fontWeight: 700, fontSize: 16 }}>{c.brand || "Brand"}</span>
        <div style={{ display: "flex", gap: 16, fontSize: 14 }}>
          {(c.links || "").split(",").map((l, i) => <a key={i} href="#" style={{ opacity: 0.7 }}>{l.trim()}</a>)}
        </div>
      </ElementWrapper>
    );
  }

  if (el.type === "embed") {
    const c = el.content as Record<string, string>;
    return (
      <ElementWrapper element={el} style={el.styles}>
        <div dangerouslySetInnerHTML={{ __html: c.code || "" }} />
      </ElementWrapper>
    );
  }

  if (el.type === "socialIcons") {
    const c = el.content as Record<string, string>;
    return (
      <ElementWrapper element={el} style={el.styles}>
        {(c.platforms || "").split(",").map((p, i) => <span key={i} style={{ opacity: 0.6 }}>{p.trim()}</span>)}
      </ElementWrapper>
    );
  }

  if (el.type === "map") {
    const c = el.content as Record<string, string>;
    return (
      <ElementWrapper element={el} style={el.styles}>
        <iframe src={`https://maps.google.com/maps?q=${encodeURIComponent(c.address || "New York")}&z=${c.zoom || "13"}&output=embed`} style={{ width: "100%", height: "100%", border: 0 }} />
      </ElementWrapper>
    );
  }

  if (el.type === "gallery") {
    const c = el.content as Record<string, string>;
    const imgs = (c.images || "").split(",").filter(Boolean);
    return (
      <ElementWrapper element={el} style={el.styles}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {imgs.map((src, i) => <img key={i} src={src.trim()} alt={`Gallery ${i + 1}`} style={{ width: "100%", display: "block" }} />)}
      </ElementWrapper>
    );
  }

  if (el.type === "contactForm") {
    return (
      <ElementWrapper element={el} style={el.styles}>
        <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input placeholder="Name" className="editor-form-input" />
          <input placeholder="Email" className="editor-form-input" />
          <button className="editor-form-submit">Submit</button>
        </form>
      </ElementWrapper>
    );
  }

  if (el.type === "paymentForm") {
    return (
      <ElementWrapper element={el} style={el.styles}>
        <div style={{ padding: 16, border: "1px solid var(--border)", borderRadius: 8, textAlign: "center", fontSize: 13 }} className="text-muted-foreground">
          <div style={{ height: 40, borderRadius: 6, marginBottom: 8 }} className="bg-muted" />
          <button className="editor-form-submit">Pay Now</button>
          <p style={{ marginTop: 8, fontSize: 10 }} className="text-muted-foreground/60">Powered by Stripe</p>
        </div>
      </ElementWrapper>
    );
  }

  // ── Containers (section, container, row, col, __body, etc.) ──
  const children = Array.isArray(el.content) ? el.content : [];
  const isEmpty = children.length === 0;
  const isBody = el.type === "__body";
  const { dropTarget } = state.editor;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    dispatch({ type: "SET_DROP_TARGET", payload: { id: null } });
    const type = e.dataTransfer.getData("componentType");
    const moveId = e.dataTransfer.getData("moveElementId");
    if (type) { const newEl = makeEl(type); if (newEl) dispatch({ type: "ADD_ELEMENT", payload: { containerId: el.id, element: newEl } }); }
    else if (moveId) dispatch({ type: "MOVE_ELEMENT", payload: { elId: moveId, targetContainerId: el.id } });
  };

  return (
    <ElementWrapper element={el} style={el.styles} isContainer>
      <div onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }} style={{ display: "contents" }}>
        {children.map((child) => <ElementRenderer key={child.id} el={child} />)}
        {isEmpty && !preview && (
          <div className={`editor-dropzone ${isBody ? "body" : "child"} ${dropTarget === el.id ? "active" : ""}`}>
            {isBody ? "Drag a component here to start building" : "Drop here"}
          </div>
        )}
      </div>
    </ElementWrapper>
  );
}

// ── Helper components ──

export function CountdownDisplay({ content }: { content: Record<string, string> }) {
  const [now, setNow] = useState(Date.now());
  const target = new Date(content.targetDate || Date.now()).getTime();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useState(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); });
  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const units = [["Days", d], ["Hours", h], ["Min", m], ["Sec", s]] as const;
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
      {units.map(([label, val]) => (
        <div key={label} style={{ textAlign: "center" }}>
          <div style={{ fontSize: "inherit", fontWeight: "inherit" }}>{String(val).padStart(2, "0")}</div>
          <div style={{ fontSize: 10, opacity: 0.5, marginTop: 4 }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

export function TabsDisplay({ items }: { items: { title: string; body: string }[] }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div style={{ display: "flex", borderBottom: "1px solid var(--ed-border-subtle)" }}>
        {items.map((item, i) => (
          <button key={i} onClick={(e) => { e.stopPropagation(); setActive(i); }} style={{ padding: "8px 16px", border: 0, borderBottom: active === i ? "2px solid var(--ed-interactive)" : "2px solid transparent", background: "transparent", color: active === i ? "var(--ed-interactive)" : "inherit", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
            {item.title}
          </button>
        ))}
      </div>
      <div style={{ padding: 16, fontSize: 14 }}>{items[active]?.body}</div>
    </div>
  );
}
