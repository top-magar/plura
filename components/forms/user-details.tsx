"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { FileUpload } from "@/components/global/file-upload";
import { updateUser } from "@/lib/queries";
import type { User } from "@/lib/generated/prisma/client";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  avatarUrl: z.string().min(1, "Upload an avatar"),
});

type FormValues = z.infer<typeof schema>;

function F({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[13px] font-medium leading-none">{label}</label>
      {children}
      {error && <p className="text-[12px] text-destructive">{error}</p>}
    </div>
  );
}

export default function UserDetails({ data }: { data: User }) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState(data.avatarUrl);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      name: data.name,
      email: data.email,
      avatarUrl: data.avatarUrl,
    },
  });

  const handleAvatarChange = (url?: string) => {
    const val = url ?? "";
    setAvatarUrl(val);
    setValue("avatarUrl", val, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = async (v: FormValues) => {
    try {
      await updateUser(data.id, {
        name: v.name,
        avatarUrl: v.avatarUrl,
      });
      toast.success("Profile updated");
      router.refresh();
    } catch {
      toast.error("Could not update profile");
    }
  };

  const roleLabel = data.role.replace(/_/g, " ").toLowerCase();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <input type="hidden" {...register("avatarUrl")} />

      {/* Avatar */}
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-5">
        <FileUpload onChange={handleAvatarChange} value={avatarUrl} />
        {!avatarUrl && <p className="text-[13px] text-muted-foreground">Upload your avatar</p>}
        {errors.avatarUrl && <p className="text-[12px] text-destructive">{errors.avatarUrl.message}</p>}
      </div>

      <F label="Full name" error={errors.name?.message}>
        <Input {...register("name")} disabled={isSubmitting} />
      </F>

      <F label="Email">
        <Input value={data.email} disabled className="bg-muted/50" />
        <p className="text-[11px] text-muted-foreground">Email cannot be changed. Contact support if needed.</p>
      </F>

      <div className="space-y-1.5">
        <label className="text-[13px] font-medium leading-none">Role</label>
        <div>
          <Badge variant="secondary" className="capitalize">{roleLabel}</Badge>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {data.role === "AGENCY_OWNER"
            ? "As the agency owner, your role cannot be changed."
            : "Your role is managed by the agency owner."}
        </p>
      </div>

      <Separator />

      <Button type="submit" disabled={isSubmitting || !isValid} size="lg">
        {isSubmitting ? <><Spinner /> Saving...</> : "Save profile"}
      </Button>
    </form>
  );
}
