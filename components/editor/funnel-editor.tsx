"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Undo2, Redo2, Eye, EyeOff, Laptop, Tablet, Smartphone, Layout, Layers, Bookmark, ZoomIn, ZoomOut, Globe2, Search, FileCode, Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { upsertFunnelPage, savePageTemplate, getPageTemplates, deletePageTemplate } from "@/lib/queries";
import type { El, Device, EditorProps } from "./types";
import { addEl, updateEl, deleteEl, moveEl, reorderEl, cloneEl, defaultBody } from "./tree-helpers";
import { makeEl, componentGroups } from "./element-factory";
import { ElementRenderer } from "./element-renderers";
import { DesignPanel } from "./design-panel";
import { LayerTree } from "./layers-panel";
import "./editor.css";

export default function FunnelEditor({ pageId, pageName, funnelId, subAccountId, agencyId, initialContent }: EditorProps) {
  const router = useRouter();
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
  const [sidebarTab, setSidebarTab] = useState<"components" | "layers" | "templates">("components");
  const [propsTab, setPropsTab] = useState<"design" | "content">("design");
  const [pageTitle, setPageTitle] = useState(pageName);
  const [templates, setTemplates] = useState<{ id: string; name: string; content: string; category: string }[]>([]);
  const [templatesLoaded, setTemplatesLoaded] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [layerSearch, setLayerSearch] = useState("");
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save: debounce 5s after changes
  useEffect(() => {
    if (!dirty) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      upsertFunnelPage({ id: pageId, name: pageTitle, funnelId, order: 0, content: JSON.stringify(elements) })
        .then(() => { setDirty(false); toast.success("Auto-saved"); })
        .catch(() => {});
    }, 5000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [dirty, elements, pageTitle]);

  const pushHistory = useCallback((prev: El[]) => {
    setHistory((h) => [...h.slice(0, historyIdx + 1), prev]);
    setHistoryIdx((i) => i + 1);
  }, [historyIdx]);

  const undo = () => { if (historyIdx < 0) return; setElements(history[historyIdx]); setHistoryIdx((i) => i - 1); setSelected(null); };
  const redo = () => { if (historyIdx >= history.length - 1) return; const next = history[historyIdx + 2] || history[historyIdx + 1]; if (next) { setElements(next); setHistoryIdx((i) => i + 1); } };

  const doAdd = (containerId: string, type: string) => { const el = makeEl(type); if (!el) return; pushHistory(elements); setElements((prev) => addEl(prev, containerId, el)); setDirty(true); };
  const doUpdate = (updated: El) => { pushHistory(elements); setElements((prev) => updateEl(prev, updated)); if (selected?.id === updated.id) setSelected(updated); setDirty(true); };
  const doDelete = (id: string) => { pushHistory(elements); setElements((prev) => deleteEl(prev, id)); setSelected(null); setDirty(true); };
  const doMove = (elId: string, targetId: string) => { if (elId === targetId) return; pushHistory(elements); setElements((prev) => moveEl(prev, elId, targetId)); setDirty(true); };

  const doDuplicate = () => {
    if (!selected || selected.type === "__body") return;
    const clone = cloneEl(selected);
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

  const handleSave = async () => { try { await upsertFunnelPage({ id: pageId, name: pageTitle, funnelId, order: 0, content: JSON.stringify(elements) }); toast.success("Saved"); setDirty(false); } catch { toast.error("Could not save"); } };
  const loadTemplates = async () => { if (templatesLoaded) return; const t = await getPageTemplates(agencyId); setTemplates(t.map((x) => ({ id: x.id, name: x.name, content: x.content, category: x.category }))); setTemplatesLoaded(true); };
  const handleSaveTemplate = async () => { const name = prompt("Template name:"); if (!name) return; await savePageTemplate({ name, content: JSON.stringify(elements), agencyId }); setTemplatesLoaded(false); toast.success("Template saved"); };
  const handleLoadTemplate = (content: string) => { try { const parsed = JSON.parse(content); if (Array.isArray(parsed) && parsed.length) { pushHistory(elements); setElements(parsed); setDirty(true); setSelected(null); toast.success("Template loaded"); } } catch { toast.error("Invalid template"); } };
  const handleDeleteTemplate = async (id: string) => { await deletePageTemplate(id); setTemplates((t) => t.filter((x) => x.id !== id)); toast.success("Template deleted"); };

  const handlePublishToggle = async () => {
    try {
      const page = await upsertFunnelPage({ id: pageId, name: pageTitle, funnelId, order: 0, content: JSON.stringify(elements) });
      setDirty(false);
      toast.success("Published");
    } catch { toast.error("Could not publish"); }
  };

  const handleExportHTML = () => {
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
    const a = document.createElement("a");
    a.href = url; a.download = `${pageTitle.replace(/\s+/g, "-").toLowerCase()}.html`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported as HTML");
  };

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
      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA") return;
      doDelete(selected.id);
    }
    if (e.key === "Escape") setSelected(null);
    if (e.key === "ArrowUp" && (e.metaKey || e.ctrlKey) && selected && selected.type !== "__body") { e.preventDefault(); pushHistory(elements); setElements((prev) => reorderEl(prev, selected.id, "up")); setDirty(true); }
    if (e.key === "ArrowDown" && (e.metaKey || e.ctrlKey) && selected && selected.type !== "__body") { e.preventDefault(); pushHistory(elements); setElements((prev) => reorderEl(prev, selected.id, "down")); setDirty(true); }
    if ((e.metaKey || e.ctrlKey) && e.key === "=") { e.preventDefault(); setZoom((z) => Math.min(200, z + 10)); }
    if ((e.metaKey || e.ctrlKey) && e.key === "-") { e.preventDefault(); setZoom((z) => Math.max(50, z - 10)); }
    if ((e.metaKey || e.ctrlKey) && e.key === "0") { e.preventDefault(); setZoom(100); }
  }, [selected, elements]);

  const body = elements[0];
  const deviceWidth = device === "Desktop" ? "100%" : device === "Tablet" ? 768 : 420;
  const onDragStart = (e: React.DragEvent, elId: string) => { e.dataTransfer.setData("moveElementId", elId); };

  return (
    <div className="editor-root" onKeyDown={handleKeyDown} tabIndex={0}>
      {!preview && (
        <div className="editor-toolbar">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Button asChild variant="ghost" size="icon-xs"><Link href={`/sub-account/${subAccountId}/funnels/${funnelId}`}><ArrowLeft /></Link></Button>
            <input className="editor-props-name-input" value={pageTitle} onChange={(e) => { setPageTitle(e.target.value); setDirty(true); }} style={{ width: 140 }} />
          </div>
          <div className="editor-device-toggle">
            {([["Desktop", Laptop], ["Tablet", Tablet], ["Mobile", Smartphone]] as const).map(([d, Icon]) => (
              <button key={d} onClick={() => setDevice(d as Device)} className={`editor-device-btn ${device === d ? "active" : ""}`}>
                <Icon size={14} />
              </button>
            ))}
          </div>
          <TooltipProvider delayDuration={300}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon-xs" onClick={() => setPreview(true)}><Eye /></Button></TooltipTrigger><TooltipContent className="text-[10px]">Preview</TooltipContent></Tooltip>
            <Separator orientation="vertical" className="h-5" />
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon-xs" onClick={() => setZoom((z) => Math.max(50, z - 10))}><ZoomOut size={14} /></Button></TooltipTrigger><TooltipContent className="text-[10px]">Zoom Out (Cmd+-)</TooltipContent></Tooltip>
            <span style={{ fontSize: 10, width: 32, textAlign: "center", color: "var(--muted-foreground)" }}>{zoom}%</span>
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon-xs" onClick={() => setZoom((z) => Math.min(200, z + 10))}><ZoomIn size={14} /></Button></TooltipTrigger><TooltipContent className="text-[10px]">Zoom In (Cmd+=)</TooltipContent></Tooltip>
            <Separator orientation="vertical" className="h-5" />
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon-xs" onClick={undo} disabled={historyIdx < 0}><Undo2 /></Button></TooltipTrigger><TooltipContent className="text-[10px]">Undo (Cmd+Z)</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon-xs" onClick={redo} disabled={historyIdx >= history.length - 1}><Redo2 /></Button></TooltipTrigger><TooltipContent className="text-[10px]">Redo (Cmd+Shift+Z)</TooltipContent></Tooltip>
            <Separator orientation="vertical" className="h-5" />
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon-xs" onClick={handleExportHTML}><FileCode size={14} /></Button></TooltipTrigger><TooltipContent className="text-[10px]">Export HTML</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon-xs" onClick={handlePublishToggle}><Globe2 size={14} /></Button></TooltipTrigger><TooltipContent className="text-[10px]">Publish</TooltipContent></Tooltip>
            <Separator orientation="vertical" className="h-5" />
            <Button size="sm" onClick={handleSave} className="gap-1 text-[12px] relative">
              <Save className="h-3.5 w-3.5" /> Save
              {dirty && <span className="editor-dirty-dot" />}
            </Button>
          </div>
          </TooltipProvider>
        </div>
      )}

      <div className="editor-body">
        {!preview && (
          <div className="editor-sidebar">
            <div className="editor-sidebar-tabs">
              <button className={`editor-sidebar-tab ${sidebarTab === "components" ? "active" : ""}`} onClick={() => setSidebarTab("components")}><Layout size={12} /> Components</button>
              <button className={`editor-sidebar-tab ${sidebarTab === "layers" ? "active" : ""}`} onClick={() => setSidebarTab("layers")}><Layers size={12} /> Layers</button>
              <button className={`editor-sidebar-tab ${sidebarTab === "templates" ? "active" : ""}`} onClick={() => { setSidebarTab("templates"); loadTemplates(); }}><Bookmark size={12} /> Templates</button>
            </div>

            {sidebarTab === "components" && (
              <div className="editor-scroll-panel">
                {componentGroups.map((group) => (
                  <div key={group.label} className="editor-component-group">
                    <div className="editor-component-group-label">{group.label}</div>
                    <div className="editor-component-grid">
                      {group.items.map(({ type, label, icon: Icon, color }) => (
                        <div key={type} draggable onDragStart={(e) => e.dataTransfer.setData("componentType", type)} className="editor-component-card">
                          <span style={{ color }}><Icon size={16} /></span> {label}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {sidebarTab === "layers" && (
              <div className="editor-scroll-panel">
                <div style={{ padding: "8px 8px 4px" }}>
                  <div style={{ position: "relative" }}>
                    <Search size={12} style={{ position: "absolute", left: 8, top: 7, color: "var(--muted-foreground)" }} />
                    <Input value={layerSearch} onChange={(e) => setLayerSearch(e.target.value)} placeholder="Search layers..." className="h-7 text-[11px] pl-7" />
                  </div>
                </div>
                <div style={{ padding: "4px 8px" }}>
                  {body && <LayerTree el={body} depth={0} selected={selected} onSelect={setSelected} filter={layerSearch} />}
                </div>
              </div>
            )}

            {sidebarTab === "templates" && (
              <div className="editor-scroll-panel">
                <div style={{ padding: 8 }}>
                  <button onClick={handleSaveTemplate} className="editor-component-item" style={{ width: "100%", marginBottom: 8, justifyContent: "center", cursor: "pointer" }}>
                    <Bookmark size={14} /> Save Current Page
                  </button>
                  {templates.length === 0 && <div className="editor-empty-state">No saved templates yet.</div>}
                  {templates.map((t) => (
                    <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 8, marginBottom: 4, fontSize: 12, border: "1px solid var(--border)" }}>
                      <button onClick={() => handleLoadTemplate(t.content)} style={{ background: "none", border: 0, color: "inherit", cursor: "pointer", textAlign: "left", flex: 1, fontSize: 12 }}>
                        <div style={{ fontWeight: 500 }}>{t.name}</div>
                        <div style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{t.category}</div>
                      </button>
                      <button onClick={() => handleDeleteTemplate(t.id)} style={{ background: "none", border: 0, color: "hsl(var(--destructive))", cursor: "pointer", padding: 4 }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Canvas */}
        <div className={`editor-canvas ${preview ? "preview" : ""}`} onClick={() => !preview && setSelected(null)}>
          <div className="editor-canvas-inner" style={{ maxWidth: deviceWidth, transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}>
            {body && <ElementRenderer el={body} selected={selected} preview={preview} hovered={hovered} dropTarget={dropTarget} onSelect={setSelected} onDelete={doDelete} onUpdate={doUpdate} onAdd={doAdd} onMove={doMove} onDragStart={onDragStart} setHovered={setHovered} setDropTarget={setDropTarget} />}
          </div>
        </div>

        {/* Properties */}
        {!preview && !selected && (
          <div className="editor-props">
            <div className="editor-props-section" style={{ paddingTop: 24 }}>
              <div className="editor-empty-state">
                <p style={{ marginBottom: 16 }}>Select an element to edit its properties.</p>
                <div style={{ fontSize: 11, lineHeight: 2 }}>
                  <div><kbd>Cmd+S</kbd> Save</div>
                  <div><kbd>Cmd+Z</kbd> Undo</div>
                  <div><kbd>Cmd+D</kbd> Duplicate</div>
                  <div><kbd>Cmd+C/V</kbd> Copy / Paste</div>
                  <div><kbd>Cmd+Up/Down</kbd> Reorder</div>
                  <div><kbd>Cmd++/-</kbd> Zoom In/Out</div>
                  <div><kbd>Cmd+0</kbd> Reset Zoom</div>
                  <div><kbd>Delete</kbd> Remove element</div>
                  <div><kbd>Escape</kbd> Deselect</div>
                  <div style={{ marginTop: 8, fontSize: 10, color: "var(--muted-foreground)" }}>Auto-saves 5s after changes</div>
                </div>
              </div>
            </div>
          </div>
        )}
        {!preview && selected && (
          <DesignPanel selected={selected} onUpdate={doUpdate} onDuplicate={doDuplicate} onDelete={doDelete} propsTab={propsTab} setPropsTab={setPropsTab} />
        )}
      </div>

      {preview && (
        <button onClick={() => setPreview(false)} className="editor-preview-exit">
          <EyeOff size={14} /> Exit Preview
        </button>
      )}
    </div>
  );
}
