import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { agencyId } = await req.json();

  const agency = await db.agency.findUnique({ where: { id: agencyId } });
  if (!agency?.customerId) {
    return NextResponse.json({ error: "No customer" }, { status: 400 });
  }

  // Fetch active subscriptions from Stripe
  const subscriptions = await stripe.subscriptions.list({
    customer: agency.customerId,
    status: "active",
    limit: 1,
  });

  const sub = subscriptions.data[0];
  if (!sub) {
    return NextResponse.json({ active: false });
  }

  // Upsert into our database
  await db.subscription.upsert({
    where: { subscriptionId: sub.id },
    update: {
      active: true,
      priceId: sub.items.data[0].price.id,
      currentPeriodEndDate: new Date(sub.current_period_end * 1000),
    },
    create: {
      subscriptionId: sub.id,
      customerId: agency.customerId,
      priceId: sub.items.data[0].price.id,
      currentPeriodEndDate: new Date(sub.current_period_end * 1000),
      active: true,
      agencyId,
    },
  });

  return NextResponse.json({ active: true, priceId: sub.items.data[0].price.id });
}
