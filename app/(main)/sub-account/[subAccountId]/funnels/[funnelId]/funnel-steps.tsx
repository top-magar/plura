"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { Copy, Eye, FileText, GripVertical, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { deleteFunnelPage, upsertFunnelPage, saveActivityLogsNotification } from "@/lib/queries";

type FunnelPage = { id: string; name: string; pathName: string; order: number; visits: number; content: string | null };

type Props = {
  pages: FunnelPage[];
  funnelId: string;
  subAccountId: string;
};

export default function FunnelSteps({ pages: initialPages, funnelId, subAccountId }: Props) {
  const router = useRouter();
  const [pages, setPages] = useState(initialPages.sort((a, b) => a.order - b.order));
  const [selectedPageId, setSelectedPageId] = useState(pages[0]?.id || "");
  const [adding, setAdding] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [deletePageId, setDeletePageId] = useState<string | null>(null);
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [pathValue, setPathValue] = useState("");

  const selectedPage = pages.find((p) => p.id === selectedPageId);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const reordered = [...pages];
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    const updated = reordered.map((p, i) => ({ ...p, order: i }));
    setPages(updated);
    for (const p of updated) {
      await upsertFunnelPage({ id: p.id, name: p.name, pathName: p.pathName, funnelId, order: p.order });
    }
    toast.success("Order updated");
  };

  const handleAddPage = async () => {
    if (!newPageName.trim()) return;
    try {
      await upsertFunnelPage({ name: newPageName, pathName: newPageName.toLowerCase().replace(/\s+/g, "-"), funnelId, order: pages.length });
      await saveActivityLogsNotification({ description: `Created page | ${newPageName}`, subAccountId });
      toast.success("Page added");
      setNewPageName(""); setAdding(false);
      router.refresh();
    } catch { toast.error("Could not create page"); }
  };

  const handleDeletePage = async () => {
    if (!deletePageId) return;
    try {
      await deleteFunnelPage(deletePageId);
      setPages((p) => p.filter((x) => x.id !== deletePageId));
      if (selectedPageId === deletePageId) setSelectedPageId(pages[0]?.id || "");
      toast.success("Page deleted");
      router.refresh();
    } catch { toast.error("Could not delete page"); }
    setDeletePageId(null);
  };

  const handleDuplicate = async (page: FunnelPage) => {
    try {
      await upsertFunnelPage({ name: `${page.name} (copy)`, pathName: `${page.pathName}-copy`, funnelId, order: pages.length, content: page.content ?? undefined });
      toast.success("Page duplicated");
      router.refresh();
    } catch { toast.error("Could not duplicate"); }
  };

  const handleSavePath = async (pageId: string) => {
    const page = pages.find((p) => p.id === pageId);
    if (!page) return;
    try {
      await upsertFunnelPage({ id: pageId, name: page.name, pathName: pathValue, funnelId, order: page.order });
      setPages((prev) => prev.map((p) => p.id === pageId ? { ...p, pathName: pathValue } : p));
      toast.success("Path updated");
    } catch { toast.error("Could not update path"); }
    setEditingPath(null);
  };

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        {/* Left: Steps list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">Funnel Steps</p>
            <Button size="sm" variant="ghost" onClick={() => setAdding(true)} className="h-7 gap-1 text-[11px]"><Plus size={12} /> Add</Button>
          </div>

          {adding && (
            <div className="flex gap-2">
              <Input placeholder="Page name" value={newPageName} onChange={(e) => setNewPageName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddPage()} autoFocus className="h-8 text-[12px]" />
              <Button size="sm" className="h-8" onClick={handleAddPage}>Add</Button>
              <Button size="sm" variant="ghost" className="h-8" onClick={() => { setAdding(false); setNewPageName(""); }}>Cancel</Button>
            </div>
          )}

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="funnel-steps">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-1">
                  {pages.map((page, i) => (
                    <Draggable key={page.id} draggableId={page.id} index={i}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`group flex items-center gap-2 rounded-lg border p-2.5 transition-colors cursor-pointer ${selectedPageId === page.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"} ${snapshot.isDragging ? "shadow-lg" : ""}`}
                          onClick={() => setSelectedPageId(page.id)}
                        >
                          <div {...provided.dragHandleProps} className="cursor-grab">
                            <GripVertical size={14} className="text-muted-foreground/40" />
                          </div>
                          <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-[10px] font-semibold text-primary shrink-0">{i + 1}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-medium truncate">{page.name}</p>
                            {editingPath === page.id ? (
                              <div className="flex gap-1 mt-0.5" onClick={(e) => e.stopPropagation()}>
                                <Input value={pathValue} onChange={(e) => setPathValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSavePath(page.id)} className="h-5 text-[10px] px-1" autoFocus />
                                <Button size="sm" variant="ghost" className="h-5 text-[9px] px-1" onClick={() => handleSavePath(page.id)}>Save</Button>
                              </div>
                            ) : (
                              <p className="text-[10px] text-muted-foreground cursor-text" onClick={(e) => { e.stopPropagation(); setEditingPath(page.id); setPathValue(page.pathName); }}>
                                /{page.pathName || "(root)"} · {page.visits} visits
                              </p>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon-xs" className="opacity-0 group-hover:opacity-100 shrink-0"><MoreHorizontal size={14} /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild><Link href={`/editor/${page.id}`}><Pencil /> Edit in editor</Link></DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setEditingPath(page.id); setPathValue(page.pathName); }}><Pencil /> Edit path</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicate(page)}><Copy /> Duplicate</DropdownMenuItem>
                              <DropdownMenuItem variant="destructive" onClick={() => setDeletePageId(page.id)}><Trash2 /> Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {pages.length === 0 && !adding && (
            <div className="rounded-lg border border-dashed py-8 text-center">
              <FileText className="mx-auto h-6 w-6 text-muted-foreground/30" />
              <p className="mt-2 text-[12px] text-muted-foreground">No pages yet</p>
              <Button variant="link" size="sm" className="mt-1 text-[11px]" onClick={() => setAdding(true)}>Add first page</Button>
            </div>
          )}
        </div>

        {/* Right: Page preview */}
        <div className="rounded-lg border bg-muted/30 min-h-[400px]">
          {selectedPage ? (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between border-b px-4 py-2.5">
                <div>
                  <p className="text-[13px] font-medium">{selectedPage.name}</p>
                  <p className="text-[10px] text-muted-foreground">/{selectedPage.pathName || "(root)"} · {selectedPage.visits} visits</p>
                </div>
                <Button asChild size="sm" variant="outline" className="h-7 gap-1 text-[11px]">
                  <Link href={`/editor/${selectedPage.id}`}><Pencil size={12} /> Edit</Link>
                </Button>
              </div>
              <div className="flex-1 p-4">
                {selectedPage.content ? (
                  <div className="rounded border bg-background p-2 h-full overflow-hidden">
                    <div className="transform scale-[0.3] origin-top-left w-[333%] h-[333%] pointer-events-none">
                      <iframe srcDoc={`<html><body style="margin:0;font-family:Inter,system-ui,sans-serif;background:#0a0a0a;color:#fff">${renderPreview(selectedPage.content)}</body></html>`} className="w-full h-full border-0" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Eye size={24} className="opacity-20 mb-2" />
                    <p className="text-[12px]">No content yet</p>
                    <Button asChild variant="link" size="sm" className="text-[11px] mt-1">
                      <Link href={`/editor/${selectedPage.id}`}>Open editor</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-[13px] text-muted-foreground">
              Select a page to preview
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!deletePageId} onOpenChange={() => setDeletePageId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete page?</AlertDialogTitle>
            <AlertDialogDescription>This permanently deletes the page and its content.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive" onClick={handleDeletePage}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function renderPreview(content: string): string {
  try {
    const els = JSON.parse(content);
    const render = (el: { type: string; styles: Record<string, string>; content: unknown; name: string }): string => {
      const style = Object.entries(el.styles || {}).map(([k, v]) => `${k.replace(/([A-Z])/g, "-$1").toLowerCase()}:${v}`).join(";");
      const c = el.content as Record<string, string>;
      if (el.type === "text" || el.type === "footer") return `<p style="${style}">${c?.innerText || ""}</p>`;
      if (el.type === "button") return `<a style="${style};display:block;text-decoration:none;color:inherit">${c?.innerText || ""}</a>`;
      if (el.type === "image") return `<img src="${c?.src || ""}" style="width:100%;${style}" />`;
      if (Array.isArray(el.content)) return `<div style="${style}">${(el.content as typeof el[]).map(render).join("")}</div>`;
      return `<div style="${style}">${c?.innerText || ""}</div>`;
    };
    return els[0] ? render(els[0]) : "";
  } catch { return ""; }
}
