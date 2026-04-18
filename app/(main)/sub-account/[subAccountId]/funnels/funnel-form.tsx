"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { upsertFunnel, upsertFunnelPage, saveActivityLogsNotification } from "@/lib/queries";
import { useModal } from "@/providers/modal-provider";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
});

type Props = {
  subAccountId: string;
  defaultData?: { id: string; name: string; description?: string | null; subDomainName?: string | null };
};

export default function FunnelForm({ subAccountId, defaultData }: Props) {
  const router = useRouter();
  const { setClose } = useModal();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: defaultData?.name ?? "" },
  });

  const onSubmit = async (v: { name: string }) => {
    try {
      const funnel = await upsertFunnel({ id: defaultData?.id, name: v.name, subAccountId });
      if (!funnel) throw new Error("Failed");

      // Auto-create first page for new funnels
      if (!defaultData) {
        await upsertFunnelPage({
          name: "Home",
          pathName: "",
          funnelId: funnel.id,
          order: 0,
        });
      }

      await saveActivityLogsNotification({
        description: `${defaultData ? "Updated" : "Created"} funnel | ${v.name}`,
        subAccountId,
      });

      toast.success(defaultData ? "Funnel updated" : "Funnel created");
      setClose();
      router.push(`/sub-account/${subAccountId}/funnels/${funnel.id}`);
      router.refresh();
    } catch {
      toast.error("Could not save funnel");
    }
  };

  return (
    // @ts-expect-error zod compat
    <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium">Funnel name</label>
        <Input placeholder="My Website" {...register("name")} disabled={isSubmitting} autoFocus />
        {errors.name && <p className="text-[12px] text-destructive">{errors.name.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? <><Spinner /> Creating...</> : defaultData ? "Save" : "Create funnel"}
      </Button>
    </form>
  );
}
