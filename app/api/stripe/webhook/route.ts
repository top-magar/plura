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
        const subscription = event.data.object as Stripe.Subscription;
        if (subscription.status !== "active") break;

        await db.subscription.upsert({
          where: { subscriptionId: subscription.id },
          update: {
            active: true,
            currentPeriodEndDate: new Date(subscription.current_period_end * 1000),
            priceId: subscription.items.data[0].price.id,
            plan: subscription.items.data[0].price.id as never,
          },
          create: {
            subscriptionId: subscription.id,
            customerId: subscription.customer as string,
            currentPeriodEndDate: new Date(subscription.current_period_end * 1000),
            priceId: subscription.items.data[0].price.id,
            plan: subscription.items.data[0].price.id as never,
            active: true,
            agencyId: subscription.metadata.agencyId,
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await db.subscription.update({
          where: { subscriptionId: subscription.id },
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
