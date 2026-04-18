import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/sidebar";
import InfoBar from "@/components/global/info-bar";
import Unauthorized from "@/components/global/unauthorized";
import { getAuthUserDetails, getNotificationAndUser, verifyAndAcceptInvitation } from "@/lib/queries";

export default async function AgencyIdLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ agencyId: string }>;
}) {
  const { agencyId } = await params;

  const verifiedAgencyId = await verifyAndAcceptInvitation();
  const user = await currentUser();

  if (!user) return redirect("/");
  if (!verifiedAgencyId) return redirect("/agency");

  if (
    user.privateMetadata.role !== "AGENCY_OWNER" &&
    user.privateMetadata.role !== "AGENCY_ADMIN"
  ) {
    return <Unauthorized />;
  }

  let allNotifications: Awaited<ReturnType<typeof getNotificationAndUser>> = [];
  const notifications = await getNotificationAndUser(verifiedAgencyId);
  if (notifications) allNotifications = notifications;

  const userDetails = await getAuthUserDetails();
  const agency = userDetails?.Agency;
  const sidebarProps = agency ? {
    id: agencyId,
    subAccounts: agency.SubAccount.filter((sub) =>
      userDetails.Permissions.find((p) => p.subAccountId === sub.id && p.access)
      || agency.SubAccount.length > 0 && userDetails.role === "AGENCY_OWNER"
    ),
    sidebarOpt: agency.SidebarOption || [],
    sidebarLogo: agency.agencyLogo || "/assets/plura-logo.svg",
    details: { name: agency.name, address: agency.address },
    user: {
      id: userDetails.id,
      name: userDetails.name,
      role: userDetails.role,
      Agency: { id: agency.id, name: agency.name, address: agency.address, agencyLogo: agency.agencyLogo },
    },
  } : undefined;

  return (
    <div className="grid h-[100dvh] md:grid-cols-[260px_1fr]">
      <aside className="hidden overflow-y-auto border-r md:block">
        <Sidebar id={agencyId} type="agency" />
      </aside>
      <div className="flex min-h-0 flex-col">
        <InfoBar
          notifications={allNotifications}
          sidebarProps={sidebarProps as never}
        />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
