"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { Copy, Eye, FileText, GripVertical, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { deleteFunnelPage, upsertFunnelPage, saveActivityLogsNotification } from "@/lib/queries";

type FunnelPage = { id: string; name: string; pathName: string; order: number; visits: number; content: string | null };
type Props = { pages: FunnelPage[]; funnelId: string; subAccountId: string };

export default function FunnelSteps({ pages: propPages, funnelId, subAccountId }: Props) {
  const router = useRouter();
  // Sync state from props on every render (fixes stale state after router.refresh)
  const [pages, setPages] = useState<FunnelPage[]>([]);
  useEffect(() => { setPages(propPages.sort((a, b) => a.order - b.order)); }, [propPages]);

  const [selectedId, setSelectedId] = useState("");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Auto-select first page
  useEffect(() => { if (!selectedId && pages.length) setSelectedId(pages[0].id); }, [pages, selectedId]);

  const selected = pages.find((p) => p.id === selectedId);

  // Drag reorder — optimistic update + single batch save
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || result.source.index === result.destination.index) return;
    const reordered = [...pages];
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    const updated = reordered.map((p, i) => ({ ...p, order: i }));
    setPages(updated); // Optimistic
    try {
      await Promise.all(updated.map((p) => upsertFunnelPage({ id: p.id, name: p.name, pathName: p.pathName, funnelId, order: p.order })));
      toast.success("Order saved");
    } catch { toast.error("Could not save order"); }
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const pathName = newName.toLowerCase().replace(/\s+/g, "-");
    try {
      const page = await upsertFunnelPage({ name: newName, pathName, funnelId, order: pages.length });
      await saveActivityLogsNotification({ description: `Created page | ${newName}`, subAccountId });
      // Optimistic add
      if (page) setPages((prev) => [...prev, { id: page.id, name: newName, pathName, order: prev.length, visits: 0, content: null }]);
      setSelectedId(page?.id || "");
      toast.success("Page added");
      setNewName(""); setAdding(false);
      router.refresh();
    } catch { toast.error("Could not create page"); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setPages((prev) => prev.filter((p) => p.id !== deleteId)); // Optimistic
    if (selectedId === deleteId) setSelectedId(pages.find((p) => p.id !== deleteId)?.id || "");
    try {
      await deleteFunnelPage(deleteId);
      toast.success("Page deleted");
      router.refresh();
    } catch { toast.error("Could not delete"); }
    setDeleteId(null);
  };

  const handleRename = async (pageId: string) => {
    if (!renameValue.trim()) { setRenameId(null); return; }
    const page = pages.find((p) => p.id === pageId);
    if (!page) return;
    setPages((prev) => prev.map((p) => p.id === pageId ? { ...p, name: renameValue } : p));
    setRenameId(null);
    try {
      await upsertFunnelPage({ id: pageId, name: renameValue, pathName: page.pathName, funnelId, order: page.order });
      toast.success("Renamed");
    } catch { toast.error("Could not rename"); }
  };

  const handleDuplicate = async (page: FunnelPage) => {
    try {
      const dup = await upsertFunnelPage({ name: `${page.name} (copy)`, pathName: `${page.pathName}-copy`, funnelId, order: pages.length, content: page.content ?? undefined });
      if (dup) setPages((prev) => [...prev, { ...page, id: dup.id, name: `${page.name} (copy)`, pathName: `${page.pathName}-copy`, order: prev.length }]);
      toast.success("Duplicated");
      router.refresh();
    } catch { toast.error("Could not duplicate"); }
  };

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Steps list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">Steps ({pages.length})</p>
            <Button size="sm" variant="ghost" onClick={() => setAdding(true)} className="h-7 gap-1 text-[11px]"><Plus size={12} /> Add</Button>
          </div>

          {adding && (
            <div className="flex gap-2">
              <Input placeholder="Page name" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") { setAdding(false); setNewName(""); } }} autoFocus className="h-8 text-[12px]" />
              <Button size="sm" className="h-8" onClick={handleAdd}>Add</Button>
            </div>
          )}

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="steps">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-1">
                  {pages.map((page, i) => (
                    <Draggable key={page.id} draggableId={page.id} index={i}>
                      {(prov, snap) => (
                        <div
                          ref={prov.innerRef} {...prov.draggableProps}
                          className={`group flex items-center gap-2 rounded-lg border p-2 transition-colors cursor-pointer ${selectedId === page.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"} ${snap.isDragging ? "shadow-lg" : ""}`}
                          onClick={() => setSelectedId(page.id)}
                        >
                          <div {...prov.dragHandleProps} className="cursor-grab"><GripVertical size={14} className="text-muted-foreground/40" /></div>
                          <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-[10px] font-semibold text-primary shrink-0">{i + 1}</div>
                          <div className="flex-1 min-w-0">
                            {renameId === page.id ? (
                              <Input
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") handleRename(page.id); if (e.key === "Escape") setRenameId(null); }}
                                onBlur={() => handleRename(page.id)}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                                className="h-6 text-[12px] px-1"
                              />
                            ) : (
                              <p className="text-[12px] font-medium truncate" onDoubleClick={(e) => { e.stopPropagation(); setRenameId(page.id); setRenameValue(page.name); }}>{page.name}</p>
                            )}
                            <p className="text-[10px] text-muted-foreground truncate">/{page.pathName || "(root)"}</p>
                          </div>
                          {page.visits > 0 && <Badge variant="secondary" className="text-[9px] h-4 px-1">{page.visits}</Badge>}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon-xs" className="opacity-0 group-hover:opacity-100 shrink-0"><MoreHorizontal size={14} /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild><Link href={`/editor/${page.id}`}><Pencil /> Edit in editor</Link></DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setRenameId(page.id); setRenameValue(page.name); }}><Pencil /> Rename</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicate(page)}><Copy /> Duplicate</DropdownMenuItem>
                              <DropdownMenuItem variant="destructive" onClick={() => setDeleteId(page.id)}><Trash2 /> Delete</DropdownMenuItem>
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

        {/* Preview panel */}
        <div className="rounded-lg border min-h-[300px]">
          {selected ? (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div>
                  <p className="text-[13px] font-medium">{selected.name}</p>
                  <p className="text-[11px] text-muted-foreground">/{selected.pathName || "(root)"} · {selected.visits} visits</p>
                </div>
                <Button asChild size="sm" className="h-7 gap-1 text-[11px]">
                  <Link href={`/editor/${selected.id}`}><Pencil size={12} /> Edit page</Link>
                </Button>
              </div>
              <div className="flex-1 flex items-center justify-center p-6">
                {selected.content ? (
                  <div className="text-center space-y-3">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium">Page has content</p>
                      <p className="text-[11px] text-muted-foreground">Open the editor to view and modify</p>
                    </div>
                    <Button asChild variant="outline" size="sm" className="gap-1 text-[11px]">
                      <Link href={`/editor/${selected.id}`}><Eye size={12} /> Open editor</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
                      <FileText className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium">Empty page</p>
                      <p className="text-[11px] text-muted-foreground">Start building in the editor</p>
                    </div>
                    <Button asChild size="sm" className="gap-1 text-[11px]">
                      <Link href={`/editor/${selected.id}`}><Pencil size={12} /> Start editing</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full py-16 text-[13px] text-muted-foreground">
              Select a step to see details
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete page?</AlertDialogTitle>
            <AlertDialogDescription>This permanently deletes the page and its content.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive" onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
