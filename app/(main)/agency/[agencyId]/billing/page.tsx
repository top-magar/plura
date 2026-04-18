import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { pricingCards } from "@/lib/constants";
import BillingClient from "./client";

export default async function BillingPage({
  params,
}: {
  params: Promise<{ agencyId: string }>;
}) {
  const { agencyId } = await params;

  const agency = await db.agency.findUnique({
    where: { id: agencyId },
    include: { Subscription: true },
  });
  if (!agency) return null;

  // Get charges if customer exists
  let charges: { id: string; amount: number; status: string; created: number; description: string | null }[] = [];
  if (agency.customerId) {
    try {
      const raw = await stripe.charges.list({ customer: agency.customerId, limit: 20 });
      charges = raw.data.map((c) => ({
        id: c.id,
        amount: c.amount,
        status: c.status,
        created: c.created,
        description: c.description,
      }));
    } catch {
      // Customer may not exist in Stripe yet
    }
  }

  return (
    <BillingClient
      agencyId={agencyId}
      subscription={agency.Subscription}
      charges={charges}
      pricingCards={pricingCards}
    />
  );
}
