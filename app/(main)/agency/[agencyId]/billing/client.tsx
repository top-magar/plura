"use client";

import { useEffect, useState } from "react";
import { Check, ChevronRight, CreditCard, Crown, Download, Loader2, Receipt, Shield, Sparkles, Zap } from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import SubscriptionForm from "@/components/global/subscription-form";

type Subscription = { id: string; active: boolean; priceId: string; currentPeriodEndDate: Date } | null;
type Charge = { id: string; amount: number; status: string; created: number; description: string | null; email: string };
type PricingCard = { title: string; description: string; price: string; duration: string; features: string[]; priceId: string };
type AddOn = { id: string; name: string; priceId: string; price: number; active: boolean };

type Props = {
  agencyId: string;
  subscription: Subscription;
  charges: Charge[];
  pricingCards: PricingCard[];
  addOns: AddOn[];
  initialPlan?: string;
  success?: boolean;
  cancelled?: boolean;
};

export default function BillingClient({ agencyId, subscription, charges, pricingCards, addOns, initialPlan, success, cancelled }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    if (success) toast.success("Subscription activated!");
    if (cancelled) toast.error("Payment cancelled");
  }, [success, cancelled]);

  useEffect(() => {
    if (initialPlan && !subscription?.active) handleSubscribe(initialPlan);
  }, [initialPlan]);

  const handleSubscribe = async (priceId: string) => {
    if (!priceId) return;
    setLoading(priceId);
    try {
      const res = await fetch("/api/stripe/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, agencyId }),
      });
      const data = await res.json();
      if (data.clientSecret) { setClientSecret(data.clientSecret); setShowPayment(true); }
      else {
        const c = await fetch("/api/stripe/create-checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ priceId, agencyId }) });
        const d = await c.json();
        if (d.url) window.location.href = d.url;
      }
    } catch { toast.error("Something went wrong"); }
    setLoading(null);
  };

  const currentPlan = pricingCards.find((c) => c.priceId === subscription?.priceId);
  const daysLeft = subscription?.currentPeriodEndDate
    ? Math.max(0, Math.ceil((new Date(subscription.currentPeriodEndDate).getTime() - Date.now()) / 86400000))
    : 0;
  const totalSpend = charges.reduce((s, c) => s + (c.status === "succeeded" ? c.amount : 0), 0);

  return (
    <TooltipProvider>
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
            <p className="mt-1 text-[13px] text-muted-foreground">Manage your subscription, add-ons, and payment history.</p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-[12px]">
                <CreditCard className="h-3.5 w-3.5" /> Manage payment method
              </Button>
            </TooltipTrigger>
            <TooltipContent>Opens Stripe Customer Portal</TooltipContent>
          </Tooltip>
        </div>

        {/* Stats row */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-none bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-medium text-muted-foreground">Current Plan</p>
                {subscription?.active ? <Badge variant="outline" className="border-primary/30 text-primary text-[10px]">Active</Badge> : <Badge variant="secondary" className="text-[10px]">Free</Badge>}
              </div>
              <p className="mt-2 text-xl font-bold">{subscription?.active ? currentPlan?.title || "Pro" : "Starter"}</p>
              {subscription?.active && (
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Billing cycle</span>
                    <span>{daysLeft}d remaining</span>
                  </div>
                  <Progress value={Math.max(3, ((30 - daysLeft) / 30) * 100)} className="h-1" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-[12px] font-medium text-muted-foreground">Total Spend</p>
              <p className="mt-2 text-xl font-bold tabular-nums">${(totalSpend / 100).toFixed(2)}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{charges.length} transaction{charges.length !== 1 ? "s" : ""}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-[12px] font-medium text-muted-foreground">Active Add-ons</p>
              <p className="mt-2 text-xl font-bold tabular-nums">{addOns.filter((a) => a.active).length}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">of {addOns.length} available</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="plans" className="space-y-6">
          <TabsList>
            <TabsTrigger value="plans" className="gap-1.5 text-[13px]"><Sparkles className="h-3.5 w-3.5" /> Plans</TabsTrigger>
            <TabsTrigger value="addons" className="gap-1.5 text-[13px]"><Shield className="h-3.5 w-3.5" /> Add-ons</TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5 text-[13px]"><Receipt className="h-3.5 w-3.5" /> History</TabsTrigger>
          </TabsList>

          {/* Plans Tab */}
          <TabsContent value="plans">
            <div className="grid gap-px overflow-hidden rounded-xl border bg-border lg:grid-cols-3">
              {pricingCards.map((card) => {
                const isCurrent = card.priceId === subscription?.priceId;
                const isPro = card.title === "Unlimited Saas";
                return (
                  <div key={card.title} className={clsx("relative flex flex-col bg-card p-6", isPro && "bg-primary/[0.02]")}>
                    {isPro && (
                      <div className="absolute right-4 top-4">
                        <Badge className="gap-1 text-[10px]"><Crown className="h-3 w-3" /> Popular</Badge>
                      </div>
                    )}
                    <div>
                      <p className={clsx("text-[13px] font-medium", isPro ? "text-primary" : "text-muted-foreground")}>{card.title}</p>
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-4xl font-bold tracking-tighter">{card.price}</span>
                        {card.duration && <span className="text-[13px] text-muted-foreground">/{card.duration}</span>}
                      </div>
                      <p className="mt-2 text-[12px] text-muted-foreground">{card.description}</p>
                    </div>

                    <Separator className="my-5" />

                    <ul className="flex-1 space-y-3">
                      {card.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5">
                          <div className={clsx("mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full", isPro ? "bg-primary/10" : "bg-muted")}>
                            <Check className={clsx("h-2.5 w-2.5", isPro ? "text-primary" : "text-muted-foreground")} />
                          </div>
                          <span className="text-[12px] leading-relaxed text-muted-foreground">{f}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="mt-6 w-full"
                      variant={isPro ? "default" : "outline"}
                      disabled={isCurrent || !!loading || !card.priceId}
                      onClick={() => handleSubscribe(card.priceId)}
                    >
                      {loading === card.priceId ? <Loader2 className="animate-spin" /> : isCurrent ? "Current plan" : !card.priceId ? "Free forever" : subscription?.active ? "Switch" : "Get started"}
                      {!isCurrent && card.priceId && !loading && <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Add-ons Tab */}
          <TabsContent value="addons">
            {addOns.length > 0 ? (
              <div className="space-y-2">
                {addOns.map((addon) => (
                  <div key={addon.id} className="flex items-center justify-between rounded-lg border px-5 py-4 transition-colors hover:bg-muted/20">
                    <div className="flex items-center gap-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                        <Zap className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium">{addon.name}</p>
                        <p className="text-[12px] text-muted-foreground">${addon.price}/month</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {addon.active && <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600">Active</Badge>}
                      <Switch checked={addon.active} disabled />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed py-16 text-center">
                <Zap className="mx-auto h-8 w-8 text-muted-foreground/30" />
                <p className="mt-3 text-[13px] text-muted-foreground">No add-ons available yet</p>
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            {charges.length > 0 ? (
              <div className="rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Email</TableHead>
                      <TableHead className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Status</TableHead>
                      <TableHead className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Date</TableHead>
                      <TableHead className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Amount</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {charges.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="text-[13px] font-medium">{c.email || "—"}</TableCell>
                        <TableCell>
                          <div className={clsx("inline-flex items-center gap-1.5 text-[11px] font-medium",
                            c.status === "succeeded" ? "text-emerald-600" : "text-muted-foreground"
                          )}>
                            <div className={clsx("h-1.5 w-1.5 rounded-full", c.status === "succeeded" ? "bg-emerald-500" : "bg-muted-foreground/50")} />
                            {c.status === "succeeded" ? "Paid" : c.status}
                          </div>
                        </TableCell>
                        <TableCell className="text-[13px] text-muted-foreground">{new Date(c.created * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</TableCell>
                        <TableCell className="text-right text-[13px] tabular-nums font-semibold">${(c.amount / 100).toFixed(2)}</TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon-xs"><Download className="h-3 w-3 text-muted-foreground" /></Button>
                            </TooltipTrigger>
                            <TooltipContent>Download invoice</TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed py-16 text-center">
                <Receipt className="mx-auto h-8 w-8 text-muted-foreground/30" />
                <p className="mt-3 text-[13px] text-muted-foreground">No transactions yet</p>
                <p className="mt-1 text-[11px] text-muted-foreground">Transactions will appear here after your first payment</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Payment Dialog */}
        <Dialog open={showPayment} onOpenChange={setShowPayment}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Complete subscription</DialogTitle>
              <DialogDescription>Your card will be charged monthly. Cancel anytime.</DialogDescription>
            </DialogHeader>
            {clientSecret && <SubscriptionForm clientSecret={clientSecret} agencyId={agencyId} />}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
