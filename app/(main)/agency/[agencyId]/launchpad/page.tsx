import { CheckCircle, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LaunchpadPage({
  params,
}: {
  params: Promise<{ agencyId: string }>;
}) {
  const { agencyId } = await params;

  const agency = await db.agency.findUnique({ where: { id: agencyId } });
  if (!agency) return null;

  const allDetailsExist =
    agency.address &&
    agency.agencyLogo &&
    agency.city &&
    agency.companyEmail &&
    agency.companyPhone &&
    agency.country &&
    agency.name &&
    agency.state &&
    agency.zipCode;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Launchpad</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Follow the steps below to get your account set up.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Let&apos;s get started</CardTitle>
          <CardDescription>Complete the steps below to fully set up your agency.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Step 1: Mobile shortcut */}
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <Image
                src="/appstore.png"
                alt="App Store"
                height={48}
                width={48}
                className="rounded-md object-contain"
              />
              <p className="text-[13px]">Save the website as a shortcut on your mobile device</p>
            </div>
            <Button variant="secondary" size="sm">Start</Button>
          </div>

          {/* Step 2: Stripe connect */}
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <Image
                src="/stripelogo.png"
                alt="Stripe"
                height={48}
                width={48}
                className="rounded-md object-contain"
              />
              <p className="text-[13px]">Connect your Stripe account to accept payments</p>
            </div>
            {agency.connectAccountId ? (
              <CheckCircle className="h-8 w-8 shrink-0 text-primary" />
            ) : (
              <Button variant="secondary" size="sm">Start</Button>
            )}
          </div>

          {/* Step 3: Business details */}
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <Image
                src={agency.agencyLogo}
                alt="Agency"
                height={48}
                width={48}
                className="rounded-md object-contain"
              />
              <p className="text-[13px]">Fill in all your business details</p>
            </div>
            {allDetailsExist ? (
              <CheckCircle className="h-8 w-8 shrink-0 text-primary" />
            ) : (
              <Button asChild variant="secondary" size="sm">
                <Link href={`/agency/${agencyId}/settings`}>
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
