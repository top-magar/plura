"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { upsertContact, saveActivityLogsNotification } from "@/lib/queries";
import { useModal } from "@/providers/modal-provider";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

export default function ContactForm({ subAccountId }: { subAccountId: string }) {
  const router = useRouter();
  const { setClose } = useModal();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "" },
  });

  const onSubmit = async (v: { name: string; email: string }) => {
    try {
      await upsertContact({ ...v, subAccountId });
      await saveActivityLogsNotification({ description: `Created contact | ${v.name}`, subAccountId });
      toast.success("Contact added");
      setClose();
      router.refresh();
    } catch {
      toast.error("Could not add contact");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium">Name</label>
        <Input placeholder="John Doe" {...register("name")} disabled={isSubmitting} autoFocus />
        {errors.name && <p className="text-[12px] text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium">Email</label>
        <Input placeholder="john@example.com" type="email" {...register("email")} disabled={isSubmitting} />
        {errors.email && <p className="text-[12px] text-destructive">{errors.email.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? <><Spinner /> Adding...</> : "Add contact"}
      </Button>
    </form>
  );
}
