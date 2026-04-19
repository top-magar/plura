"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import { v4 } from "uuid";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { FileUpload } from "@/components/global/file-upload";
import {
  initUser,
  upsertAgency,
  deleteAgency,
  saveActivityLogsNotification,
  updateAgencyDetails,
} from "@/lib/queries";
import type { Agency } from "@/lib/generated/prisma/client";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  companyEmail: z.string().email("Invalid email"),
  agencyLogo: z.string().min(1, "Upload a logo"),
  companyPhone: z.string().optional().default(""),
  whiteLabel: z.boolean().optional().default(true),
  address: z.string().optional().default(""),
  city: z.string().optional().default(""),
  zipCode: z.string().optional().default(""),
  state: z.string().optional().default(""),
  country: z.string().optional().default(""),
});

type FormValues = z.infer<typeof formSchema>;

function F({ label, error, hint, children }: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[13px] font-medium leading-none">{label}</label>
      {hint && <p className="text-[12px] text-muted-foreground">{hint}</p>}
      {children}
      {error && <p className="text-[12px] text-destructive">{error}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}

export default function AgencyDetails({ data }: { data?: Partial<Agency> }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [logoUrl, setLogoUrl] = useState(data?.agencyLogo ?? "");
  const isEdit = !!data?.id;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormValues>({
    // @ts-expect-error zod v3/v4 compat
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      name: data?.name ?? "",
      companyEmail: data?.companyEmail ?? "",
      agencyLogo: data?.agencyLogo ?? "",
      companyPhone: data?.companyPhone ?? "",
      whiteLabel: data?.whiteLabel ?? true,
      address: data?.address ?? "",
      city: data?.city ?? "",
      zipCode: data?.zipCode ?? "",
      state: data?.state ?? "",
      country: data?.country ?? "",
    },
  });

  const whiteLabel = watch("whiteLabel");

  useEffect(() => {
    if (data) reset(data as FormValues);
  }, [data, reset]);

  const handleLogoChange = (url?: string) => {
    const val = url ?? "";
    setLogoUrl(val);
    setValue("agencyLogo", val, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = async (v: FormValues) => {
    try {
      if (!isEdit) await initUser({ role: "AGENCY_OWNER" });

      const res = await upsertAgency({
        id: data?.id || v4(),
        customerId: data?.customerId || "",
        connectAccountId: "",
        goal: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: v.name,
        companyEmail: v.companyEmail,
        agencyLogo: v.agencyLogo,
        companyPhone: v.companyPhone ?? "",
        whiteLabel: v.whiteLabel ?? true,
        address: v.address ?? "",
        city: v.city ?? "",
        zipCode: v.zipCode ?? "",
        state: v.state ?? "",
        country: v.country ?? "",
      });

      toast.success(isEdit ? "Agency updated" : "Agency created");
      isEdit ? router.refresh() : res && router.push(`/agency/${res.id}`);
    } catch {
      toast.error("Something went wrong");
    }
  };

  const onDelete = async () => {
    if (!data?.id) return;
    setDeleting(true);
    try {
      await deleteAgency(data.id);
      toast.success("Agency deleted");
      router.refresh();
    } catch {
      toast.error("Could not delete agency");
    }
    setDeleting(false);
  };

  const disabled = isSubmitting;

  return (
    <AlertDialog>
      <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-6">
        {/* Hidden input to hold logo value for form */}
        <input type="hidden" {...register("agencyLogo")} />

        {/* Logo */}
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-6">
          <FileUpload
            apiEndpoint="agencyLogo"
            onChange={handleLogoChange}
            value={logoUrl}
          />
          {!logoUrl && (
            <p className="text-[13px] text-muted-foreground">Upload your agency logo</p>
          )}
          {errors.agencyLogo && (
            <p className="text-[12px] text-destructive">{errors.agencyLogo.message}</p>
          )}
        </div>

        {/* Essential fields */}
        <F label="Agency name" error={errors.name?.message}>
          <Input placeholder="Acme Agency" {...register("name")} disabled={disabled} autoFocus={!isEdit} />
        </F>

        <F label="Email" error={errors.companyEmail?.message}>
          <Input placeholder="hello@acme.com" type="email" {...register("companyEmail")} disabled={disabled} />
        </F>

        {/* Extended fields — edit mode only */}
        {isEdit && (
          <>
            <Separator />

            <Section title="Contact">
              <F label="Phone" error={errors.companyPhone?.message}>
                <Input placeholder="+1 (555) 000-0000" {...register("companyPhone")} disabled={disabled} />
              </F>
            </Section>

            <Section title="Address">
              <F label="Street" error={errors.address?.message}>
                <Input placeholder="123 Main St" {...register("address")} disabled={disabled} />
              </F>
              <div className="grid gap-4 sm:grid-cols-2">
                <F label="City" error={errors.city?.message}>
                  <Input placeholder="New York" {...register("city")} disabled={disabled} />
                </F>
                <F label="State" error={errors.state?.message}>
                  <Input placeholder="NY" {...register("state")} disabled={disabled} />
                </F>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <F label="Zip" error={errors.zipCode?.message}>
                  <Input placeholder="10001" {...register("zipCode")} disabled={disabled} />
                </F>
                <F label="Country" error={errors.country?.message}>
                  <Input placeholder="United States" {...register("country")} disabled={disabled} />
                </F>
              </div>
            </Section>

            <Section title="Preferences">
              <div className="flex items-start justify-between gap-6 rounded-lg border p-4">
                <div className="space-y-0.5">
                  <p className="text-[13px] font-medium">White label</p>
                  <p className="text-[12px] text-muted-foreground">
                    Show your logo instead of Plura&apos;s for sub account users.
                  </p>
                </div>
                <Switch
                  checked={whiteLabel}
                  onCheckedChange={(v) => setValue("whiteLabel", v)}
                  disabled={disabled}
                />
              </div>

              <F label="Sub account goal" hint="Track how many sub accounts you want to reach.">
                <Input
                  type="number"
                  min={1}
                  className="w-24 tabular-nums"
                  defaultValue={data?.goal ?? 5}
                  onBlur={async (e) => {
                    if (!data?.id) return;
                    const goal = Number(e.target.value);
                    if (goal < 1) return;
                    await updateAgencyDetails(data.id, { goal });
                    await saveActivityLogsNotification({
                      agencyId: data.id,
                      description: `Updated goal to ${goal} sub accounts`,
                      subAccountId: undefined,
                    });
                    router.refresh();
                  }}
                />
              </F>
            </Section>
          </>
        )}

        {/* Actions */}
        <Button type="submit" disabled={disabled || !isValid} className="w-full" size="lg">
          {isSubmitting ? (
            <><Spinner /> {isEdit ? "Saving…" : "Creating…"}</>
          ) : isEdit ? (
            "Save changes"
          ) : (
            "Create agency →"
          )}
        </Button>

        {isEdit && (
          <>
            <Separator />
            <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <div>
                <p className="text-[13px] font-medium text-destructive">Delete agency</p>
                <p className="text-[12px] text-muted-foreground">This cannot be undone.</p>
              </div>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" disabled={disabled || deleting}>
                  <Trash2 /> Delete
                </Button>
              </AlertDialogTrigger>
            </div>
          </>
        )}
      </form>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete agency?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes your agency, all sub accounts, and all related data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={onDelete}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
