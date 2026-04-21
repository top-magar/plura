"use client";

import { useState, useEffect, useRef, useCallback, type CSSProperties } from "react";
import { MIcon } from "./ui/m-icon";
import { toast } from "sonner";
import { upsertFunnelPage, upsertFunnel } from "@/lib/queries";
import type { El, EditorProps } from "./core/types";
import { getAncestorPath } from "./core/tree-helpers";
import { cn } from "@/lib/utils";
import Recursive from "./canvas/recursive";
import SnapDistances from "./canvas/overlays/snap-distances";
import PixelGrid from "./canvas/overlays/pixel-grid";
import GridEditor from "./canvas/overlays/grid-editor";
import Marquee from "./canvas/overlays/marquee";
import { EditorProvider, useEditor } from "./core/provider";
import EditorNavigation from "./toolbar/navigation";
import { LeftPanel, RightPanel } from "./panels";
import { DragOverlayProvider } from "./canvas/drag-overlay";
import { useCanvas } from "./canvas/use-canvas";
import { useShortcuts } from "./core/use-shortcuts";
import ShortcutsOverlay from "./toolbar/shortcuts-overlay";

export default function FunnelEditor(props: EditorProps) {
  return <EditorProvider {...props}><EditorInner /></EditorProvider>;
}

function EditorInner() {
  const { state, dispatch, pageId, pageName, funnelId, subAccountId } = useEditor();
  const elements = state.editor.elements;
  const selected = state.editor.selected;
  const device = state.editor.device;
  const preview = state.editor.preview;

  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clipboard, setClipboard] = useState<El | null>(null);
  const [styleClipboard, setStyleClipboard] = useState<CSSProperties | null>(null);
  const [pageTitle, setPageTitle] = useState(pageName);
  const [metaDescription, setMetaDescription] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { canvasRef, zoom, setZoom, panning, altHeld, spaceRef, scroll, onCanvasPointerDown, cursor } = useCanvas();

  // Auto-save
  useEffect(() => {
    if (!dirty || saving) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      setSaving(true);
      upsertFunnelPage({ id: pageId, name: pageTitle, funnelId, order: 0, content: JSON.stringify(elements) })
        .then(() => { setDirty(false); setSaving(false); })
        .catch(() => { setSaving(false); });
    }, 5000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [dirty, saving, elements, pageTitle, pageId, funnelId]);

  const handleSave = async () => {
    try {
      await upsertFunnelPage({ id: pageId, name: pageTitle, funnelId, order: 0, content: JSON.stringify(elements) });
      toast.success("Saved"); setDirty(false);
    } catch { toast.error("Could not save"); }
  };

  const handlePublish = async () => {
    try {
      await upsertFunnelPage({ id: pageId, name: pageTitle, funnelId, order: 0, content: JSON.stringify(elements) });
      setDirty(false);
      await upsertFunnel({ id: funnelId, name: pageTitle, subAccountId, published: true });
      toast.success("Saved and published");
    } catch { toast.error("Could not publish"); }
  };

  const handleExportHTML = () => {
    const body = elements[0];
    const fonts = new Set<string>();
    const cssify = (styles: Record<string, unknown>) => Object.entries(styles).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => `${k.replace(/([A-Z])/g, "-$1").toLowerCase()}:${v}`).join(";");
    const renderEl = (el: El): string => {
      const style = cssify(el.styles as Record<string, unknown>);
      const c = el.content as Record<string, string>;
      if (el.styles.fontFamily) fonts.add(String(el.styles.fontFamily).split(",")[0].trim().replace(/['"]/g, ""));
      // Leaf elements
      switch (el.type) {
        case "text": case "heading": case "subheading": return `<p style="${style}">${c.innerText || ""}</p>`;
        case "link": return `<a href="${c.href || "#"}" style="${style}">${c.innerText || ""}</a>`;
        case "button": return `<a href="${c.href || "#"}" style="${style};display:inline-block;text-decoration:none">${c.innerText || ""}</a>`;
        case "image": return `<img src="${c.src || ""}" alt="${c.alt || ""}" style="${style}" />`;
        case "video": return `<iframe src="${c.src || ""}" style="${style};border:0" allowfullscreen></iframe>`;
        case "divider": return `<hr style="${style}" />`;
        case "spacer": return `<div style="${style}"></div>`;
        case "icon": return `<span style="${style}">${c.innerText || ""}</span>`;
        case "badge": return `<span style="${style}">${c.innerText || ""}</span>`;
        case "quote": return `<blockquote style="${style}">${c.innerText || ""}</blockquote>`;
        case "list": return `<ul style="${style}">${(c.innerText || "").split("\n").map(li => `<li>${li}</li>`).join("")}</ul>`;
        case "code": return `<pre style="${style}"><code>${c.innerText || ""}</code></pre>`;
        case "embed": return c.code || "";
        case "map": return `<iframe src="https://maps.google.com/maps?q=${encodeURIComponent(c.address || "")}&z=${c.zoom || "13"}&output=embed" style="${style};border:0" loading="lazy"></iframe>`;
        case "gallery": return `<div style="${style}">${(c.images || "").split(",").map(src => `<img src="${src.trim()}" style="width:100%;object-fit:cover" />`).join("")}</div>`;
        case "socialIcons": return `<div style="${style}">${(c.platforms || "").split(",").map(p => `<a href="#" style="opacity:0.7">${p.trim()}</a>`).join("")}</div>`;
        case "accordion": { const items = JSON.parse(c.items || "[]") as { title: string; body: string }[]; return `<div style="${style}">${items.map(i => `<details><summary style="cursor:pointer;padding:12px 0;font-weight:600">${i.title}</summary><p style="padding:0 0 12px">${i.body}</p></details>`).join("")}</div>`; }
        case "tabs": { const items = JSON.parse(c.items || "[]") as { title: string; body: string }[]; return `<div style="${style}">${items.map((t, i) => `<div style="padding:16px${i > 0 ? ";display:none" : ""}"><h4>${t.title}</h4><p>${t.body}</p></div>`).join("")}</div>`; }
        case "countdown": return `<div style="${style}">Countdown to ${c.targetDate || ""}</div>`;
        case "contactForm": case "paymentForm":
        default: break;
      }
      // Container elements
      if (Array.isArray(el.content)) return `<div style="${style}">${el.content.map(renderEl).join("")}</div>`;
      return `<div style="${style}">${c.innerText || ""}</div>`;
    };
    // Collect responsive styles
    const responsiveCSS: string[] = [];
    const collectResponsive = (el: El) => {
      if (el.responsiveStyles) {
        for (const [device, styles] of Object.entries(el.responsiveStyles)) {
          const bp = device === 'tablet' ? 768 : device === 'mobile' ? 420 : 0;
          if (bp && styles && Object.keys(styles).length) {
            responsiveCSS.push(`@media(max-width:${bp}px){[data-id="${el.id}"]{${cssify(styles as Record<string, unknown>)}}}`);
          }
        }
      }
      if (Array.isArray(el.content)) el.content.forEach(collectResponsive);
    };
    if (body) collectResponsive(body);
    // Add data-id attributes for responsive targeting
    const addIds = (html: string, el: El): string => html; // IDs already in style attr
    const fontLinks = [...fonts].filter(f => f && f !== "Inter" && f !== "system-ui").map(f => `<link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(f)}:wght@400;500;600;700;800&display=swap" rel="stylesheet">`).join("");
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${pageTitle}</title>${metaDescription ? `<meta name="description" content="${metaDescription}">` : ""}${ogImage ? `<meta property="og:image" content="${ogImage}">` : ""}${fontLinks}<style>*{box-sizing:border-box;margin:0}${responsiveCSS.join("")}</style></head><body style="margin:0;font-family:Inter,system-ui,sans-serif">${body ? renderEl(body) : ""}</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${pageTitle.replace(/\s+/g, "-").toLowerCase()}.html`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported as HTML");
  };

  const baseKeyDown = useShortcuts({ selected, elements, clipboard, setClipboard, styleClipboard, setStyleClipboard, dispatch, setDirty, setZoom, handleSave });
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "?" && !(e.target as HTMLElement).matches("input,textarea,[contenteditable]")) { setShowShortcuts(s => !s); return; }
    baseKeyDown(e);
  }, [baseKeyDown]);

  const body = elements[0];
  const deviceWidth = device === "Desktop" ? "100%" : device === "Tablet" ? 768 : 420;

  return (
    <DragOverlayProvider>
    <div className="fixed inset-0 z-50 flex flex-col bg-background text-foreground text-sm leading-snug outline-none antialiased" onKeyDown={handleKeyDown} tabIndex={0}>
      {!preview && (
        <EditorNavigation
          pageTitle={pageTitle} onPageTitleChange={(v) => { setPageTitle(v); setDirty(true); }}
          dirty={dirty} saving={saving} zoom={zoom}
          metaDescription={metaDescription} onMetaDescriptionChange={(v) => { setMetaDescription(v); setDirty(true); }}
          ogImage={ogImage} onOgImageChange={(v) => { setOgImage(v); setDirty(true); }}
          onZoomIn={() => setZoom((z) => Math.min(200, z + 10))} onZoomOut={() => setZoom((z) => Math.max(25, z - 10))}
          onSave={handleSave} onExportHTML={handleExportHTML} onPublish={handlePublish}
        />
      )}

      <div className="flex flex-1 overflow-hidden min-h-0">
        {!preview && <LeftPanel />}

        {!preview ? (
        <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
          <div ref={canvasRef} onPointerDown={onCanvasPointerDown} className={cn("overflow-auto h-full relative bg-muted", cursor)} onClick={() => !spaceRef.current && dispatch({ type: "CHANGE_CLICKED_ELEMENT", payload: { element: null } })}>
            <div className="p-4">
            <div data-canvas className="mx-auto min-h-full bg-background shadow-[0_1px_3px_hsl(0_0%_0%/0.08),0_8px_24px_hsl(0_0%_0%/0.06)] transition-[max-width] duration-200 relative" style={{ maxWidth: deviceWidth, transform: `scale(${zoom / 100})`, transformOrigin: "top center", '--zoom': zoom / 100 } as React.CSSProperties}>
            {body && <Recursive element={body} />}
            {(() => {
              const isDragging = !!state.editor.dropTarget;
              const hasSel = !!selected;
              const isGrid = hasSel && selected.styles.display === "grid";
              return (<>
                {!isDragging && hasSel && altHeld && <SnapDistances altHeld={altHeld} />}
                {!isDragging && isGrid && <GridEditor />}
                <PixelGrid zoom={zoom} />
              </>);
            })()}
          </div>
          </div>
          <Marquee canvasRef={canvasRef} />
          </div>
        </div>
        ) : (
        <div className="flex-1 overflow-auto bg-background">
          <div className="mx-auto min-h-full" style={{ maxWidth: deviceWidth }}>
            {body && <Recursive element={body} />}
          </div>
        </div>
        )}

        {!preview && <RightPanel />}
      </div>

      {!preview && selected && (
        <div className="flex items-center gap-0.5 h-7 px-3 border-t border-sidebar-border bg-sidebar text-[10px] text-sidebar-foreground/50 shrink-0 overflow-x-auto">
          {getAncestorPath(elements, selected.id).map((el, i, arr) => (
            <span key={el.id} className="flex items-center gap-0.5 shrink-0">
              {i > 0 && <span className="text-sidebar-foreground/20">/</span>}
              <button className={cn("hover:text-sidebar-foreground transition-colors", i === arr.length - 1 && "text-sidebar-foreground font-medium")} onClick={() => dispatch({ type: "CHANGE_CLICKED_ELEMENT", payload: { element: el } })}>{el.name}</button>
            </span>
          ))}
          <span className="ml-auto text-[9px] text-sidebar-foreground/30 tabular-nums shrink-0">{JSON.stringify(elements).split('"id"').length - 1} elements</span>
        </div>
      )}

      {preview && (
        <button onClick={() => dispatch({ type: "TOGGLE_PREVIEW" })} className="fixed left-4 top-4 z-[100] flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90">
          <MIcon name="visibility_off" size={14} /> Exit Preview
        </button>
      )}
      {showShortcuts && <ShortcutsOverlay onClose={() => setShowShortcuts(false)} />}
    </div>
    </DragOverlayProvider>
  );
}
