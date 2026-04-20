"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { MIcon } from "../../ui/m-icon";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { El } from "../../core/types";
import { cn } from "@/lib/utils";
import { useEditor } from "../../core/provider";
import { findParentId } from "../../core/tree-helpers";
import {
  IconToggle, Section, ColorField, Field, SelectField,
  selectOptions, textAlignOpts, fontStyleOpts, textDecoOpts, textTransOpts,
  justifyOpts, alignOpts, directionOpts, wrapOpts, borderStyleOpts,
} from "./shared";
import TypographySection from "./typography";
import LayoutSection from "./layout";
import AppearanceSection from "./appearance";
import PositionSection from "./position";

// ── Shared ──────────────────────────────────────────────


function ItemsEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items: { title: string; body: string }[] = (() => { try { return JSON.parse(value || "[]"); } catch { return []; } })();
  const update = (idx: number, field: "title" | "body", v: string) => {
    const next = items.map((item, i) => i === idx ? { ...item, [field]: v } : item);
    onChange(JSON.stringify(next));
  };
  const add = () => onChange(JSON.stringify([...items, { title: "New Item", body: "Content here" }]));
  const remove = (idx: number) => onChange(JSON.stringify(items.filter((_, i) => i !== idx)));

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="rounded-md border border-sidebar-border p-2 space-y-1">
          <div className="flex items-center gap-1">
            <Input value={item.title} onChange={(e) => update(i, "title", e.target.value)} className="h-6 text-[10px] flex-1" placeholder="Title" />
            <button onClick={() => remove(i)} className="text-[10px] text-destructive hover:underline shrink-0 px-1">×</button>
          </div>
          <textarea value={item.body} onChange={(e) => update(i, "body", e.target.value)} className="w-full rounded border border-sidebar-border bg-transparent p-1.5 text-[10px] outline-none resize-y focus:border-primary min-h-[32px]" rows={2} placeholder="Content" />
        </div>
      ))}
      <button onClick={add} className="w-full rounded-md border border-dashed border-sidebar-border py-1 text-[10px] text-sidebar-foreground/50 hover:border-primary hover:text-primary transition-colors">
        + Add Item
      </button>
    </div>
  );
}

// ── Context-aware sections ──────────────────────────────

const textTypes = new Set(["text", "heading", "subheading", "quote", "code", "list", "badge", "icon", "footer"]);
const containerTypes = new Set(["__body", "container", "section", "row", "column", "2Col", "3Col", "4Col", "grid", "hero", "header", "card", "sidebar", "modal", "form"]);
const mediaTypes = new Set(["image", "video", "gallery", "map", "embed"]);
const simpleTypes = new Set(["divider", "spacer"]);

function showTypography(type: string) { return textTypes.has(type) || type === "button" || type === "link" || type === "navbar"; }
function showLayout(type: string) { return !simpleTypes.has(type); }
function showAppearance(type: string) { return !simpleTypes.has(type); }
function showPosition(type: string) { return !simpleTypes.has(type) && type !== "__body"; }

