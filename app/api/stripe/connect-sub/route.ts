import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { subAccountId } = await req.json();

  const sub = await db.subAccount.findUnique({ where: { id: subAccountId } });
  if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let accountId = sub.connectAccountId;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "standard",
      metadata: { subAccountId },
    });
    accountId = account.id;
    await db.subAccount.update({ where: { id: subAccountId }, data: { connectAccountId: accountId } });
  }

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.NEXT_PUBLIC_URL}sub-account/${subAccountId}/launchpad`,
    return_url: `${process.env.NEXT_PUBLIC_URL}sub-account/${subAccountId}/launchpad`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}
