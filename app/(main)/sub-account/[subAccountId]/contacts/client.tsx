"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useModal } from "@/providers/modal-provider";
import CustomModal from "@/components/global/custom-modal";
import ContactForm from "./contact-form";
import { deleteContact, saveActivityLogsNotification } from "@/lib/queries";

type Contact = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  Ticket: { value: unknown }[];
};

type Props = { contacts: Contact[]; subAccountId: string };

export default function ContactsClient({ contacts, subAccountId }: Props) {
  const router = useRouter();
  const { setOpen } = useModal();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = contacts.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteContact(deleteId);
      await saveActivityLogsNotification({ description: "Deleted a contact", subAccountId });
      toast.success("Contact deleted");
      router.refresh();
    } catch {
      toast.error("Could not delete contact");
    }
    setDeleteId(null);
  };

  const totalValue = (c: Contact) => {
    return c.Ticket.reduce((sum, t) => sum + (Number(t.value) || 0), 0);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Contacts</h1>
            <p className="mt-1 text-[13px] text-muted-foreground">{contacts.length} contact{contacts.length !== 1 ? "s" : ""}</p>
          </div>
          <Button
            onClick={() =>
              setOpen(
                <CustomModal title="Add Contact" subheading="Add a new lead to your contacts">
                  <ContactForm subAccountId={subAccountId} />
                </CustomModal>
              )
            }
          >
            <Plus /> Add contact
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search contacts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Ticket Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length > 0 ? (
                filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="text-[13px] font-medium">{c.name}</TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">{c.email}</TableCell>
                    <TableCell className="text-[13px] tabular-nums">${totalValue(c).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={totalValue(c) > 0 ? "default" : "secondary"} className="text-[11px]">
                        {totalValue(c) > 0 ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon-xs" onClick={() => setDeleteId(c.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-[13px] text-muted-foreground">
                    {search ? "No contacts match your search" : "No contacts yet"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete contact?</AlertDialogTitle>
            <AlertDialogDescription>This will remove the contact and unlink any tickets.</AlertDialogDescription>
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
