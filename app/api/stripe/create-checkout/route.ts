import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

// Create Stripe customer + subscription checkout
export async function POST(req: NextRequest) {
  const { priceId, agencyId } = await req.json();
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const agency = await db.agency.findUnique({ where: { id: agencyId } });
  if (!agency) return NextResponse.json({ error: "Agency not found" }, { status: 404 });

  // Get or create Stripe customer
  let customerId = agency.customerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.emailAddresses[0].emailAddress,
      name: agency.name,
      metadata: { agencyId },
    });
    customerId = customer.id;
    await db.agency.update({ where: { id: agencyId }, data: { customerId } });
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_URL}agency/${agencyId}/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}agency/${agencyId}/billing?cancelled=true`,
    subscription_data: { metadata: { agencyId } },
  });

  return NextResponse.json({ url: session.url });
}
