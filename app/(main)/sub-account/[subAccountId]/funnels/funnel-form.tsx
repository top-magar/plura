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
import { FileUpload } from "@/components/global/file-upload";
import { upsertFunnel, upsertFunnelPage, saveActivityLogsNotification } from "@/lib/queries";
import { useModal } from "@/providers/modal-provider";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  subDomainName: z.string().optional(),
  favicon: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  subAccountId: string;
  defaultData?: { id: string; name: string; description?: string | null; subDomainName?: string | null; favicon?: string | null };
};

export default function FunnelForm({ subAccountId, defaultData }: Props) {
  const router = useRouter();
  const { setClose } = useModal();

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting, isValid } } = useForm<FormValues>({
    mode: "onChange",
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultData?.name ?? "",
      description: defaultData?.description ?? "",
      subDomainName: defaultData?.subDomainName ?? "",
      favicon: defaultData?.favicon ?? "",
    },
  });

  const subdomain = watch("subDomainName");

  const onSubmit = async (v: FormValues) => {
    try {
      const funnel = await upsertFunnel({
        id: defaultData?.id,
        name: v.name,
        description: v.description || undefined,
        subDomainName: v.subDomainName || undefined,
        subAccountId,
      });
      if (!funnel) throw new Error("Failed");

      if (!defaultData) {
        await upsertFunnelPage({ name: "Home", pathName: "", funnelId: funnel.id, order: 0 });
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium">Funnel name</label>
        <Input placeholder="My Website" {...register("name")} disabled={isSubmitting} autoFocus />
        {errors.name && <p className="text-[12px] text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-[13px] font-medium">Description</label>
        <Textarea placeholder="What is this funnel for?" {...register("description")} disabled={isSubmitting} rows={2} className="resize-none text-[13px]" />
      </div>

      <div className="space-y-1.5">
        <label className="text-[13px] font-medium">Subdomain</label>
        <Input placeholder="my-site" {...register("subDomainName")} disabled={isSubmitting} />
        {subdomain && (
          <p className="text-[11px] text-muted-foreground">
            Your funnel will be available at <span className="font-medium">{subdomain}.{process.env.NEXT_PUBLIC_DOMAIN}</span>
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-[13px] font-medium">Favicon</label>
        <FileUpload value={watch("favicon") || ""} onChange={(url: string | undefined) => setValue("favicon", url || "")} />
      </div>

      <Button type="submit" disabled={isSubmitting || !isValid} className="w-full">
        {isSubmitting ? <><Spinner /> {defaultData ? "Saving..." : "Creating..."}</> : defaultData ? "Save changes" : "Create funnel"}
      </Button>
    </form>
  );
}
