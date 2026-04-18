"use client";

import { useEffect, useState } from "react";
import { Check, Crown, Loader2, Sparkles, Zap } from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
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
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setShowPayment(true);
      } else {
        const checkout = await fetch("/api/stripe/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priceId, agencyId }),
        });
        const d = await checkout.json();
        if (d.url) window.location.href = d.url;
      }
    } catch {
      toast.error("Something went wrong");
    }
    setLoading(null);
  };

  const currentPlan = pricingCards.find((c) => c.priceId === subscription?.priceId);
  const daysLeft = subscription?.currentPeriodEndDate
    ? Math.max(0, Math.ceil((new Date(subscription.currentPeriodEndDate).getTime() - Date.now()) / 86400000))
    : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Billing</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">Manage your plan and payment history.</p>
      </div>

      {/* Current plan banner */}
      <Card className={clsx("overflow-hidden", subscription?.active ? "border-primary/30 bg-primary/5" : "border-dashed")}>
        <CardContent className="flex items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-4">
            <div className={clsx("flex h-10 w-10 items-center justify-center rounded-lg", subscription?.active ? "bg-primary text-primary-foreground" : "bg-muted")}>
              {subscription?.active ? <Crown className="h-5 w-5" /> : <Zap className="h-5 w-5 text-muted-foreground" />}
            </div>
            <div>
              <p className="text-[15px] font-semibold">
                {subscription?.active ? currentPlan?.title || "Pro Plan" : "Free Plan"}
              </p>
              {subscription?.active ? (
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-[12px] text-muted-foreground">{daysLeft} days until renewal</p>
                  <Progress value={Math.max(5, ((30 - daysLeft) / 30) * 100)} className="h-1.5 w-24" />
                </div>
              ) : (
                <p className="text-[12px] text-muted-foreground">Upgrade to unlock premium features</p>
              )}
            </div>
          </div>
          {subscription?.active && <Badge>Active</Badge>}
        </CardContent>
      </Card>

      {/* Plans */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-[15px] font-semibold">Plans</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {pricingCards.map((card) => {
            const isCurrent = card.priceId === subscription?.priceId;
            const isPro = card.title === "Unlimited Saas";
            return (
              <Card
                key={card.title}
                className={clsx(
                  "relative flex flex-col transition-all",
                  isPro && "border-primary shadow-md shadow-primary/5 scale-[1.02]",
                  isCurrent && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                )}
              >
                {isPro && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="shadow-sm">Recommended</Badge>
                  </div>
                )}
                <CardHeader className="pb-2 pt-6">
                  <p className={clsx("text-[13px] font-medium", isPro ? "text-primary" : "text-muted-foreground")}>{card.title}</p>
                  <div className="flex items-baseline gap-1 pt-2">
                    <span className="text-3xl font-bold tracking-tight">{card.price}</span>
                    {card.duration && <span className="text-[13px] text-muted-foreground">/{card.duration}</span>}
                  </div>
                  <p className="text-[12px] text-muted-foreground pt-1">{card.description}</p>
                </CardHeader>
                <CardContent className="flex-1 pb-2">
                  <Separator className="mb-4" />
                  <ul className="space-y-2.5">
                    {card.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="text-[12px] leading-snug text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button
                    className="w-full"
                    variant={isPro ? "default" : "outline"}
                    size="lg"
                    disabled={isCurrent || !!loading || !card.priceId}
                    onClick={() => handleSubscribe(card.priceId)}
                  >
                    {loading === card.priceId ? (
                      <Loader2 className="animate-spin" />
                    ) : isCurrent ? (
                      "Current plan"
                    ) : !card.priceId ? (
                      "Free forever"
                    ) : subscription?.active ? (
                      "Switch plan"
                    ) : (
                      "Get started"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Add-ons */}
      {addOns.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-[15px] font-semibold">Add-ons</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {addOns.map((addon) => (
              <div key={addon.id} className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/30">
                <div className="space-y-0.5">
                  <p className="text-[13px] font-medium">{addon.name}</p>
                  <p className="text-[12px] text-muted-foreground">${addon.price}/mo</p>
                </div>
                <Switch checked={addon.active} disabled />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transactions */}
      <div className="space-y-4">
        <h2 className="text-[15px] font-semibold">Payment History</h2>
        {charges.length > 0 ? (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[12px]">Email</TableHead>
                  <TableHead className="text-[12px]">Status</TableHead>
                  <TableHead className="text-[12px]">Date</TableHead>
                  <TableHead className="text-right text-[12px]">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {charges.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="text-[13px]">{c.email || "—"}</TableCell>
                    <TableCell>
                      <div className={clsx("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                        c.status === "succeeded" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                      )}>
                        <div className={clsx("h-1.5 w-1.5 rounded-full", c.status === "succeeded" ? "bg-emerald-500" : "bg-muted-foreground")} />
                        {c.status}
                      </div>
                    </TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">{new Date(c.created * 1000).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right text-[13px] tabular-nums font-medium">${(c.amount / 100).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed py-12 text-center">
            <p className="text-[13px] text-muted-foreground">No transactions yet</p>
          </div>
        )}
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Complete your subscription</DialogTitle>
            <DialogDescription>Enter your payment details below.</DialogDescription>
          </DialogHeader>
          {clientSecret && <SubscriptionForm clientSecret={clientSecret} agencyId={agencyId} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
