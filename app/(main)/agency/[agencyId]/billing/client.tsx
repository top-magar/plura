"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Plus, Zap } from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
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
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Show toast on success/cancel redirect
  useEffect(() => {
    if (success) toast.success("Subscription activated!");
    if (cancelled) toast.error("Payment cancelled");
  }, [success, cancelled]);

  // Auto-open payment form if ?plan= is in URL
  useEffect(() => {
    if (initialPlan && !subscription?.active) {
      handleSubscribe(initialPlan);
    }
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
      } else {
        // Fallback to checkout
        const checkout = await fetch("/api/stripe/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priceId, agencyId }),
        });
        const checkoutData = await checkout.json();
        if (checkoutData.url) window.location.href = checkoutData.url;
      }
    } catch {
      toast.error("Something went wrong");
    }
    setLoading(null);
  };

  const currentPriceId = subscription?.priceId;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Billing</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">Manage your subscription and view transaction history.</p>
      </div>

      {/* Custom Stripe Form */}
      {clientSecret && (
        <SubscriptionForm clientSecret={clientSecret} agencyId={agencyId} />
      )}

      {/* Current plan */}
      {subscription?.active && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Active Subscription</CardTitle>
              <Badge>Active</Badge>
            </div>
            <CardDescription>
              Renews on {new Date(subscription.currentPeriodEndDate).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Plans */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Plans</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pricingCards.map((card) => {
            const isCurrent = card.priceId === currentPriceId;
            const isPro = card.title === "Unlimited Saas";
            return (
              <Card key={card.title} className={clsx("flex flex-col justify-between", isPro && "border-2 border-primary", isCurrent && "ring-2 ring-primary")}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle className={clsx("text-lg", !isPro && "text-muted-foreground")}>{card.title}</CardTitle>
                    {isCurrent && <Badge variant="secondary">Current</Badge>}
                    {isPro && !isCurrent && <Badge>Popular</Badge>}
                  </div>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-3xl font-bold">{card.price}</span>
                  {card.duration && <span className="text-muted-foreground">/{card.duration}</span>}
                </CardContent>
                <CardFooter className="flex flex-col items-start gap-4">
                  <Separator />
                  <div className="space-y-2">
                    {card.features.map((f) => (
                      <div key={f} className="flex items-center gap-2">
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                        <span className="text-[13px] text-muted-foreground">{f}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full"
                    variant={isPro ? "default" : "secondary"}
                    disabled={isCurrent || !!loading || !card.priceId}
                    onClick={() => handleSubscribe(card.priceId)}
                  >
                    {loading === card.priceId ? <><Loader2 className="animate-spin" /> Processing...</> : isCurrent ? "Current plan" : !card.priceId ? "Free" : "Subscribe"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Add-ons */}
      {addOns.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">Add-ons</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {addOns.map((addon) => (
              <Card key={addon.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-[13px] font-medium">{addon.name}</p>
                  <p className="text-[12px] text-muted-foreground">${addon.price}/month</p>
                </div>
                <Switch checked={addon.active} disabled />
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Transactions */}
      {charges.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">Transaction History</h2>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {charges.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="text-[13px]">{c.email || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={c.status === "succeeded" ? "default" : "secondary"} className="text-[11px] capitalize">{c.status}</Badge>
                    </TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">{new Date(c.created * 1000).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right text-[13px] tabular-nums font-medium">${(c.amount / 100).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
