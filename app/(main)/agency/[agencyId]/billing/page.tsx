import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { pricingCards } from "@/lib/constants";
import BillingClient from "./client";

export default async function BillingPage({
  params,
  searchParams,
}: {
  params: Promise<{ agencyId: string }>;
  searchParams: Promise<{ plan?: string; success?: string; cancelled?: string }>;
}) {
  const { agencyId } = await params;
  const search = await searchParams;

  const agency = await db.agency.findUnique({
    where: { id: agencyId },
    include: { Subscription: true, AddOns: true },
  });
  if (!agency) return null;

  // Sync subscription from Stripe on every page load
  if (agency.customerId) {
    try {
      const subs = await stripe.subscriptions.list({
        customer: agency.customerId,
        status: "active",
        limit: 1,
      });
      const activeSub = subs.data[0];
      if (activeSub) {
        await db.subscription.upsert({
          where: { subscriptionId: activeSub.id },
          update: {
            active: true,
            priceId: activeSub.items.data[0].price.id,
            currentPeriodEndDate: new Date(activeSub.current_period_end * 1000),
          },
          create: {
            subscriptionId: activeSub.id,
            customerId: agency.customerId,
            priceId: activeSub.items.data[0].price.id,
            currentPeriodEndDate: new Date(activeSub.current_period_end * 1000),
            active: true,
            agencyId,
          },
        });
      } else if (agency.Subscription?.active) {
        // No active sub in Stripe but DB says active — mark inactive
        await db.subscription.update({
          where: { id: agency.Subscription.id },
          data: { active: false },
        });
      }
    } catch { /* Stripe API error — use cached data */ }
  }

  // Re-fetch with synced subscription
  const freshAgency = await db.agency.findUnique({
    where: { id: agencyId },
    include: { Subscription: true, AddOns: true },
  });

  // Fetch charges
  let charges: { id: string; amount: number; status: string; created: number; description: string | null; email: string }[] = [];
  if (agency.customerId) {
    try {
      const raw = await stripe.charges.list({ customer: agency.customerId, limit: 20 });
      charges = raw.data.map((c) => ({
        id: c.id,
        amount: c.amount,
        status: c.status,
        created: c.created,
        description: c.description,
        email: c.billing_details?.email || "",
      }));
    } catch { /* no charges */ }
  }

  // Fetch add-on products
  let addOns: { id: string; name: string; priceId: string; price: number; active: boolean }[] = [];
  try {
    const products = await stripe.products.list({ active: true, limit: 10 });
    for (const product of products.data) {
      if (product.name.startsWith("Plura")) continue;
      const prices = await stripe.prices.list({ product: product.id, active: true, limit: 1 });
      if (prices.data[0]) {
        const isActive = (freshAgency?.AddOns || []).some((a) => a.priceId === prices.data[0].id && a.active);
        addOns.push({
          id: product.id,
          name: product.name,
          priceId: prices.data[0].id,
          price: (prices.data[0].unit_amount || 0) / 100,
          active: isActive,
        });
      }
    }
  } catch { /* no add-ons */ }

  return (
    <BillingClient
      agencyId={agencyId}
      subscription={freshAgency?.Subscription || null}
      charges={charges}
      pricingCards={pricingCards}
      addOns={addOns}
      initialPlan={search.plan}
      success={search.success === "true"}
      cancelled={search.cancelled === "true"}
    />
  );
}
