import { CheckCircle, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ConnectSubStripeButton from "./connect-stripe";

export default async function SubAccountLaunchpadPage({
  params,
}: {
  params: Promise<{ subAccountId: string }>;
}) {
  const { subAccountId } = await params;

  const subAccount = await db.subAccount.findUnique({ where: { id: subAccountId } });
  if (!subAccount) return null;

  const allDetailsExist =
    subAccount.address && subAccount.subAccountLogo && subAccount.city &&
    subAccount.companyEmail && subAccount.companyPhone && subAccount.country &&
    subAccount.name && subAccount.state && subAccount.zipCode;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Launchpad</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">Complete the steps below to set up your sub account.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Get started</CardTitle>
          <CardDescription>Follow these steps to complete your setup.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <Image src="/stripelogo.svg" alt="Stripe" height={48} width={48} className="rounded-md object-contain" />
              <p className="text-[13px]">Connect your Stripe account to accept payments</p>
            </div>
            {subAccount.connectAccountId ? (
              <CheckCircle className="h-8 w-8 shrink-0 text-primary" />
            ) : (
              <ConnectSubStripeButton subAccountId={subAccountId} />
            )}
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <Image src={subAccount.subAccountLogo} alt="Logo" height={48} width={48} className="rounded-md object-contain" />
              <p className="text-[13px]">Fill in all your business details</p>
            </div>
            {allDetailsExist ? (
              <CheckCircle className="h-8 w-8 shrink-0 text-primary" />
            ) : (
              <Button asChild variant="secondary" size="sm">
                <Link href={`/sub-account/${subAccountId}/settings`}>
                  Start <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
