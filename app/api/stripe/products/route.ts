import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const subAccountId = req.nextUrl.searchParams.get("subAccountId");
  if (!subAccountId) return NextResponse.json({ error: "Missing subAccountId" }, { status: 400 });

  const sub = await db.subAccount.findUnique({ where: { id: subAccountId } });
  if (!sub?.connectAccountId) return NextResponse.json({ products: [] });

  const products = await stripe.products.list(
    { limit: 50, active: true, expand: ["data.default_price"] },
    { stripeAccount: sub.connectAccountId },
  );

  return NextResponse.json({
    products: products.data.map((p) => {
      const price = p.default_price as { id: string; unit_amount: number | null; currency: string; recurring: { interval: string } | null } | null;
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        image: p.images?.[0] || null,
        priceId: price?.id || null,
        amount: price?.unit_amount || 0,
        currency: price?.currency || "usd",
        recurring: price?.recurring?.interval || null,
      };
    }),
  });
}
