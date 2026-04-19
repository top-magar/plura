"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useModal } from "@/providers/modal-provider";
import CustomModal from "@/components/global/custom-modal";
import InviteForm from "./invite-form";
import EditMemberPermissions from "./edit-permissions";
import { deleteUser, saveActivityLogsNotification } from "@/lib/queries";

type Member = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
  Permissions: { id: string; access: boolean; SubAccount: { id: string; name: string } }[];
};

type Props = { teamMembers: Member[]; agencyId: string; subAccounts: { id: string; name: string }[]; pendingInvitations: { id: string; email: string; role: string; status: string }[] };

export default function TeamClient({ teamMembers, agencyId, subAccounts, pendingInvitations }: Props) {
  const router = useRouter();
  const { setOpen } = useModal();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = teamMembers.filter(
    (m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteUser(deleteId);
      await saveActivityLogsNotification({ agencyId, description: "Removed a team member" });
      toast.success("Team member removed");
      router.refresh();
    } catch {
      toast.error("Could not remove member");
    }
    setDeleteId(null);
  };

  const roleColor = (role: string) => {
    if (role === "AGENCY_OWNER") return "default";
    if (role === "AGENCY_ADMIN") return "secondary";
    return "outline";
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Team</h1>
            <p className="mt-1 text-[13px] text-muted-foreground">{teamMembers.length} member{teamMembers.length !== 1 ? "s" : ""}</p>
          </div>
          <Button
            onClick={() =>
              setOpen(
                <CustomModal title="Invite Member" subheading="Send an invitation to join your agency">
                  <InviteForm agencyId={agencyId} />
                </CustomModal>
              )
            }
          >
            <Plus /> Invite
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search members..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Sub Accounts</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={m.avatarUrl} />
                        <AvatarFallback className="text-[10px]">{m.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-[13px] font-medium">{m.name}</p>
                        <p className="text-[11px] text-muted-foreground">{m.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleColor(m.role) as "default" | "secondary" | "outline"} className="text-[11px] capitalize">
                      {m.role.replace(/_/g, " ").toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {m.Permissions.filter((p) => p.access).map((p) => (
                        <Badge key={p.id} variant="outline" className="text-[10px]">{p.SubAccount.name}</Badge>
                      ))}
                      {m.Permissions.filter((p) => p.access).length === 0 && (
                        <span className="text-[11px] text-muted-foreground">None</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() =>
                          setOpen(
                            <CustomModal title={`Edit ${m.name}`} subheading="Change role and sub account access">
                              <EditMemberPermissions
                                userId={m.id}
                                userName={m.name}
                                userEmail={m.email}
                                userRole={m.role}
                                agencyId={agencyId}
                                subAccounts={subAccounts}
                              />
                            </CustomModal>
                          )
                        }
                      >
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                      {m.role !== "AGENCY_OWNER" && (
                        <Button variant="ghost" size="icon-xs" onClick={() => setDeleteId(m.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-[13px] text-muted-foreground">No team members found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {pendingInvitations.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">Pending Invitations ({pendingInvitations.length})</h2>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingInvitations.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="text-[13px]">{inv.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[11px] capitalize">{inv.role.replace(/_/g, " ").toLowerCase()}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[11px]">Pending</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove team member?</AlertDialogTitle>
            <AlertDialogDescription>They will lose access to the agency and all sub accounts.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive" onClick={handleDelete}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
