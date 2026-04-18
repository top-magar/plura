"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { changeUserPermissions, updateUser, getUserPermissions, saveActivityLogsNotification } from "@/lib/queries";
import { useModal } from "@/providers/modal-provider";

type SubAccount = { id: string; name: string };
type Permission = { id: string; access: boolean; subAccountId: string };

type Props = {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  agencyId: string;
  subAccounts: SubAccount[];
};

export default function EditMemberPermissions({ userId, userName, userEmail, userRole, agencyId, subAccounts }: Props) {
  const router = useRouter();
  const { setClose } = useModal();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [role, setRole] = useState(userRole);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await getUserPermissions(userId);
      if (data?.Permissions) {
        setPermissions(data.Permissions.map((p) => ({ id: p.id, access: p.access, subAccountId: p.subAccountId })));
      }
      setLoading(false);
    })();
  }, [userId]);

  const handleToggle = async (subAccountId: string, access: boolean) => {
    const existing = permissions.find((p) => p.subAccountId === subAccountId);
    try {
      const result = await changeUserPermissions(existing?.id, userEmail, subAccountId, access);
      if (result) {
        setPermissions((prev) => {
          const filtered = prev.filter((p) => p.subAccountId !== subAccountId);
          return [...filtered, { id: result.id, access, subAccountId }];
        });
        await saveActivityLogsNotification({
          agencyId,
          description: `${access ? "Gave" : "Removed"} ${userName} access to sub account`,
          subAccountId,
        });
      }
    } catch {
      toast.error("Could not update permission");
    }
  };

  const handleSaveRole = async () => {
    if (role === userRole) return;
    setSaving(true);
    try {
      await updateUser(userId, { role: role as "AGENCY_ADMIN" | "SUBACCOUNT_USER" | "SUBACCOUNT_GUEST" });
      await saveActivityLogsNotification({ agencyId, description: `Changed ${userName}'s role to ${role.replace(/_/g, " ").toLowerCase()}` });
      toast.success("Role updated");
      router.refresh();
    } catch {
      toast.error("Could not update role");
    }
    setSaving(false);
  };

  const isOwner = userRole === "AGENCY_OWNER";

  return (
    <div className="space-y-6">
      {/* Role */}
      <div className="space-y-2">
        <label className="text-[13px] font-medium">Role</label>
        {isOwner ? (
          <Badge variant="secondary" className="capitalize">{userRole.replace(/_/g, " ").toLowerCase()}</Badge>
        ) : (
          <div className="flex gap-2">
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="AGENCY_ADMIN">Agency Admin</SelectItem>
                <SelectItem value="SUBACCOUNT_USER">Sub Account User</SelectItem>
                <SelectItem value="SUBACCOUNT_GUEST">Sub Account Guest</SelectItem>
              </SelectContent>
            </Select>
            {role !== userRole && (
              <Button size="sm" onClick={handleSaveRole} disabled={saving}>
                {saving ? <Spinner /> : "Save"}
              </Button>
            )}
          </div>
        )}
      </div>

      <Separator />

      {/* Permissions */}
      <div className="space-y-3">
        <label className="text-[13px] font-medium">Sub Account Access</label>
        <p className="text-[12px] text-muted-foreground">Toggle which sub accounts this member can access.</p>

        {loading ? (
          <div className="flex justify-center py-4"><Spinner /></div>
        ) : subAccounts.length > 0 ? (
          <div className="space-y-2">
            {subAccounts.map((sub) => {
              const perm = permissions.find((p) => p.subAccountId === sub.id);
              return (
                <div key={sub.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <span className="text-[13px]">{sub.name}</span>
                  <Switch
                    checked={perm?.access ?? false}
                    onCheckedChange={(v) => handleToggle(sub.id, v)}
                    disabled={isOwner}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[12px] text-muted-foreground">No sub accounts to assign.</p>
        )}
      </div>

      <Button variant="outline" className="w-full" onClick={setClose}>Done</Button>
    </div>
  );
}
