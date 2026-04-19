"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { ArrowLeft, Copy, ExternalLink, FileText, Globe, GripVertical, MoreHorizontal, Pencil, Plus, Trash2, Settings, Eye } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { FileUpload } from "@/components/global/file-upload";
import { deleteFunnel, deleteFunnelPage, upsertFunnel, upsertFunnelPage, saveActivityLogsNotification } from "@/lib/queries";

type FunnelPage = { id: string; name: string; pathName: string; order: number; visits: number; content: string | null };
type Funnel = { id: string; name: string; description: string | null; subDomainName: string | null; published: boolean; favicon: string | null; liveProducts: string | null; subAccountId: string; FunnelPages: FunnelPage[] };
type Props = { funnel: Funnel; subAccountId: string };

export default function FunnelDetailClient({ funnel, subAccountId }: Props) {
  const router = useRouter();
  const [pages, setPages] = useState(funnel.FunnelPages.sort((a, b) => a.order - b.order));
  const [selectedPageId, setSelectedPageId] = useState(pages[0]?.id || "");
  const [adding, setAdding] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [deletePageId, setDeletePageId] = useState<string | null>(null);

  // Settings state
  const [subdomain, setSubdomain] = useState(funnel.subDomainName ?? "");
  const [description, setDescription] = useState(funnel.description ?? "");
  const [favicon, setFavicon] = useState(funnel.favicon ?? "");
  const [funnelName, setFunnelName] = useState(funnel.name);
  const [deleteFunnelOpen, setDeleteFunnelOpen] = useState(false);
  const [products, setProducts] = useState<{ id: string; name: string; description: string | null; amount: number; currency: string; recurring: string | null }[]>([]);
  const [liveProducts, setLiveProducts] = useState<string[]>(() => { try { return JSON.parse(funnel.liveProducts || "[]"); } catch { return []; } });
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  // Auto-load products when settings tab is viewed
  useEffect(() => {
    if (productsLoaded) return;
    fetch(`/api/stripe/products?subAccountId=${subAccountId}`)
      .then((r) => r.json())
      .then((d) => { setProducts(d.products || []); setProductsLoaded(true); })
      .catch(() => setProductsLoaded(true));
  }, [productsLoaded, subAccountId]);

  const selectedPage = pages.find((p) => p.id === selectedPageId);
  const totalVisits = pages.reduce((s, p) => s + p.visits, 0);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const reordered = [...pages];
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    const updated = reordered.map((p, i) => ({ ...p, order: i }));
    setPages(updated);
    // Save new order
    for (const p of updated) {
      await upsertFunnelPage({ id: p.id, name: p.name, pathName: p.pathName, funnelId: funnel.id, order: p.order });
    }
    toast.success("Order updated");
  };

  const handleAddPage = async () => {
    if (!newPageName.trim()) return;
    try {
      const page = await upsertFunnelPage({ name: newPageName, pathName: newPageName.toLowerCase().replace(/\s+/g, "-"), funnelId: funnel.id, order: pages.length });
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
      await upsertFunnelPage({ name: `${page.name} (copy)`, pathName: `${page.pathName}-copy`, funnelId: funnel.id, order: pages.length, content: page.content ?? undefined });
      toast.success("Page duplicated");
      router.refresh();
    } catch { toast.error("Could not duplicate"); }
  };

  const handlePublishToggle = async (published: boolean) => {
    try {
      await upsertFunnel({ id: funnel.id, name: funnel.name, subAccountId, subDomainName: subdomain || undefined });
      toast.success(published ? "Published" : "Unpublished");
      router.refresh();
    } catch { toast.error("Could not update"); }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await upsertFunnel({ id: funnel.id, name: funnelName, description, subDomainName: subdomain || undefined, subAccountId, liveProducts: JSON.stringify(liveProducts) });
      toast.success("Settings saved");
      router.refresh();
    } catch { toast.error("Could not save"); }
    setSaving(false);
  };

  const handleDeleteFunnel = async () => {
    try {
      await deleteFunnel(funnel.id);
      await saveActivityLogsNotification({ description: `Deleted funnel | ${funnel.name}`, subAccountId });
      toast.success("Funnel deleted");
      router.push(`/sub-account/${subAccountId}/funnels`);
    } catch { toast.error("Could not delete"); }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon-sm"><Link href={`/sub-account/${subAccountId}/funnels`}><ArrowLeft /></Link></Button>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{funnel.name}</h1>
              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>{pages.length} pages</span><span>·</span><span>{totalVisits} visits</span>
                {funnel.subDomainName && <><span>·</span><span className="flex items-center gap-1"><Globe className="h-3 w-3" />{funnel.subDomainName}</span></>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5">
              <span className="text-[12px] text-muted-foreground">{funnel.published ? "Live" : "Draft"}</span>
              <Switch checked={funnel.published} onCheckedChange={handlePublishToggle} />
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <Tabs defaultValue="steps">
          <TabsList>
            <TabsTrigger value="steps" className="text-[12px] gap-1"><FileText size={12} /> Steps</TabsTrigger>
            <TabsTrigger value="settings" className="text-[12px] gap-1"><Settings size={12} /> Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="steps" className="mt-4">
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
                                  <p className="text-[10px] text-muted-foreground">/{page.pathName || "(root)"} · {page.visits} visits</p>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="icon-xs" className="opacity-0 group-hover:opacity-100 shrink-0"><MoreHorizontal size={14} /></Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild><Link href={`/editor/${page.id}`}><Pencil /> Edit in editor</Link></DropdownMenuItem>
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
                      <div className="flex gap-1">
                        <Button asChild size="sm" variant="outline" className="h-7 gap-1 text-[11px]">
                          <Link href={`/editor/${selectedPage.id}`}><Pencil size={12} /> Edit</Link>
                        </Button>
                      </div>
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
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-4">
            <div className="mx-auto max-w-2xl space-y-6">

              {/* General */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[15px]">General</CardTitle>
                  <CardDescription>Basic funnel information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-medium">Funnel name</label>
                      <Input value={funnelName} onChange={(e) => setFunnelName(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-medium">Subdomain</label>
                      <div className="flex">
                        <Input value={subdomain} onChange={(e) => setSubdomain(e.target.value)} placeholder="my-site" className="rounded-r-none" />
                        <div className="flex items-center rounded-r-md border border-l-0 bg-muted px-3 text-[12px] text-muted-foreground">.{process.env.NEXT_PUBLIC_DOMAIN}</div>
                      </div>
                      {subdomain && (
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Globe size={10} /> {subdomain}.{process.env.NEXT_PUBLIC_DOMAIN}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium">Description</label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this funnel for?" rows={3} className="resize-none text-[13px]" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium">Favicon</label>
                    <div className="flex items-start gap-4">
                      {favicon && (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={favicon} alt="Favicon" className="h-8 w-8 object-contain" />
                        </div>
                      )}
                      <div className="flex-1">
                        <FileUpload value={favicon} onChange={(url: string | undefined) => setFavicon(url || "")} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Live Products */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-[15px]">Live Products</CardTitle>
                      <CardDescription>Products available for checkout in this funnel</CardDescription>
                    </div>
                    {liveProducts.length > 0 && (
                      <Badge variant="secondary" className="text-[10px]">{liveProducts.length} of {products.length} selected</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {!productsLoaded ? (
                    <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Loading products...
                    </div>
                  ) : products.length === 0 ? (
                    <div className="rounded-lg border border-dashed py-8 text-center">
                      <p className="text-[13px] text-muted-foreground">No products found</p>
                      <p className="text-[11px] text-muted-foreground mt-1">Connect Stripe and create products in your Stripe dashboard</p>
                    </div>
                  ) : (
                    <div className="rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-10">
                              <Checkbox
                                checked={liveProducts.length === products.length}
                                onCheckedChange={(checked) => setLiveProducts(checked ? products.map((p) => p.id) : [])}
                              />
                            </TableHead>
                            <TableHead className="text-[12px]">Product</TableHead>
                            <TableHead className="text-[12px]">Price</TableHead>
                            <TableHead className="text-[12px]">Type</TableHead>
                            <TableHead className="text-[12px] w-20">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {products.map((p) => {
                            const isSelected = liveProducts.includes(p.id);
                            return (
                              <TableRow key={p.id} className={`cursor-pointer ${isSelected ? "bg-primary/[0.03]" : ""}`} onClick={() => setLiveProducts((prev) => prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id])}>
                                <TableCell>
                                  <Checkbox checked={isSelected} onCheckedChange={(checked) => setLiveProducts((prev) => checked ? [...prev, p.id] : prev.filter((id) => id !== p.id))} />
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="text-[13px] font-medium">{p.name}</p>
                                    {p.description && <p className="text-[11px] text-muted-foreground line-clamp-1 max-w-[200px]">{p.description}</p>}
                                  </div>
                                </TableCell>
                                <TableCell className="text-[13px] font-semibold">${(p.amount / 100).toFixed(2)}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-[10px]">{p.recurring ? `${p.recurring}ly` : "One-time"}</Badge>
                                </TableCell>
                                <TableCell>
                                  {isSelected ? (
                                    <Badge className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20" variant="outline">Active</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-[10px] text-muted-foreground">Inactive</Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Save */}
              <div className="flex justify-end">
                <Button onClick={handleSaveSettings} disabled={saving} className="gap-1.5 min-w-[120px]">
                  {saving ? <><div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> Saving...</> : "Save settings"}
                </Button>
              </div>

              {/* Danger Zone */}
              <Card className="border-destructive/20">
                <CardHeader>
                  <CardTitle className="text-[15px] text-destructive">Danger Zone</CardTitle>
                  <CardDescription>These actions are irreversible</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-medium">Delete this funnel</p>
                      <p className="text-[11px] text-muted-foreground">Permanently remove &quot;{funnel.name}&quot; and all its pages</p>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => setDeleteFunnelOpen(true)}>Delete</Button>
                  </div>
                </CardContent>
              </Card>

            </div>
          </TabsContent>
        </Tabs>
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

      <AlertDialog open={deleteFunnelOpen} onOpenChange={setDeleteFunnelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete entire funnel?</AlertDialogTitle>
            <AlertDialogDescription>This permanently deletes &quot;{funnel.name}&quot; and all its pages. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive" onClick={handleDeleteFunnel}>Delete funnel</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Simple HTML preview renderer
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
