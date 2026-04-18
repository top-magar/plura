import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  getAuthUserDetails,
  verifyAndAcceptInvitation,
} from "@/lib/queries";
import AgencyDetails from "@/components/forms/agency-details";
import Unauthorized from "@/components/global/unauthorized";

export default async function AgencyPage({
  searchParams,
}: {
  searchParams: { plan?: string; state?: string; code?: string };
}) {
  const agencyId = await verifyAndAcceptInvitation();
  const user = await getAuthUserDetails();

  if (agencyId && user) {
    if (user.role === "SUBACCOUNT_USER" || user.role === "SUBACCOUNT_GUEST") {
      return redirect("/sub-account");
    }
    if (user.role === "AGENCY_OWNER" || user.role === "AGENCY_ADMIN") {
      if (searchParams.plan) return redirect(`/agency/${agencyId}/billing?plan=${searchParams.plan}`);
      if (searchParams.state) {
        const [statePath, stateAgencyId] = searchParams.state.split("___");
        if (!stateAgencyId) return <Unauthorized />;
        return redirect(`/agency/${stateAgencyId}/${statePath}?code=${searchParams.code}`);
      }
      return redirect(`/agency/${agencyId}`);
    }
    return <Unauthorized />;
  }

  const authUser = await currentUser();
  if (!authUser) return redirect("/agency/sign-in");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 7.5h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Create your agency</h1>
          <p className="text-sm text-muted-foreground">
            Get started in seconds. You can update details later in settings.
          </p>
        </div>

        {/* Form */}
        <AgencyDetails
          data={{ companyEmail: authUser.emailAddresses[0].emailAddress }}
        />

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          By creating an agency, you agree to our terms of service.
        </p>
      </div>
    </div>
  );
}
