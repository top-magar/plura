"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { upsertPipeline, saveActivityLogsNotification } from "@/lib/queries";
import { useModal } from "@/providers/modal-provider";

const schema = z.object({ name: z.string().min(1, "Pipeline name is required") });

type Props = {
  subAccountId: string;
  defaultData?: { id: string; name: string };
};

export default function PipelineForm({ subAccountId, defaultData }: Props) {
  const router = useRouter();
  const { setClose } = useModal();

  const { register, handleSubmit, formState: { errors, isSubmitting, isValid } } = useForm({
    mode: "onChange",
    resolver: zodResolver(schema),
    defaultValues: { name: defaultData?.name ?? "" },
  });

  const onSubmit = async (v: { name: string }) => {
    try {
      await upsertPipeline({ id: defaultData?.id, name: v.name, subAccountId });
      await saveActivityLogsNotification({
        description: `${defaultData ? "Updated" : "Created"} pipeline | ${v.name}`,
        subAccountId,
      });
      toast.success(defaultData ? "Pipeline updated" : "Pipeline created");
      setClose();
      router.refresh();
    } catch {
      toast.error("Could not save pipeline");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium">Pipeline name</label>
        <Input placeholder="Lead Cycle" {...register("name")} disabled={isSubmitting} autoFocus />
        {errors.name && <p className="text-[12px] text-destructive">{errors.name.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting || !isValid} className="w-full">
        {isSubmitting ? <><Spinner /> Saving...</> : defaultData ? "Update" : "Create pipeline"}
      </Button>
    </form>
  );
}
