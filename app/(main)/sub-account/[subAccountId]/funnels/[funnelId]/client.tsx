"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Globe, Settings, FileText } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { FileUpload } from "@/components/global/file-upload";
import { deleteFunnel, upsertFunnel, saveActivityLogsNotification } from "@/lib/queries";
import FunnelSteps from "./funnel-steps";

type FunnelPage = { id: string; name: string; pathName: string; order: number; visits: number; content: string | null };
type Funnel = { id: string; name: string; description: string | null; subDomainName: string | null; published: boolean; favicon: string | null; liveProducts: string | null; subAccountId: string; FunnelPages: FunnelPage[] };
type Props = { funnel: Funnel; subAccountId: string };

export default function FunnelDetailClient({ funnel, subAccountId }: Props) {
  const router = useRouter();
  const [subdomain, setSubdomain] = useState(funnel.subDomainName ?? "");
  const [description, setDescription] = useState(funnel.description ?? "");
  const [favicon, setFavicon] = useState(funnel.favicon ?? "");
  const [funnelName, setFunnelName] = useState(funnel.name);
  const [deleteFunnelOpen, setDeleteFunnelOpen] = useState(false);
  const [products, setProducts] = useState<{ id: string; name: string; description: string | null; amount: number; currency: string; recurring: string | null }[]>([]);
  const [liveProducts, setLiveProducts] = useState<string[]>(() => { try { return JSON.parse(funnel.liveProducts || "[]"); } catch { return []; } });
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (productsLoaded) return;
    fetch(`/api/stripe/products?subAccountId=${subAccountId}`)
      .then((r) => r.json())
      .then((d) => { setProducts(d.products || []); setProductsLoaded(true); })
      .catch(() => setProductsLoaded(true));
  }, [productsLoaded, subAccountId]);

  const totalVisits = funnel.FunnelPages.reduce((s, p) => s + p.visits, 0);

  const handlePublishToggle = async (published: boolean) => {
    try {
      await upsertFunnel({ id: funnel.id, name: funnel.name, subAccountId, subDomainName: subdomain || undefined });
      toast.success(published ? "Published" : "Unpublished");
      router.refresh();
    } catch { toast.error("Could not update"); }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await upsertFunnel({ id: funnel.id, name: funnelName, description, subDomainName: subdomain || undefined, subAccountId, liveProducts: JSON.stringify(liveProducts) });
      toast.success("Settings saved");
      router.refresh();
    } catch { toast.error("Could not save"); }
    setSaving(false);
  };

  const handleDeleteFunnel = async () => {
    try {
      await deleteFunnel(funnel.id);
      await saveActivityLogsNotification({ description: `Deleted funnel | ${funnel.name}`, subAccountId });
      toast.success("Funnel deleted");
      router.push(`/sub-account/${subAccountId}/funnels`);
    } catch { toast.error("Could not delete"); }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon-sm"><Link href={`/sub-account/${subAccountId}/funnels`}><ArrowLeft /></Link></Button>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{funnel.name}</h1>
              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>{funnel.FunnelPages.length} pages</span><span>·</span><span>{totalVisits} visits</span>
                {funnel.subDomainName && <><span>·</span><span className="flex items-center gap-1"><Globe className="h-3 w-3" />{funnel.subDomainName}</span></>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5">
              <span className="text-[12px] text-muted-foreground">{funnel.published ? "Live" : "Draft"}</span>
              <Switch checked={funnel.published} onCheckedChange={handlePublishToggle} />
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <Tabs defaultValue="steps">
          <TabsList>
            <TabsTrigger value="steps" className="text-[12px] gap-1"><FileText size={12} /> Steps</TabsTrigger>
            <TabsTrigger value="settings" className="text-[12px] gap-1"><Settings size={12} /> Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="steps" className="mt-4">
            <FunnelSteps pages={funnel.FunnelPages} funnelId={funnel.id} subAccountId={subAccountId} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-4">
            <div className="mx-auto max-w-2xl space-y-6">

              {/* Live Products */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-[15px]">Live Products</CardTitle>
                      <CardDescription>Products available for checkout in this funnel</CardDescription>
                    </div>
                    {liveProducts.length > 0 && (
                      <Badge variant="secondary" className="text-[10px]">{liveProducts.length} of {products.length} selected</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {!productsLoaded ? (
                    <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Loading products...
                    </div>
                  ) : products.length === 0 ? (
                    <div className="rounded-lg border border-dashed py-8 text-center">
                      <p className="text-[13px] text-muted-foreground">No products found</p>
                      <p className="text-[11px] text-muted-foreground mt-1">Connect Stripe and create products in your Stripe dashboard</p>
                    </div>
                  ) : (
                    <div className="rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-10">
                              <Checkbox
                                checked={liveProducts.length === products.length}
                                onCheckedChange={(checked) => setLiveProducts(checked ? products.map((p) => p.id) : [])}
                              />
                            </TableHead>
                            <TableHead className="text-[12px]">Product</TableHead>
                            <TableHead className="text-[12px]">Price</TableHead>
                            <TableHead className="text-[12px]">Type</TableHead>
                            <TableHead className="text-[12px] w-20">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {products.map((p) => {
                            const isSelected = liveProducts.includes(p.id);
                            return (
                              <TableRow key={p.id} className={`cursor-pointer ${isSelected ? "bg-primary/[0.03]" : ""}`} onClick={() => setLiveProducts((prev) => prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id])}>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                  <Checkbox checked={isSelected} onCheckedChange={(checked) => setLiveProducts((prev) => checked ? [...prev, p.id] : prev.filter((id) => id !== p.id))} />
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="text-[13px] font-medium">{p.name}</p>
                                    {p.description && <p className="text-[11px] text-muted-foreground line-clamp-1 max-w-[200px]">{p.description}</p>}
                                  </div>
                                </TableCell>
                                <TableCell className="text-[13px] font-semibold">${(p.amount / 100).toFixed(2)}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-[10px]">{p.recurring ? `${p.recurring}ly` : "One-time"}</Badge>
                                </TableCell>
                                <TableCell>
                                  {isSelected ? (
                                    <Badge className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20" variant="outline">Active</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-[10px] text-muted-foreground">Inactive</Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* General */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[15px]">General</CardTitle>
                  <CardDescription>Basic funnel information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-medium">Funnel name</label>
                      <Input value={funnelName} onChange={(e) => setFunnelName(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-medium">Subdomain</label>
                      <div className="flex">
                        <Input value={subdomain} onChange={(e) => setSubdomain(e.target.value)} placeholder="my-site" className="rounded-r-none" />
                        <div className="flex items-center rounded-r-md border border-l-0 bg-muted px-3 text-[12px] text-muted-foreground">.{process.env.NEXT_PUBLIC_DOMAIN}</div>
                      </div>
                      {subdomain && (
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Globe size={10} /> {subdomain}.{process.env.NEXT_PUBLIC_DOMAIN}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium">Description</label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this funnel for?" rows={3} className="resize-none text-[13px]" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium">Favicon</label>
                    <div className="flex items-start gap-4">
                      {favicon && (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={favicon} alt="Favicon" className="h-8 w-8 object-contain" />
                        </div>
                      )}
                      <div className="flex-1">
                        <FileUpload value={favicon} onChange={(url: string | undefined) => setFavicon(url || "")} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save */}
              <div className="flex justify-end">
                <Button onClick={handleSaveSettings} disabled={saving} className="gap-1.5 min-w-[120px]">
                  {saving ? <><div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> Saving...</> : "Save settings"}
                </Button>
              </div>

              {/* Danger Zone */}
              <Card className="border-destructive/20">
                <CardHeader>
                  <CardTitle className="text-[15px] text-destructive">Danger Zone</CardTitle>
                  <CardDescription>These actions are irreversible</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-medium">Delete this funnel</p>
                      <p className="text-[11px] text-muted-foreground">Permanently remove &quot;{funnel.name}&quot; and all its pages</p>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => setDeleteFunnelOpen(true)}>Delete</Button>
                  </div>
                </CardContent>
              </Card>

            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={deleteFunnelOpen} onOpenChange={setDeleteFunnelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete entire funnel?</AlertDialogTitle>
            <AlertDialogDescription>This permanently deletes &quot;{funnel.name}&quot; and all its pages. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive" onClick={handleDeleteFunnel}>Delete funnel</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
