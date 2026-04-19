"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Globe, LayoutTemplate, MoreHorizontal, Pencil, Plus, Search, Trash2, LayoutGrid, TableIcon, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, type SortingState, type ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useModal } from "@/providers/modal-provider";
import CustomModal from "@/components/global/custom-modal";
import FunnelForm from "./funnel-form";
import { deleteFunnel, saveActivityLogsNotification } from "@/lib/queries";

type Funnel = {
  id: string;
  name: string;
  description: string | null;
  subDomainName: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  subAccountId: string;
  FunnelPages: { id: string }[];
};

type Props = { funnels: Funnel[]; subAccountId: string };

export default function FunnelsClient({ funnels, subAccountId }: Props) {
  const router = useRouter();
  const { setOpen } = useModal();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "live" | "draft">("all");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [sorting, setSorting] = useState<SortingState>([]);

  const filtered = funnels
    .filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    .filter((f) => tab === "all" ? true : tab === "live" ? f.published : !f.published);

  const columns: ColumnDef<Funnel>[] = [
    { accessorKey: "name", header: ({ column }) => <Button variant="ghost" size="sm" className="h-7 -ml-2 text-[12px]" onClick={() => column.toggleSorting()}>Name <ArrowUpDown className="ml-1 h-3 w-3" /></Button>,
      cell: ({ row }) => (
        <Link href={`/sub-account/${subAccountId}/funnels/${row.original.id}`} className="hover:underline">
          <p className="text-[13px] font-medium">{row.original.name}</p>
          {row.original.description && <p className="text-[11px] text-muted-foreground line-clamp-1">{row.original.description}</p>}
        </Link>
      ),
    },
    { id: "status", header: "Status", cell: ({ row }) => <Badge variant="outline" className={`text-[10px] ${row.original.published ? "border-emerald-500/30 text-emerald-600" : ""}`}>{row.original.published ? "Live" : "Draft"}</Badge> },
    { id: "pages", header: "Pages", cell: ({ row }) => <span className="text-[13px]">{row.original.FunnelPages.length}</span> },
    { id: "domain", header: "Domain", cell: ({ row }) => row.original.subDomainName ? <span className="flex items-center gap-1 text-[12px] text-muted-foreground"><Globe className="h-3 w-3" />{row.original.subDomainName}</span> : <span className="text-[12px] text-muted-foreground">—</span> },
    { accessorKey: "updatedAt", header: ({ column }) => <Button variant="ghost" size="sm" className="h-7 -ml-2 text-[12px]" onClick={() => column.toggleSorting()}>Updated <ArrowUpDown className="ml-1 h-3 w-3" /></Button>,
      cell: ({ row }) => <span className="text-[12px] text-muted-foreground">{new Date(row.original.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>,
    },
    { id: "actions", header: "", size: 60, cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-xs"><MoreHorizontal /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild><Link href={`/sub-account/${subAccountId}/funnels/${row.original.id}`}><Pencil /> Edit</Link></DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setDeleteId(row.original.id)}><Trash2 /> Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )},
  ];

  const table = useReactTable({ data: filtered, columns, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });

  const liveCount = funnels.filter((f) => f.published).length;
  const draftCount = funnels.filter((f) => !f.published).length;

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteFunnel(deleteId);
      await saveActivityLogsNotification({ description: "Deleted a funnel", subAccountId });
      toast.success("Funnel deleted");
      router.refresh();
    } catch {
      toast.error("Could not delete funnel");
    }
    setDeleteId(null);
  };

  const openCreate = () =>
    setOpen(
      <CustomModal title="Create Funnel" subheading="Create a new funnel or website for your client">
        <FunnelForm subAccountId={subAccountId} />
      </CustomModal>
    );

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Funnels</h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Build and manage websites and funnels for your clients.
            </p>
          </div>
          <Button onClick={openCreate} className="gap-1.5">
            <Plus /> New funnel
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | "live" | "draft")}>
            <TabsList>
              <TabsTrigger value="all" className="text-[12px]">All ({funnels.length})</TabsTrigger>
              <TabsTrigger value="live" className="text-[12px]">Live ({liveCount})</TabsTrigger>
              <TabsTrigger value="draft" className="text-[12px]">Drafts ({draftCount})</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search funnels..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-1 border rounded-lg p-0.5">
            <Button variant={view === "grid" ? "secondary" : "ghost"} size="icon-xs" onClick={() => setView("grid")}><LayoutGrid size={14} /></Button>
            <Button variant={view === "table" ? "secondary" : "ghost"} size="icon-xs" onClick={() => setView("table")}><TableIcon size={14} /></Button>
          </div>
        </div>

        {/* Content */}
        {filtered.length > 0 ? (
          view === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((funnel) => (
              <div key={funnel.id} className="group relative overflow-hidden rounded-xl border bg-card transition-all hover:shadow-md hover:border-primary/20">
                <Link href={`/sub-account/${subAccountId}/funnels/${funnel.id}`} className="block p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <LayoutTemplate className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-[14px] font-medium leading-tight">{funnel.name}</h3>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          Updated {new Date(funnel.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`shrink-0 text-[10px] ${funnel.published ? "border-emerald-500/30 text-emerald-600" : ""}`}
                    >
                      {funnel.published ? "Live" : "Draft"}
                    </Badge>
                  </div>

                  {funnel.description && (
                    <p className="mt-3 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">{funnel.description}</p>
                  )}

                  <Separator className="my-3" />

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{funnel.FunnelPages.length} page{funnel.FunnelPages.length !== 1 ? "s" : ""}</span>
                    <div className="flex items-center gap-2">
                      {funnel.subDomainName && (
                        <span className="flex items-center gap-1 truncate">
                          <Globe className="h-3 w-3" /> {funnel.subDomainName}
                        </span>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                          <Button variant="ghost" size="icon-xs" className="opacity-0 group-hover:opacity-100">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenuItem asChild>
                            <Link href={`/sub-account/${subAccountId}/funnels/${funnel.id}`}>
                              <Pencil /> Edit
                            </Link>
                          </DropdownMenuItem>
                          {funnel.subDomainName && (
                            <DropdownMenuItem onClick={() => window.open(`/${funnel.subDomainName}`, "_blank")}>
                              <ExternalLink /> Preview
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => setDeleteId(funnel.id)}>
                            <Trash2 /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((h) => (
                      <TableHead key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <LayoutTemplate className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="mt-4 text-[14px] font-medium">{search ? "No funnels match your search" : "No funnels yet"}</p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              {search ? "Try a different search term" : "Create your first funnel to get started"}
            </p>
            {!search && (
              <Button className="mt-4 gap-1.5" onClick={openCreate}>
                <Plus /> Create funnel
              </Button>
            )}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete funnel?</AlertDialogTitle>
            <AlertDialogDescription>This deletes the funnel and all its pages permanently.</AlertDialogDescription>
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
