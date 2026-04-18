import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { agencyId } = await req.json();

  const agency = await db.agency.findUnique({ where: { id: agencyId } });
  if (!agency) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Create or reuse connected account
  let accountId = agency.connectAccountId;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "standard",
      metadata: { agencyId },
    });
    accountId = account.id;
    await db.agency.update({ where: { id: agencyId }, data: { connectAccountId: accountId } });
  }

  // Create account link for onboarding
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.NEXT_PUBLIC_URL}agency/${agencyId}/launchpad`,
    return_url: `${process.env.NEXT_PUBLIC_URL}agency/${agencyId}/launchpad`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}
