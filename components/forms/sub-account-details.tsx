"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import { v4 } from "uuid";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { FileUpload } from "@/components/global/file-upload";
import { saveActivityLogsNotification, upsertSubAccount } from "@/lib/queries";
import { useModal } from "@/providers/modal-provider";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  companyEmail: z.string().email("Invalid email"),
  subAccountLogo: z.string().min(1, "Upload a logo"),
  companyPhone: z.string().optional().default(""),
  address: z.string().optional().default(""),
  city: z.string().optional().default(""),
  zipCode: z.string().optional().default(""),
  state: z.string().optional().default(""),
  country: z.string().optional().default(""),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  agencyDetails: Record<string, unknown>;
  userId: string;
  userName: string;
  details?: Partial<FormValues & { id: string; agencyId: string }>;
};

function F({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[13px] font-medium leading-none">{label}</label>
      {children}
      {error && <p className="text-[12px] text-destructive">{error}</p>}
    </div>
  );
}

export default function SubAccountDetails({ agencyDetails, details, userName }: Props) {
  const router = useRouter();
  const { setClose } = useModal();
  const [logoUrl, setLogoUrl] = useState(details?.subAccountLogo ?? "");
  const isEdit = !!details?.id;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      name: details?.name ?? "",
      companyEmail: details?.companyEmail ?? "",
      subAccountLogo: details?.subAccountLogo ?? "",
      companyPhone: details?.companyPhone ?? "",
      address: details?.address ?? "",
      city: details?.city ?? "",
      zipCode: details?.zipCode ?? "",
      state: details?.state ?? "",
      country: details?.country ?? "",
    },
  });

  useEffect(() => {
    if (details) reset(details as FormValues);
  }, [details, reset]);

  const handleLogoChange = (url?: string) => {
    const val = url ?? "";
    setLogoUrl(val);
    setValue("subAccountLogo", val, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = async (v: FormValues) => {
    try {
      const agencyId = (agencyDetails as { Agency?: { id: string } }).Agency?.id
        ?? (agencyDetails as { id?: string }).id;
      if (!agencyId) return;

      const response = await upsertSubAccount({
        id: details?.id || v4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        connectAccountId: "",
        goal: 5,
        agencyId,
        name: v.name,
        companyEmail: v.companyEmail,
        subAccountLogo: v.subAccountLogo,
        companyPhone: v.companyPhone ?? "",
        address: v.address ?? "",
        city: v.city ?? "",
        zipCode: v.zipCode ?? "",
        state: v.state ?? "",
        country: v.country ?? "",
      });

      if (!response) throw new Error("Failed");

      await saveActivityLogsNotification({
        agencyId,
        description: `${userName} | ${isEdit ? "updated" : "created"} sub account | ${response.name}`,
        subAccountId: response.id,
      });

      toast.success(isEdit ? "Sub account updated" : "Sub account created");
      setClose();
      router.refresh();
    } catch {
      toast.error("Could not save sub account");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <input type="hidden" {...register("subAccountLogo")} />

      {/* Logo */}
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-5">
        <FileUpload onChange={handleLogoChange} value={logoUrl} />
        {!logoUrl && <p className="text-[13px] text-muted-foreground">Upload sub account logo</p>}
        {errors.subAccountLogo && <p className="text-[12px] text-destructive">{errors.subAccountLogo.message}</p>}
      </div>

      {/* Essential */}
      <F label="Sub account name" error={errors.name?.message}>
        <Input placeholder="Client name" {...register("name")} disabled={isSubmitting} autoFocus />
      </F>

      <F label="Email" error={errors.companyEmail?.message}>
        <Input placeholder="client@example.com" type="email" {...register("companyEmail")} disabled={isSubmitting} />
      </F>

      {/* Extended - only in edit mode */}
      {isEdit && (
        <>
          <Separator />

          <F label="Phone" error={errors.companyPhone?.message}>
            <Input placeholder="+1 (555) 000-0000" {...register("companyPhone")} disabled={isSubmitting} />
          </F>

          <F label="Address" error={errors.address?.message}>
            <Input placeholder="123 Main St" {...register("address")} disabled={isSubmitting} />
          </F>

          <div className="grid gap-4 sm:grid-cols-2">
            <F label="City" error={errors.city?.message}>
              <Input placeholder="New York" {...register("city")} disabled={isSubmitting} />
            </F>
            <F label="State" error={errors.state?.message}>
              <Input placeholder="NY" {...register("state")} disabled={isSubmitting} />
            </F>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Zip" error={errors.zipCode?.message}>
              <Input placeholder="10001" {...register("zipCode")} disabled={isSubmitting} />
            </F>
            <F label="Country" error={errors.country?.message}>
              <Input placeholder="United States" {...register("country")} disabled={isSubmitting} />
            </F>
          </div>
        </>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
        {isSubmitting ? (
          <><Spinner /> {isEdit ? "Saving..." : "Creating..."}</>
        ) : isEdit ? (
          "Save changes"
        ) : (
          "Create sub account"
        )}
      </Button>
    </form>
  );
}
