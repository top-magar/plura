import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { priceId, agencyId } = await req.json();

  const agency = await db.agency.findUnique({ where: { id: agencyId } });
  if (!agency?.customerId) {
    return NextResponse.json({ error: "No customer" }, { status: 400 });
  }

  const subscription = await stripe.subscriptions.create({
    customer: agency.customerId,
    items: [{ price: priceId }],
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    expand: ["latest_invoice.payment_intent"],
    metadata: { agencyId },
  });

  const invoice = subscription.latest_invoice as unknown as {
    payment_intent: { client_secret: string };
  } | null;

  if (!invoice?.payment_intent?.client_secret) {
    return NextResponse.json({ error: "Could not create payment intent" }, { status: 500 });
  }

  return NextResponse.json({
    subscriptionId: subscription.id,
    clientSecret: invoice.payment_intent.client_secret,
  });
}
