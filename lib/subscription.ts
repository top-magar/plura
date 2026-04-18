import { db } from "./db";
import { pricingCards } from "./constants";

export async function getSubscriptionStatus(agencyId: string) {
  const subscription = await db.subscription.findFirst({
    where: { agencyId, active: true },
  });

  if (!subscription) return { plan: "starter" as const, active: false, features: getFeatures("starter") };

  const card = pricingCards.find((c) => c.priceId === subscription.priceId);
  const plan = card?.title === "Unlimited Saas" ? "unlimited" as const : "basic" as const;

  return { plan, active: true, features: getFeatures(plan) };
}

type Plan = "starter" | "basic" | "unlimited";

function getFeatures(plan: Plan) {
  return {
    maxSubAccounts: plan === "starter" ? 3 : Infinity,
    maxTeamMembers: plan === "starter" ? 2 : Infinity,
    maxPipelines: Infinity,
    maxFunnels: plan === "starter" ? 1 : Infinity,
    customDomains: plan !== "starter",
    whiteLabel: plan !== "starter",
    prioritySupport: plan === "unlimited",
    rebilling: plan === "unlimited",
  };
}
