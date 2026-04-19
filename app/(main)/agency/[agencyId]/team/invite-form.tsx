"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { sendInvitation, saveActivityLogsNotification } from "@/lib/queries";
import { useModal } from "@/providers/modal-provider";

const schema = z.object({
  email: z.string().email("Invalid email"),
  role: z.enum(["AGENCY_ADMIN", "SUBACCOUNT_USER", "SUBACCOUNT_GUEST"]),
});

export default function InviteForm({ agencyId }: { agencyId: string }) {
  const router = useRouter();
  const { setClose } = useModal();

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting, isValid } } = useForm({
    mode: "onChange",
    resolver: zodResolver(schema),
    defaultValues: { email: "", role: "SUBACCOUNT_USER" as const },
  });

  const onSubmit = async (v: { email: string; role: string }) => {
    try {
      await sendInvitation(v.role, v.email, agencyId);
      await saveActivityLogsNotification({ agencyId, description: `Invited ${v.email} as ${v.role.replace(/_/g, " ").toLowerCase()}` });
      toast.success("Invitation sent");
      setClose();
      router.refresh();
    } catch {
      toast.error("Could not send invitation");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium">Email</label>
        <Input placeholder="member@example.com" type="email" {...register("email")} disabled={isSubmitting} autoFocus />
        {errors.email && <p className="text-[12px] text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium">Role</label>
        <Select defaultValue="SUBACCOUNT_USER" onValueChange={(v) => setValue("role", v as "AGENCY_ADMIN" | "SUBACCOUNT_USER" | "SUBACCOUNT_GUEST")}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="AGENCY_ADMIN">Agency Admin</SelectItem>
            <SelectItem value="SUBACCOUNT_USER">Sub Account User</SelectItem>
            <SelectItem value="SUBACCOUNT_GUEST">Sub Account Guest</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && <p className="text-[12px] text-destructive">{errors.role.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting || !isValid} className="w-full">
        {isSubmitting ? <><Spinner /> Sending...</> : "Send invitation"}
      </Button>
    </form>
  );
}
