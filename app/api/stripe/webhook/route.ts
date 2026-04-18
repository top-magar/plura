import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as unknown as Record<string, unknown>;
        if (sub.status !== "active") break;

        const items = sub.items as { data: { price: { id: string } }[] };
        const periodEnd = sub.current_period_end as number;

        await db.subscription.upsert({
          where: { subscriptionId: sub.id as string },
          update: {
            active: true,
            currentPeriodEndDate: new Date(periodEnd * 1000),
            priceId: items.data[0].price.id,
          },
          create: {
            subscriptionId: sub.id as string,
            customerId: sub.customer as string,
            currentPeriodEndDate: new Date(periodEnd * 1000),
            priceId: items.data[0].price.id,
            active: true,
            agencyId: (sub.metadata as Record<string, string>)?.agencyId,
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as unknown as Record<string, unknown>;
        await db.subscription.update({
          where: { subscriptionId: sub.id as string },
          data: { active: false },
        });
        break;
      }
    }
  } catch (e) {
    console.log("[ERROR] Webhook handler:", e);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
