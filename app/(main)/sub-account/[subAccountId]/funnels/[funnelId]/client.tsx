"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Eye, FileText, GripVertical, MoreHorizontal, Pencil, Plus, Settings, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { deleteFunnelPage, upsertFunnelPage, saveActivityLogsNotification } from "@/lib/queries";

type FunnelPage = {
  id: string;
  name: string;
  pathName: string;
  order: number;
  visits: number;
  content: string | null;
};

type Funnel = {
  id: string;
  name: string;
  description: string | null;
  subDomainName: string | null;
  published: boolean;
  subAccountId: string;
  FunnelPages: FunnelPage[];
};

type Props = { funnel: Funnel; subAccountId: string };

export default function FunnelDetailClient({ funnel, subAccountId }: Props) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [deletePageId, setDeletePageId] = useState<string | null>(null);

  const handleAddPage = async () => {
    if (!newPageName.trim()) return;
    try {
      await upsertFunnelPage({
        name: newPageName,
        pathName: newPageName.toLowerCase().replace(/\s+/g, "-"),
        funnelId: funnel.id,
        order: funnel.FunnelPages.length,
      });
      await saveActivityLogsNotification({ description: `Created funnel page | ${newPageName}`, subAccountId });
      toast.success("Page created");
      setNewPageName("");
      setAdding(false);
      router.refresh();
    } catch {
      toast.error("Could not create page");
    }
  };

  const handleDeletePage = async () => {
    if (!deletePageId) return;
    try {
      await deleteFunnelPage(deletePageId);
      await saveActivityLogsNotification({ description: "Deleted a funnel page", subAccountId });
      toast.success("Page deleted");
      router.refresh();
    } catch {
      toast.error("Could not delete page");
    }
    setDeletePageId(null);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon-sm">
            <Link href={`/sub-account/${subAccountId}/funnels`}><ArrowLeft /></Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">{funnel.name}</h1>
              <Badge variant={funnel.published ? "default" : "secondary"} className="text-[10px]">
                {funnel.published ? "Live" : "Draft"}
              </Badge>
            </div>
            {funnel.description && <p className="mt-0.5 text-[13px] text-muted-foreground">{funnel.description}</p>}
          </div>
          {funnel.subDomainName && (
            <Button asChild variant="outline" size="sm" className="gap-1.5 text-[12px]">
              <a href={`${process.env.NEXT_PUBLIC_SCHEME}://${funnel.subDomainName}.${process.env.NEXT_PUBLIC_DOMAIN}`} target="_blank" rel="noopener">
                <ExternalLink className="h-3.5 w-3.5" /> Visit site
              </a>
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-[12px] text-muted-foreground">Pages</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{funnel.FunnelPages.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-[12px] text-muted-foreground">Total Visits</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{funnel.FunnelPages.reduce((s, p) => s + p.visits, 0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-[12px] text-muted-foreground">Subdomain</p>
              <p className="mt-1 truncate text-[13px] font-medium">{funnel.subDomainName || "Not set"}</p>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Pages */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold">Funnel Pages</h2>
            <Button size="sm" onClick={() => setAdding(true)} className="gap-1.5 text-[12px]">
              <Plus className="h-3.5 w-3.5" /> Add page
            </Button>
          </div>

          {adding && (
            <div className="flex gap-2">
              <Input
                placeholder="Page name"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddPage()}
                autoFocus
                className="max-w-xs"
              />
              <Button size="sm" onClick={handleAddPage}>Add</Button>
              <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setNewPageName(""); }}>Cancel</Button>
            </div>
          )}

          {funnel.FunnelPages.length > 0 ? (
            <div className="space-y-2">
              {funnel.FunnelPages.map((page, i) => (
                <div key={page.id} className="group flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors hover:bg-muted/30">
                  <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-muted text-[11px] font-medium">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium">{page.name}</p>
                    <p className="text-[11px] text-muted-foreground">/{page.pathName} · {page.visits} visit{page.visits !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <Button asChild variant="ghost" size="icon-xs">
                      <Link href={`/sub-account/${subAccountId}/funnels/${funnel.id}/editor/${page.id}`}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-xs"><MoreHorizontal /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem variant="destructive" onClick={() => setDeletePageId(page.id)}>
                          <Trash2 /> Delete page
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed py-12 text-center">
              <FileText className="mx-auto h-8 w-8 text-muted-foreground/30" />
              <p className="mt-3 text-[13px] text-muted-foreground">No pages yet</p>
              <Button variant="link" className="mt-1" onClick={() => setAdding(true)}>Add your first page</Button>
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
