import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { agencyId } = await req.json();

  const agency = await db.agency.findUnique({ where: { id: agencyId } });
  if (!agency?.customerId) {
    return NextResponse.json({ error: "No customer" }, { status: 400 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: agency.customerId,
    return_url: `${process.env.NEXT_PUBLIC_URL}agency/${agencyId}/billing`,
  });

  return NextResponse.json({ url: session.url });
}
