"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Globe, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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

  const filtered = funnels.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));

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

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Funnels</h1>
            <p className="mt-1 text-[13px] text-muted-foreground">{funnels.length} funnel{funnels.length !== 1 ? "s" : ""}</p>
          </div>
          <Button
            onClick={() =>
              setOpen(
                <CustomModal title="Create Funnel" subheading="Create a new funnel or website for your client">
                  <FunnelForm subAccountId={subAccountId} />
                </CustomModal>
              )
            }
          >
            <Plus /> Create funnel
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search funnels..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        {filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((funnel) => (
              <div key={funnel.id} className="group relative rounded-lg border transition-shadow hover:shadow-md">
                <Link href={`/sub-account/${subAccountId}/funnels/${funnel.id}`} className="block p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-[13px] font-medium">{funnel.name}</h3>
                    </div>
                    <Badge variant={funnel.published ? "default" : "secondary"} className="text-[10px]">
                      {funnel.published ? "Live" : "Draft"}
                    </Badge>
                  </div>
                  {funnel.description && (
                    <p className="mt-2 line-clamp-2 text-[12px] text-muted-foreground">{funnel.description}</p>
                  )}
                  <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span>{funnel.FunnelPages.length} page{funnel.FunnelPages.length !== 1 ? "s" : ""}</span>
                    {funnel.subDomainName && (
                      <span className="flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" /> {funnel.subDomainName}
                      </span>
                    )}
                  </div>
                </Link>

                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-xs"><MoreHorizontal /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem variant="destructive" onClick={() => setDeleteId(funnel.id)}>
                        <Trash2 /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
            <Globe className="h-8 w-8 text-muted-foreground/30" />
            <p className="mt-3 text-[13px] text-muted-foreground">{search ? "No funnels match" : "No funnels yet"}</p>
            {!search && (
              <Button variant="link" className="mt-1" onClick={() =>
                setOpen(
                  <CustomModal title="Create Funnel" subheading="Create a new funnel or website">
                    <FunnelForm subAccountId={subAccountId} />
                  </CustomModal>
                )
              }>
                Create your first funnel
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
