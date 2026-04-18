"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { upsertFunnel, saveActivityLogsNotification } from "@/lib/queries";
import { useModal } from "@/providers/modal-provider";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  subDomainName: z.string().optional(),
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
    defaultValues: {
      name: defaultData?.name ?? "",
      description: defaultData?.description ?? "",
      subDomainName: defaultData?.subDomainName ?? "",
    },
  });

  const onSubmit = async (v: { name: string; description?: string; subDomainName?: string }) => {
    try {
      const result = await upsertFunnel({ id: defaultData?.id, ...v, subAccountId });
      await saveActivityLogsNotification({
        description: `${defaultData ? "Updated" : "Created"} funnel | ${v.name}`,
        subAccountId,
      });
      toast.success(defaultData ? "Funnel updated" : "Funnel created");
      setClose();
      if (!defaultData && result) router.push(`/sub-account/${subAccountId}/funnels/${result.id}`);
      else router.refresh();
    } catch {
      toast.error("Could not save funnel");
    }
  };

  return (
    // @ts-expect-error zod v3/v4 compat
    <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium">Funnel name</label>
        <Input placeholder="My Website" {...register("name")} disabled={isSubmitting} autoFocus />
        {errors.name && <p className="text-[12px] text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium">Description</label>
        <Textarea placeholder="What is this funnel for?" {...register("description")} disabled={isSubmitting} rows={3} />
      </div>
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium">Subdomain</label>
        <Input placeholder="my-site" {...register("subDomainName")} disabled={isSubmitting} />
        <p className="text-[11px] text-muted-foreground">Your funnel will be available at my-site.{process.env.NEXT_PUBLIC_DOMAIN}</p>
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? <><Spinner /> Saving...</> : defaultData ? "Update funnel" : "Create funnel"}
      </Button>
    </form>
  );
}
