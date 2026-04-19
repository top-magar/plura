"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutTemplate, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useModal } from "@/providers/modal-provider";
import CustomModal from "@/components/global/custom-modal";
import { DataTable } from "@/components/global/data-table";
import FunnelForm from "./funnel-form";
import { columns, type FunnelColumn } from "./columns";
import { deleteFunnel, saveActivityLogsNotification } from "@/lib/queries";

type Props = { funnels: FunnelColumn[]; subAccountId: string };

export default function FunnelsClient({ funnels, subAccountId }: Props) {
  const router = useRouter();
  const { setOpen } = useModal();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "live" | "draft">("all");

  const filtered = funnels.filter((f) => tab === "all" ? true : tab === "live" ? f.published : !f.published);
  const liveCount = funnels.filter((f) => f.published).length;
  const draftCount = funnels.filter((f) => !f.published).length;

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteFunnel(deleteId);
      await saveActivityLogsNotification({ description: "Deleted a funnel", subAccountId });
      toast.success("Funnel deleted");
      router.refresh();
    } catch { toast.error("Could not delete funnel"); }
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Funnels</h1>
            <p className="mt-1 text-[13px] text-muted-foreground">Build and manage websites and funnels for your clients.</p>
          </div>
          <Button onClick={openCreate} className="gap-1.5"><Plus /> New funnel</Button>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | "live" | "draft")}>
          <TabsList>
            <TabsTrigger value="all" className="text-[12px]">All ({funnels.length})</TabsTrigger>
            <TabsTrigger value="live" className="text-[12px]">Live ({liveCount})</TabsTrigger>
            <TabsTrigger value="draft" className="text-[12px]">Drafts ({draftCount})</TabsTrigger>
          </TabsList>
        </Tabs>

        {filtered.length > 0 ? (
          <DataTable columns={columns(subAccountId, setDeleteId)} data={filtered} searchKey="name" searchPlaceholder="Search funnels..." />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <LayoutTemplate className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="mt-4 text-[14px] font-medium">No funnels yet</p>
            <p className="mt-1 text-[12px] text-muted-foreground">Create your first funnel to get started</p>
            <Button className="mt-4 gap-1.5" onClick={openCreate}><Plus /> Create funnel</Button>
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
