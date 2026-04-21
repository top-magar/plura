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
import Rulers from "./canvas/overlays/rulers";
import PixelGrid from "./canvas/overlays/pixel-grid";
import Guides from "./canvas/overlays/guides";
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

const SZ = 24; // ruler size in px

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

  const { canvasRef, zoom, setZoom, panning, altHeld, spaceRef, scroll, canvasOffset, onCanvasPointerDown, cursor } = useCanvas();
  const [showRulers, setShowRulers] = useState(true);

  // Auto-save
  useEffect(() => {
    if (!dirty) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      setSaving(true);
      upsertFunnelPage({ id: pageId, name: pageTitle, funnelId, order: 0, content: JSON.stringify(elements) })
        .then(() => { setDirty(false); setSaving(false); })
        .catch(() => { setSaving(false); });
    }, 5000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [dirty, elements, pageTitle, pageId, funnelId]);

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
    const renderEl = (el: El): string => {
      const style = Object.entries(el.styles).map(([k, v]) => `${k.replace(/([A-Z])/g, "-$1").toLowerCase()}:${v}`).join(";");
      const c = el.content as Record<string, string>;
      if (el.type === "text" || el.type === "footer") return `<p style="${style}">${c.innerText || ""}</p>`;
      if (el.type === "link") return `<a href="${c.href || "#"}" style="${style}">${c.innerText || ""}</a>`;
      if (el.type === "button") return `<a href="${c.href || "#"}" style="${style};display:block;text-decoration:none;color:inherit">${c.innerText || ""}</a>`;
      if (el.type === "image") return `<img src="${c.src || ""}" alt="${c.alt || ""}" style="width:100%;${style}" />`;
      if (el.type === "video") return `<iframe src="${c.src || ""}" style="width:100%;aspect-ratio:16/9;border:0;${style}" allowfullscreen></iframe>`;
      if (el.type === "divider") return `<hr style="${style}" />`;
      if (el.type === "spacer") return `<div style="${style}"></div>`;
      if (Array.isArray(el.content)) return `<div style="${style}">${el.content.map(renderEl).join("")}</div>`;
      return `<div style="${style}">${c.innerText || ""}</div>`;
    };
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${pageTitle}</title></head><body style="margin:0;font-family:Inter,system-ui,sans-serif">${body ? renderEl(body) : ""}</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${pageTitle.replace(/\s+/g, "-").toLowerCase()}.html`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported as HTML");
  };

  const baseKeyDown = useShortcuts({ selected, elements, clipboard, setClipboard, styleClipboard, setStyleClipboard, dispatch, setDirty, setZoom, handleSave });
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "?" && !(e.target as HTMLElement).matches("input,textarea,[contenteditable]")) { setShowShortcuts(s => !s); return; }
    if (e.shiftKey && e.key === "R" && !(e.target as HTMLElement).matches("input,textarea,[contenteditable]")) { setShowRulers(s => !s); return; }
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

        {/* Canvas area — grid layout: rulers pinned, scroll container independent */}
        <div className="flex-1 min-h-0 min-w-0 overflow-hidden" style={!preview && showRulers ? { display: 'grid', gridTemplate: `"corner hruler" ${SZ}px "vruler scroll" 1fr / ${SZ}px 1fr` } : undefined}>
          {!preview && showRulers && <Rulers zoom={zoom} scrollLeft={scroll.left} scrollTop={scroll.top} canvasOffsetX={canvasOffset.x} canvasOffsetY={canvasOffset.y} width={scroll.w} height={scroll.h} selectedId={selected?.id ?? null} onCreateGuide={(axis, position) => dispatch({ type: 'ADD_GUIDE', payload: { axis, position } })} onResetZoom={() => setZoom(100)} />}

          <div ref={canvasRef} onPointerDown={onCanvasPointerDown} className={cn("overflow-auto min-h-0 relative", preview ? "bg-background" : "bg-muted", cursor)} style={{ ...(!preview ? { backgroundImage: "radial-gradient(circle, hsl(var(--border)/0.4) 0.5px, transparent 0.5px)", backgroundSize: "20px 20px" } : undefined), gridArea: showRulers && !preview ? 'scroll' : undefined }} onClick={() => !preview && !spaceRef.current && dispatch({ type: "CHANGE_CLICKED_ELEMENT", payload: { element: null } })}>
            {!preview && showRulers && <Guides zoom={zoom} scrollLeft={scroll.left} scrollTop={scroll.top} canvasOffsetX={canvasOffset.x} canvasOffsetY={canvasOffset.y} />}
            <div className="p-4">
            <div data-canvas className="mx-auto min-h-full bg-background shadow-[0_1px_3px_hsl(0_0%_0%/0.08),0_8px_24px_hsl(0_0%_0%/0.06)] transition-[max-width] duration-200 relative" style={{ maxWidth: deviceWidth, transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}>
            {body && <Recursive element={body} />}
            {/* ── Smart Overlays (priority chain) ──
              
              Thought chain:
              1. Dragging? → hide ALL measurement overlays (they flicker during drag)
              2. No selection? → show nothing
              3. Selected + Alt held? → show distance measurements (red lines)
              4. Selected + CSS grid? → show grid track editor
              5. High zoom (800%+)? → show pixel grid
              
              What we DON'T auto-show:
              - LayoutGrid (8px grid) — too noisy, covers content
              - GradientEditor — should be explicit user action
              - SnapGuides on static selection — only useful during drag
            */}
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
          {!preview && <Marquee canvasRef={canvasRef} />}
          </div>
        </div>

        {!preview && <RightPanel />}
      </div>

      {/* Breadcrumb */}
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
        <div className="flex-1 overflow-auto bg-muted p-6">
          <div className="flex items-start justify-center gap-6 min-h-full">
            {([["Desktop", "100%", 0.4], ["Tablet", "768px", 0.5], ["Mobile", "420px", 0.5]] as const).map(([label, w, scale]) => (
              <div key={label} className="flex flex-col items-center gap-2 shrink-0">
                <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
                <div className="bg-background rounded-lg shadow-lg overflow-hidden" style={{ width: label === "Desktop" ? 960 : label === "Tablet" ? 768 * scale : 420 * scale, transform: label === "Desktop" ? "scale(0.4)" : `scale(${scale})`, transformOrigin: "top center", height: "80vh" }}>
                  <div style={{ width: label === "Desktop" ? 2400 : label === "Tablet" ? 768 : 420, transformOrigin: "top left" }}>
                    {body && <Recursive element={body} />}
                  </div>
                </div>
              </div>
            ))}
          </div>
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
