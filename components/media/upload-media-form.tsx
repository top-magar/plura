"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import { toast } from "sonner";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { FileUpload } from "@/components/global/file-upload";
import { createMedia, saveActivityLogsNotification } from "@/lib/queries";

const schema = z.object({
  link: z.string().min(1, "File is required"),
  name: z.string().min(1, "Name is required"),
});

type FormValues = z.infer<typeof schema>;

export default function UploadMediaForm({ subAccountId }: { subAccountId: string }) {
  const router = useRouter();
  const [fileUrl, setFileUrl] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { link: "", name: "" },
  });

  const handleFileChange = (url?: string) => {
    const val = url ?? "";
    setFileUrl(val);
    setValue("link", val, { shouldValidate: true });
  };

  const onSubmit = async (v: FormValues) => {
    try {
      await createMedia(subAccountId, v);
      await saveActivityLogsNotification({
        description: `Uploaded media file | ${v.name}`,
        subAccountId,
      });
      toast.success("Media uploaded");
      router.refresh();
    } catch {
      toast.error("Failed to upload media");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("link")} />
      <div className="rounded-lg border border-dashed p-5">
        <FileUpload onChange={handleFileChange} value={fileUrl} />
        {errors.link && <p className="mt-2 text-center text-[12px] text-destructive">{errors.link.message}</p>}
      </div>
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium">File name</label>
        <Input placeholder="My image" {...register("name")} disabled={isSubmitting} />
        {errors.name && <p className="text-[12px] text-destructive">{errors.name.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? <><Spinner /> Uploading...</> : "Upload media"}
      </Button>
    </form>
  );
}
