import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { pricingCards } from "@/lib/constants";
import BillingClient from "./client";

async function syncSubscription(agencyId: string, customerId: string) {
  const subs = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1 });
  const sub = subs.data[0];
  if (sub) {
    await db.subscription.upsert({
      where: { subscriptionId: sub.id },
      update: { active: true, priceId: sub.items.data[0].price.id, currentPeriodEndDate: new Date(sub.current_period_end * 1000) },
      create: { subscriptionId: sub.id, customerId, priceId: sub.items.data[0].price.id, currentPeriodEndDate: new Date(sub.current_period_end * 1000), active: true, agencyId },
    });
  }
}

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

  // Sync subscription from Stripe
  try {
    let custId = agency.customerId;

    // If no valid customerId, find by email
    if (!custId || !custId.startsWith("cus_")) {
      const customers = await stripe.customers.list({ email: agency.companyEmail, limit: 1 });
      if (customers.data[0]) {
        custId = customers.data[0].id;
        await db.agency.update({ where: { id: agencyId }, data: { customerId: custId } });
      }
    }

    if (custId && custId.startsWith("cus_")) {
      await syncSubscription(agencyId, custId);
    }
  } catch { /* ignore Stripe errors */ }

  // Re-fetch with synced data
  const fresh = await db.agency.findUnique({
    where: { id: agencyId },
    include: { Subscription: true, AddOns: true },
  });

  // Fetch charges
  let charges: { id: string; amount: number; status: string; created: number; description: string | null; email: string }[] = [];
  if (fresh?.customerId?.startsWith("cus_")) {
    try {
      const raw = await stripe.charges.list({ customer: fresh.customerId, limit: 20 });
      charges = raw.data.map((c) => ({
        id: c.id, amount: c.amount, status: c.status, created: c.created,
        description: c.description, email: c.billing_details?.email || "",
      }));
    } catch { /* no charges */ }
  }

  // Fetch add-ons
  let addOns: { id: string; name: string; priceId: string; price: number; active: boolean }[] = [];
  try {
    const products = await stripe.products.list({ active: true, limit: 10 });
    for (const product of products.data) {
      if (product.name.startsWith("Plura")) continue;
      const prices = await stripe.prices.list({ product: product.id, active: true, limit: 1 });
      if (prices.data[0]) {
        addOns.push({
          id: product.id, name: product.name, priceId: prices.data[0].id,
          price: (prices.data[0].unit_amount || 0) / 100,
          active: (fresh?.AddOns || []).some((a) => a.priceId === prices.data[0].id && a.active),
        });
      }
    }
  } catch { /* no add-ons */ }

  return (
    <BillingClient
      agencyId={agencyId}
      subscription={fresh?.Subscription || null}
      charges={charges}
      pricingCards={pricingCards}
      addOns={addOns}
      initialPlan={search.plan}
      success={search.success === "true"}
      cancelled={search.cancelled === "true"}
    />
  );
}