export default function SettingsTab() {
  const { state, dispatch } = useEditor();
  const selected = state.editor.selected;
  const [propsTab, setPropsTab] = useState<"design" | "content">("design");

  if (!selected) return null;

  const device = state.editor.device;
  const resolved = device === "Desktop" ? selected.styles : { ...selected.styles, ...selected.responsiveStyles?.[device] };
  const s = resolved as Record<string, unknown>;
  const get = (p: string) => String(s[p] ?? "");
  const set = (p: string, v: string) => {
    if (device === "Desktop") {
      dispatch({ type: "UPDATE_ELEMENT", payload: { element: { ...selected, styles: { ...selected.styles, [p]: v } as CSSProperties } } });
    } else {
      const prev = selected.responsiveStyles ?? {};
      dispatch({ type: "UPDATE_ELEMENT", payload: { element: { ...selected, responsiveStyles: { ...prev, [device]: { ...prev[device], [p]: v } } } } });
    }
  };
  const onUpdate = (el: El) => dispatch({ type: "UPDATE_ELEMENT", payload: { element: el } });

  const onDuplicate = () => {
    if (selected.type === "__body") return;
    const parentId = findParentId(state.editor.elements, selected.id);
    if (!parentId) return;
    dispatch({ type: "DUPLICATE_ELEMENT", payload: { elId: selected.id, containerId: parentId } });
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-1.5 border-b border-sidebar-border px-3 py-2">
        <MIcon name="edit" size={12} className="shrink-0 text-sidebar-foreground/50" />
        <input className="h-7 min-w-0 flex-1 rounded-md border border-sidebar-border bg-transparent px-2 text-xs outline-none focus:border-primary" value={selected.name} onChange={(e) => onUpdate({ ...selected, name: e.target.value })} />
        <Badge variant="outline" className="shrink-0 px-1.5 py-0 text-[9px] h-4">{selected.type}</Badge>
        {device !== "Desktop" && <Badge className="shrink-0 px-1.5 py-0 text-[9px] h-4 bg-primary/10 text-primary border-primary/20">{device}</Badge>}
      </div>

      {/* Actions */}
      <TooltipProvider delayDuration={200}>
        <div className="flex gap-1 border-b border-sidebar-border px-3 py-1.5">
          <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" className="size-7" onClick={onDuplicate}><MIcon name="content_copy" size={14} /></Button></TooltipTrigger><TooltipContent side="bottom" className="text-[10px]">Duplicate</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild>
            <Button variant="outline" size="icon" className={cn("size-7", selected.locked && "bg-amber-500/10 text-amber-500 border-amber-500/30")} onClick={() => onUpdate({ ...selected, locked: !selected.locked })}>
              <MIcon name="lock" size={14} />
            </Button>
          </TooltipTrigger><TooltipContent side="bottom" className="text-[10px]">{selected.locked ? "Unlock" : "Lock"}</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild>
            <Button variant="outline" size="icon" className={cn("size-7", selected.hidden && "bg-muted text-muted-foreground")} onClick={() => onUpdate({ ...selected, hidden: !selected.hidden })}>
              <MIcon name="visibility" size={14} />
            </Button>
          </TooltipTrigger><TooltipContent side="bottom" className="text-[10px]">{selected.hidden ? "Show" : "Hide"}</TooltipContent></Tooltip>
          {selected.type !== "__body" && (
            <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive hover:border-destructive" onClick={() => dispatch({ type: "DELETE_ELEMENT", payload: { id: selected.id } })}><MIcon name="delete" size={14} /></Button></TooltipTrigger><TooltipContent side="bottom" className="text-[10px]">Delete</TooltipContent></Tooltip>
          )}
        </div>
      </TooltipProvider>

      {/* Tabs */}
      <Tabs value={propsTab} onValueChange={(v) => setPropsTab(v as "design" | "content")} className="flex flex-1 flex-col min-h-0">
        <TabsList className="w-full rounded-none border-b border-sidebar-border h-8 bg-transparent p-0">
          <TabsTrigger value="design" className="flex-1 rounded-none h-full text-xs data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary gap-1"><MIcon name="design_services" size={12} /> Design</TabsTrigger>
          <TabsTrigger value="content" className="flex-1 rounded-none h-full text-xs data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary gap-1"><MIcon name="text_fields" size={12} /> Content</TabsTrigger>
        </TabsList>

        {/* Content tab */}
        <TabsContent value="content" className="flex-1 overflow-y-auto mt-0 p-3">
          {!Array.isArray(selected.content) ? (
            Object.keys(selected.content as Record<string, string>).length === 0 ? (
              <div className="py-8 text-center">
                <MIcon name="block" size={24} className="text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-[10px] text-muted-foreground/50">No editable content</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(selected.content as Record<string, string>).map(([key, val]) => {
                  const meta: Record<string, { label: string; icon: string; type: 'text' | 'url' | 'textarea' | 'code' | 'date' | 'images' | 'items' | 'csv' }> = {
                    innerText: { label: "Text", icon: "text_fields", type: "textarea" },
                    href: { label: "Link URL", icon: "link", type: "url" },
                    src: { label: "Source URL", icon: "image", type: "url" },
                    alt: { label: "Alt Text", icon: "description", type: "text" },
                    code: { label: "HTML Code", icon: "code", type: "code" },
                    address: { label: "Address", icon: "location_on", type: "text" },
                    zoom: { label: "Zoom", icon: "zoom_in", type: "text" },
                    brand: { label: "Brand", icon: "branding_watermark", type: "text" },
                    links: { label: "Nav Links", icon: "menu", type: "csv" },
                    platforms: { label: "Platforms", icon: "share", type: "csv" },
                    images: { label: "Image URLs", icon: "photo_library", type: "images" },
                    targetDate: { label: "Target Date", icon: "event", type: "date" },
                    items: { label: "Items", icon: "list", type: "items" },
                  };
                  const m = meta[key] ?? { label: key, icon: "edit", type: "text" as const };
                  const setVal = (v: string) => onUpdate({ ...selected, content: { ...(selected.content as Record<string, string>), [key]: v } });

                  return (
                    <div key={key} className="rounded-md border border-sidebar-border/50 bg-sidebar-accent/20 p-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="flex items-center gap-1 text-[10px] font-medium text-sidebar-foreground/60">
                          <MIcon name={m.icon} size={12} className="text-sidebar-foreground/30" />
                          {m.label}
                        </label>
                        <div className="flex items-center gap-0.5">
                          {m.type === "textarea" && <span className="text-[8px] text-muted-foreground/30 tabular-nums">{val.length}</span>}
                          {m.type === "url" && val && (
                            <button onClick={() => window.open(val, '_blank')} className="flex size-4 items-center justify-center rounded text-muted-foreground/40 hover:text-foreground transition-colors">
                              <MIcon name="open_in_new" size={10} />
                            </button>
                          )}
                          {val && (
                            <button onClick={() => setVal("")} className="flex size-4 items-center justify-center rounded text-muted-foreground/30 hover:text-destructive transition-colors">
                              <MIcon name="close" size={10} />
                            </button>
                          )}
                        </div>
                      </div>

                      {m.type === "textarea" && (
                        <textarea value={val} onChange={(e) => setVal(e.target.value)} className="w-full rounded border border-sidebar-border bg-transparent p-2 text-xs outline-none resize-y focus:border-primary min-h-[48px]" rows={3} placeholder="Enter text..." />
                      )}
                      {m.type === "code" && (
                        <textarea value={val} onChange={(e) => setVal(e.target.value)} className="w-full rounded border border-sidebar-border bg-transparent p-2 text-[10px] font-mono outline-none resize-y focus:border-primary min-h-[80px]" rows={5} placeholder="<div>...</div>" />
                      )}
                      {m.type === "url" && (
                        <>
                          <Input value={val} onChange={(e) => setVal(e.target.value)} className="h-6 text-[10px]" placeholder="https://..." />
                          {key === "src" && val && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={val} alt="" className="mt-1.5 rounded border border-sidebar-border max-h-20 w-full object-cover" />
                          )}
                        </>
                      )}
                      {m.type === "text" && (
                        <Input value={val} onChange={(e) => setVal(e.target.value)} className="h-6 text-[10px]" />
                      )}
                      {m.type === "csv" && (
                        <Input value={val} onChange={(e) => setVal(e.target.value)} className="h-6 text-[10px]" placeholder="Item1,Item2,Item3" />
                      )}
                      {m.type === "date" && (
                        <Input type="datetime-local" value={val} onChange={(e) => setVal(e.target.value)} className="h-6 text-[10px]" />
                      )}
                      {m.type === "images" && (
                        <textarea value={val} onChange={(e) => setVal(e.target.value)} className="w-full rounded border border-sidebar-border bg-transparent p-2 text-[10px] outline-none resize-y focus:border-primary min-h-[40px]" rows={2} placeholder="url1,url2,url3" />
                      )}
                      {m.type === "items" && (
                        <ItemsEditor value={val} onChange={setVal} />
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="py-8 text-center">
              <MIcon name="dashboard_customize" size={24} className="text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-[10px] text-muted-foreground/50">Container element</p>
              <p className="text-[9px] text-muted-foreground/30 mt-1">{(selected.content as El[]).length} children</p>
            </div>
          )}
        </TabsContent>

        {/* Design tab */}
        <TabsContent value="design" className="flex-1 overflow-y-auto mt-0">
          <TooltipProvider delayDuration={200}>

          {/* Custom */}
          {!Array.isArray(selected.content) && Object.keys(selected.content as Record<string, string>).some((k) => k === "href" || k === "src") && (
            <Section title="Custom" icon="edit">
              {(selected.content as Record<string, string>).href !== undefined && (
                <Field label="Link URL" value={(selected.content as Record<string, string>).href ?? ""} onChange={(v) => onUpdate({ ...selected, content: { ...(selected.content as Record<string, string>), href: v } })} placeholder="https://..." />
              )}
              {(selected.content as Record<string, string>).src !== undefined && (
                <Field label="Source URL" value={(selected.content as Record<string, string>).src ?? ""} onChange={(v) => onUpdate({ ...selected, content: { ...(selected.content as Record<string, string>), src: v } })} placeholder="https://..." />
              )}
            </Section>
          )}

          {showTypography(selected.type) && <TypographySection get={get} set={set} />}
          {showLayout(selected.type) && <LayoutSection get={get} set={set} />}
          {showAppearance(selected.type) && <AppearanceSection get={get} set={set} />}
          {/* Quick Columns — for row containers */}
          {Array.isArray(selected.content) && (get("flexDirection") === "row" || get("flexDirection") === "row-reverse") && (
            <Section title="Columns" icon="view_column">
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((n) => (
                    <button
                      key={n}
                      onClick={() => {
                        const cols = Array.isArray(selected.content) ? selected.content as El[] : [];
                        const current = cols.length;
                        if (n === current) return;
                        if (n > current) {
                          let updated = selected;
                          for (let i = current; i < n; i++) {
                            const col: El = { id: crypto.randomUUID(), type: "column", name: `Col ${i + 1}`, styles: { display: "flex", flexDirection: "column", gap: "8px", flex: "1", padding: "8px" }, content: [] };
                            updated = { ...updated, content: [...(updated.content as El[]), col] };
                          }
                          onUpdate(updated);
                        } else {
                          onUpdate({ ...selected, content: cols.slice(0, n) });
                        }
                      }}
                      className={cn(
                        "flex-1 h-8 rounded border text-[10px] font-medium transition-colors",
                        (selected.content as El[]).length === n
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-sidebar-border hover:bg-sidebar-accent"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1">
                  {(selected.content as El[]).map((col, i) => (
                    <div key={col.id} className="flex-1">
                      <label className="text-[9px] text-sidebar-foreground/40 mb-0.5 block">Col {i + 1}</label>
                      <Input
                        value={col.styles.flex ?? "1"}
                        onChange={(e) => {
                          const cols = [...(selected.content as El[])];
                          cols[i] = { ...cols[i], styles: { ...cols[i].styles, flex: e.target.value } };
                          onUpdate({ ...selected, content: cols });
                        }}
                        className="h-6 text-[10px]"
                        placeholder="1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          )}

          {showPosition(selected.type) && <PositionSection get={get} set={set} />}

          </TooltipProvider>
        </TabsContent>
      </Tabs>
    </div>
  );
}
