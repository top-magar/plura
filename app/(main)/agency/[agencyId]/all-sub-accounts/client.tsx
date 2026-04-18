"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useModal } from "@/providers/modal-provider";
import CustomModal from "@/components/global/custom-modal";
import SubAccountDetails from "@/components/forms/sub-account-details";
import { deleteSubAccount, saveActivityLogsNotification } from "@/lib/queries";
import type { SubAccount } from "@/lib/generated/prisma/client";

type Props = {
  subAccounts: SubAccount[];
  agencyId: string;
  user: { id: string; name: string };
};

export default function AllSubAccountsClient({ subAccounts, agencyId, user }: Props) {
  const router = useRouter();
  const { setOpen } = useModal();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = subAccounts.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async () => {
    if (!deleteId) return;
    const sub = subAccounts.find((s) => s.id === deleteId);
    try {
      await deleteSubAccount(deleteId);
      await saveActivityLogsNotification({ agencyId, description: `Deleted sub account | ${sub?.name}`, subAccountId: undefined });
      toast.success("Sub account deleted");
      router.refresh();
    } catch {
      toast.error("Could not delete sub account");
    }
    setDeleteId(null);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Sub Accounts</h1>
            <p className="mt-1 text-[13px] text-muted-foreground">{subAccounts.length} account{subAccounts.length !== 1 ? "s" : ""}</p>
          </div>
          <Button
            onClick={() =>
              setOpen(
                <CustomModal title="Create Sub Account" subheading="You can switch between accounts from the sidebar">
                  <SubAccountDetails agencyDetails={{ Agency: { id: agencyId } }} userId={user.id} userName={user.name} />
                </CustomModal>
              )
            }
          >
            <Plus /> Create
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search accounts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        {filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((sub) => (
              <div key={sub.id} className="group relative rounded-lg border p-4 transition-shadow hover:shadow-md">
                <Link href={`/sub-account/${sub.id}`} className="flex items-center gap-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border">
                    <Image src={sub.subAccountLogo} alt={sub.name} fill sizes="40px" className="object-contain p-1" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium">{sub.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{sub.address || sub.companyEmail}</p>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="absolute right-2 top-2 opacity-0 group-hover:opacity-100"
                  onClick={() => setDeleteId(sub.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
            <p className="text-[13px] text-muted-foreground">{search ? "No accounts match" : "No sub accounts yet"}</p>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete sub account?</AlertDialogTitle>
            <AlertDialogDescription>This permanently deletes the sub account and all its data.</AlertDialogDescription>
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
