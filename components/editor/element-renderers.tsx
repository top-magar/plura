"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { Trash2 } from "lucide-react";
import type { El } from "./types";

export type ElementRendererProps = {
  el: El;
  selected: El | null;
  preview: boolean;
  hovered: string | null;
  dropTarget: string | null;
  onSelect: (el: El) => void;
  onDelete: (id: string) => void;
  onUpdate: (el: El) => void;
  onAdd: (containerId: string, type: string) => void;
  onMove: (elId: string, targetId: string) => void;
  onDragStart: (e: React.DragEvent, elId: string) => void;
  setHovered: (id: string | null) => void;
  setDropTarget: (id: string | null) => void;
};

export function ElementRenderer({ el, selected, preview, hovered, dropTarget, onSelect, onDelete, onUpdate, onAdd, onMove, onDragStart, setHovered, setDropTarget }: ElementRendererProps): ReactNode {
  const isSel = selected?.id === el.id;
  const isBody = el.type === "__body";
  const isContainer = Array.isArray(el.content);
  const isHov = !preview && hovered === el.id && !isSel;

  const elClass = `editor-el${isBody ? " is-body" : ""}${isSel && !preview ? " is-selected" : ""}${!preview && dropTarget === el.id && isContainer ? " is-drop-target" : ""}${isHov ? " is-hovered" : ""}`;
  const wrapStyle: CSSProperties = { ...el.styles };

  const handleClick = (e: React.MouseEvent) => { e.stopPropagation(); if (!preview) onSelect(el); };
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
    if (type && isContainer) onAdd(el.id, type);
    else if (moveId && isContainer) onMove(moveId, el.id);
  };
  const handleElDragStart = (e: React.DragEvent) => {
    if (isBody || preview) return;
    e.stopPropagation();
    onDragStart(e, el.id);
  };

  const childProps: Omit<ElementRendererProps, "el"> = { selected, preview, hovered, dropTarget, onSelect, onDelete, onUpdate, onAdd, onMove, onDragStart, setHovered, setDropTarget };

  if (el.type === "text") {
    const c = el.content as Record<string, string>;
    return (
      <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleElDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {isSel && !preview && <SelectBadge name={el.name} onDelete={() => onDelete(el.id)} />}
        {isHov && <HoverBadge name={el.name} />}
        {isSel && !preview ? (
          <span contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate({ ...el, content: { ...c, innerText: (e.target as HTMLElement).innerText } })} style={{ outline: "none", display: "block", minHeight: 20 }}>
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
      <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleElDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {isSel && !preview && <SelectBadge name={el.name} onDelete={() => onDelete(el.id)} />}
        {isHov && <HoverBadge name={el.name} />}
        <a href={preview ? c.href : undefined} style={{ color: "inherit" }}>{c.innerText || "Link"}</a>
      </div>
    );
  }

  if (el.type === "image") {
    const c = el.content as Record<string, string>;
    return (
      <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleElDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {isSel && !preview && <SelectBadge name={el.name} onDelete={() => onDelete(el.id)} />}
        {isHov && <HoverBadge name={el.name} />}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={c.src || "https://placehold.co/600x300/111/333?text=Image"} alt={el.name} style={{ width: "100%", display: "block" }} />
      </div>
    );
  }

  if (el.type === "video") {
    const c = el.content as Record<string, string>;
    return (
      <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleElDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {isSel && !preview && <SelectBadge name={el.name} onDelete={() => onDelete(el.id)} />}
        {isHov && <HoverBadge name={el.name} />}
        <iframe src={c.src} style={{ width: "100%", aspectRatio: "16/9", border: 0 }} allowFullScreen />
      </div>
    );
  }

  if (el.type === "button") {
    const c = el.content as Record<string, string>;
    return (
      <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleElDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {isSel && !preview && <SelectBadge name={el.name} onDelete={() => onDelete(el.id)} />}
        {isHov && <HoverBadge name={el.name} />}
        <a href={preview ? c.href : undefined} style={{ display: "block", textDecoration: "none", color: "inherit" }}>{c.innerText || "Button"}</a>
      </div>
    );
  }

  if (el.type === "divider") {
    return (
      <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleElDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {isSel && !preview && <SelectBadge name={el.name} onDelete={() => onDelete(el.id)} />}
        {isHov && <HoverBadge name={el.name} />}
        <hr style={{ border: "none", borderTop: "inherit" }} />
      </div>
    );
  }

  if (el.type === "spacer") {
    return (
      <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleElDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {isSel && !preview && <SelectBadge name={el.name} onDelete={() => onDelete(el.id)} />}
        {isHov && <HoverBadge name={el.name} />}
        {!preview && <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 10, color: "var(--ed-text-placeholder)" }}>spacer</div>}
      </div>
    );
  }

  if (el.type === "quote") {
    const c = el.content as Record<string, string>;
    return (
      <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleElDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {isSel && !preview && <SelectBadge name={el.name} onDelete={() => onDelete(el.id)} />}
        {isHov && <HoverBadge name={el.name} />}
        <blockquote style={{ margin: 0 }}>{c.innerText || "Quote"}</blockquote>
      </div>
    );
  }

  if (el.type === "badge") {
    const c = el.content as Record<string, string>;
    return (
      <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleElDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {isSel && !preview && <SelectBadge name={el.name} onDelete={() => onDelete(el.id)} />}
        {isHov && <HoverBadge name={el.name} />}
        <span>{c.innerText || "Badge"}</span>
      </div>
    );
  }

  if (el.type === "list") {
    const c = el.content as Record<string, string>;
    const items = (c.innerText || "").split("\n").filter(Boolean);
    return (
      <div className={elClass} style={{ ...wrapStyle, listStyleType: "disc" }} onClick={handleClick} draggable={!preview} onDragStart={handleElDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {isSel && !preview && <SelectBadge name={el.name} onDelete={() => onDelete(el.id)} />}
        {isHov && <HoverBadge name={el.name} />}
        <ul style={{ margin: 0, paddingLeft: "inherit" }}>
          {items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </div>
    );
  }

  if (el.type === "code") {
    const c = el.content as Record<string, string>;
    return (
      <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleElDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {isSel && !preview && <SelectBadge name={el.name} onDelete={() => onDelete(el.id)} />}
        {isHov && <HoverBadge name={el.name} />}
        <code>{c.innerText || "// code"}</code>
      </div>
    );
  }

  if (el.type === "icon") {
    const c = el.content as Record<string, string>;
    return (
      <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleElDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {isSel && !preview && <SelectBadge name={el.name} onDelete={() => onDelete(el.id)} />}
        {isHov && <HoverBadge name={el.name} />}
        <span>{c.innerText || "★"}</span>
      </div>
    );
  }

  if (el.type === "accordion") {
    const c = el.content as Record<string, string>;
    const items: { title: string; body: string }[] = (() => { try { return JSON.parse(c.items || "[]"); } catch { return []; } })();
    return (
      <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleElDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {isSel && !preview && <SelectBadge name={el.name} onDelete={() => onDelete(el.id)} />}
        {isHov && <HoverBadge name={el.name} />}
        {items.map((item, i) => (
          <details key={i} style={{ borderBottom: "1px solid var(--ed-border-subtle)", padding: "12px 0" }}>
            <summary style={{ cursor: "pointer", fontWeight: 500, fontSize: 14 }}>{item.title}</summary>
            <p style={{ marginTop: 8, fontSize: 13, opacity: 0.7 }}>{item.body}</p>
          </details>
        ))}
      </div>
    );
  }

  if (el.type === "countdown") {
    return (
      <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleElDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {isSel && !preview && <SelectBadge name={el.name} onDelete={() => onDelete(el.id)} />}
        {isHov && <HoverBadge name={el.name} />}
        <CountdownDisplay content={el.content as Record<string, string>} />
      </div>
    );
  }

  if (el.type === "tabs") {
    const c = el.content as Record<string, string>;
    const items: { title: string; body: string }[] = (() => { try { return JSON.parse(c.items || "[]"); } catch { return []; } })();
    return (
      <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleElDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {isSel && !preview && <SelectBadge name={el.name} onDelete={() => onDelete(el.id)} />}
        {isHov && <HoverBadge name={el.name} />}
        <TabsDisplay items={items} />
      </div>
    );
  }

  if (el.type === "navbar") {
    const c = el.content as Record<string, string>;
    return (
      <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleElDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {isSel && !preview && <SelectBadge name={el.name} onDelete={() => onDelete(el.id)} />}
        {isHov && <HoverBadge name={el.name} />}
        <span style={{ fontWeight: 700, fontSize: 16 }}>{c.brand || "Brand"}</span>
        <div style={{ display: "flex", gap: 16, fontSize: 14 }}>
          {(c.links || "").split(",").map((l, i) => <a key={i} href="#" style={{ opacity: 0.7 }}>{l.trim()}</a>)}
        </div>
      </div>
    );
  }

  if (el.type === "embed") {
    const c = el.content as Record<string, string>;
    return (
      <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleElDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {isSel && !preview && <SelectBadge name={el.name} onDelete={() => onDelete(el.id)} />}
        {isHov && <HoverBadge name={el.name} />}
        <div dangerouslySetInnerHTML={{ __html: c.code || "" }} />
      </div>
    );
  }

  if (el.type === "socialIcons") {
    const c = el.content as Record<string, string>;
    return (
      <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleElDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {isSel && !preview && <SelectBadge name={el.name} onDelete={() => onDelete(el.id)} />}
        {isHov && <HoverBadge name={el.name} />}
        {(c.platforms || "").split(",").map((p, i) => <span key={i} style={{ opacity: 0.6 }}>{p.trim()}</span>)}
      </div>
    );
  }

  if (el.type === "map") {
    const c = el.content as Record<string, string>;
    return (
      <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleElDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {isSel && !preview && <SelectBadge name={el.name} onDelete={() => onDelete(el.id)} />}
        {isHov && <HoverBadge name={el.name} />}
        <iframe src={`https://maps.google.com/maps?q=${encodeURIComponent(c.address || "New York")}&z=${c.zoom || "13"}&output=embed`} style={{ width: "100%", height: "100%", border: 0 }} />
      </div>
    );
  }

  if (el.type === "gallery") {
    const c = el.content as Record<string, string>;
    const imgs = (c.images || "").split(",").filter(Boolean);
    return (
      <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleElDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {isSel && !preview && <SelectBadge name={el.name} onDelete={() => onDelete(el.id)} />}
        {isHov && <HoverBadge name={el.name} />}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {imgs.map((src, i) => <img key={i} src={src.trim()} alt={`Gallery ${i + 1}`} style={{ width: "100%", display: "block" }} />)}
      </div>
    );
  }

  if (el.type === "contactForm") {
    return (
      <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleElDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {isSel && !preview && <SelectBadge name="Contact Form" onDelete={() => onDelete(el.id)} />}
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
      <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleElDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {isSel && !preview && <SelectBadge name="Payment" onDelete={() => onDelete(el.id)} />}
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
    <div className={elClass} style={wrapStyle} onClick={handleClick} onDragOver={handleDragOver} onDrop={handleDrop} onDragLeave={handleDragLeave} draggable={!isBody && !preview} onDragStart={handleElDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {isSel && !isBody && !preview && <SelectBadge name={el.name} onDelete={() => onDelete(el.id)} />}
      {isHov && !isBody && <HoverBadge name={el.name} />}
      {children.map((child) => <ElementRenderer key={child.id} el={child} {...childProps} />)}
      {isEmpty && !preview && (
        <div onDragOver={handleDragOver} onDrop={handleDrop} onDragLeave={handleDragLeave} className={`editor-dropzone ${isBody ? "body" : "child"} ${dropTarget === el.id ? "active" : ""}`}>
          {isBody ? "Drag a component here to start building" : "Drop here"}
        </div>
      )}
    </div>
  );
}

export function SelectBadge({ name, onDelete }: { name: string; onDelete: () => void }) {
  return (
    <div className="editor-badge-select">
      <span className="editor-badge-select-name">{name}</span>
      <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="editor-badge-select-delete">
        <Trash2 size={10} />
      </button>
    </div>
  );
}

export function HoverBadge({ name }: { name: string }) {
  return (
    <div className="editor-badge-hover">
      <span className="editor-badge-hover-name">{name}</span>
    </div>
  );
}

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
