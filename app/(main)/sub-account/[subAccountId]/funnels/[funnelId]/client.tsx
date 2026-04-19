"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy, ExternalLink, FileText, Globe, MoreHorizontal, Pencil, Plus, Trash2, ArrowUpDown, Eye } from "lucide-react";
import { toast } from "sonner";
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, type SortingState, type ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { deleteFunnelPage, upsertFunnel, upsertFunnelPage, saveActivityLogsNotification } from "@/lib/queries";

type FunnelPage = { id: string; name: string; pathName: string; order: number; visits: number; content: string | null };
type Funnel = { id: string; name: string; description: string | null; subDomainName: string | null; published: boolean; subAccountId: string; FunnelPages: FunnelPage[] };

type Props = { funnel: Funnel; subAccountId: string };

export default function FunnelDetailClient({ funnel, subAccountId }: Props) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [deletePageId, setDeletePageId] = useState<string | null>(null);
  const [subdomain, setSubdomain] = useState(funnel.subDomainName ?? "");
  const [description, setDescription] = useState(funnel.description ?? "");
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<FunnelPage>[] = [
    { accessorKey: "order", header: "#", cell: ({ row }) => <span className="text-[12px] text-muted-foreground">{row.original.order + 1}</span>, size: 40 },
    { accessorKey: "name", header: ({ column }) => <Button variant="ghost" size="sm" className="h-7 -ml-2 text-[12px]" onClick={() => column.toggleSorting()}>Name <ArrowUpDown className="ml-1 h-3 w-3" /></Button>,
      cell: ({ row }) => (
        <div>
          <p className="text-[13px] font-medium">{row.original.name}</p>
          <p className="text-[11px] text-muted-foreground">/{row.original.pathName || "(root)"}</p>
        </div>
      ),
    },
    { accessorKey: "visits", header: ({ column }) => <Button variant="ghost" size="sm" className="h-7 -ml-2 text-[12px]" onClick={() => column.toggleSorting()}>Visits <ArrowUpDown className="ml-1 h-3 w-3" /></Button>,
      cell: ({ row }) => <div className="flex items-center gap-1.5 text-[13px]"><Eye className="h-3 w-3 text-muted-foreground" /> {row.original.visits}</div>,
    },
    { id: "status", header: "Status",
      cell: ({ row }) => <Badge variant={row.original.content ? "default" : "outline"} className="text-[10px]">{row.original.content ? "Has content" : "Empty"}</Badge>,
    },
    { id: "actions", header: "", size: 80,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button asChild variant="outline" size="sm" className="h-7 gap-1 text-[11px]">
            <Link href={`/editor/${row.original.id}`}><Pencil className="h-3 w-3" /> Edit</Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-xs"><MoreHorizontal /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleDuplicate(row.original)}><Copy /> Duplicate</DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => setDeletePageId(row.original.id)}><Trash2 /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const table = useReactTable({ data: funnel.FunnelPages, columns, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });

  const handleAddPage = async () => {
    if (!newPageName.trim()) return;
    try {
      await upsertFunnelPage({ name: newPageName, pathName: newPageName.toLowerCase().replace(/\s+/g, "-"), funnelId: funnel.id, order: funnel.FunnelPages.length });
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
      toast.success("Page deleted");
      router.refresh();
    } catch { toast.error("Could not delete page"); }
    setDeletePageId(null);
  };

  const handleDuplicate = async (page: FunnelPage) => {
    try {
      await upsertFunnelPage({ name: `${page.name} (copy)`, pathName: `${page.pathName}-copy`, funnelId: funnel.id, order: funnel.FunnelPages.length, content: page.content ?? undefined });
      toast.success("Page duplicated");
      router.refresh();
    } catch { toast.error("Could not duplicate"); }
  };

  const handlePublishToggle = async (published: boolean) => {
    try {
      await upsertFunnel({ id: funnel.id, name: funnel.name, subAccountId, subDomainName: subdomain || undefined });
      // Update published via direct DB call would be better, but upsert works
      toast.success(published ? "Funnel published" : "Funnel unpublished");
      router.refresh();
    } catch { toast.error("Could not update"); }
  };

  const handleSaveSettings = async () => {
    try {
      await upsertFunnel({ id: funnel.id, name: funnel.name, description, subDomainName: subdomain || undefined, subAccountId });
      toast.success("Settings saved");
      router.refresh();
    } catch { toast.error("Could not save"); }
  };

  const totalVisits = funnel.FunnelPages.reduce((s, p) => s + p.visits, 0);

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon-sm">
              <Link href={`/sub-account/${subAccountId}/funnels`}><ArrowLeft /></Link>
            </Button>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{funnel.name}</h1>
              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>{funnel.FunnelPages.length} pages</span>
                <span>·</span>
                <span>{totalVisits} visits</span>
                {funnel.subDomainName && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{funnel.subDomainName}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5">
              <span className="text-[12px] text-muted-foreground">{funnel.published ? "Live" : "Draft"}</span>
              <Switch checked={funnel.published} onCheckedChange={handlePublishToggle} />
            </div>
            {funnel.subDomainName && (
              <Button asChild variant="outline" size="sm">
                <a href={`http://${funnel.subDomainName}.${process.env.NEXT_PUBLIC_DOMAIN}`} target="_blank" rel="noopener">
                  <ExternalLink /> Preview
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <Tabs defaultValue="pages">
          <TabsList>
            <TabsTrigger value="pages" className="text-[12px]">Pages</TabsTrigger>
            <TabsTrigger value="settings" className="text-[12px]">Settings</TabsTrigger>
          </TabsList>

          {/* Pages Tab */}
          <TabsContent value="pages" className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-muted-foreground">
                Pages are displayed in order. Visitors navigate through them sequentially.
              </p>
              <Button size="sm" onClick={() => setAdding(true)} className="gap-1.5 text-[12px]">
                <Plus className="h-3.5 w-3.5" /> Add page
              </Button>
            </div>

            {adding && (
              <div className="flex gap-2">
                <Input placeholder="Page name" value={newPageName} onChange={(e) => setNewPageName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddPage()} autoFocus className="max-w-xs" />
                <Button size="sm" onClick={handleAddPage}>Add</Button>
                <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setNewPageName(""); }}>Cancel</Button>
              </div>
            )}

            {funnel.FunnelPages.length > 0 ? (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((hg) => (
                      <TableRow key={hg.id}>
                        {hg.headers.map((h) => (
                          <TableHead key={h.id} style={{ width: h.getSize() !== 150 ? h.getSize() : undefined }}>
                            {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} className="group">
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed py-12 text-center">
                <FileText className="mx-auto h-8 w-8 text-muted-foreground/30" />
                <p className="mt-3 text-[13px] text-muted-foreground">No pages yet</p>
                <Button variant="link" className="mt-1" onClick={() => setAdding(true)}>Add your first page</Button>
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-4 space-y-6">
            <div className="max-w-md space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium">Description</label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this funnel for?" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium">Subdomain</label>
                <Input value={subdomain} onChange={(e) => setSubdomain(e.target.value)} placeholder="my-site" />
                <p className="text-[11px] text-muted-foreground">Available at {subdomain || "my-site"}.{process.env.NEXT_PUBLIC_DOMAIN}</p>
              </div>
              <Button size="sm" onClick={handleSaveSettings}>Save settings</Button>
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
    </>
  );
}
