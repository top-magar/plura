import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/sidebar";
import InfoBar from "@/components/global/info-bar";
import Unauthorized from "@/components/global/unauthorized";
import {
  getAuthUserDetails,
  getNotificationAndUser,
  verifyAndAcceptInvitation,
} from "@/lib/queries";

export default async function SubAccountLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ subAccountId: string }>;
}) {
  const { subAccountId } = await params;

  const agencyId = await verifyAndAcceptInvitation();
  if (!agencyId) return <Unauthorized />;

  const user = await currentUser();
  if (!user) return redirect("/");

  // Check permissions
  const userDetails = await getAuthUserDetails();
  if (!userDetails) return <Unauthorized />;

  const hasPermission =
    userDetails.role === "AGENCY_OWNER" ||
    userDetails.role === "AGENCY_ADMIN" ||
    userDetails.Permissions.find(
      (p) => p.subAccountId === subAccountId && p.access
    );

  if (!hasPermission) return <Unauthorized />;

  // Notifications — filter for this sub account unless owner/admin
  let allNotifications: Awaited<ReturnType<typeof getNotificationAndUser>> = [];
  const notifications = await getNotificationAndUser(agencyId);

  if (notifications) {
    if (
      userDetails.role === "AGENCY_OWNER" ||
      userDetails.role === "AGENCY_ADMIN"
    ) {
      allNotifications = notifications;
    } else {
      allNotifications = notifications.filter(
        (n) => n.subAccountId === subAccountId
      );
    }
  }

  // Sidebar props for mobile menu
  const agency = userDetails.Agency;
  const sidebarProps = agency
    ? {
        id: subAccountId,
        subAccounts: agency.SubAccount.filter(
          (sub) =>
            userDetails.Permissions.find(
              (p) => p.subAccountId === sub.id && p.access
            ) ||
            userDetails.role === "AGENCY_OWNER" ||
            userDetails.role === "AGENCY_ADMIN"
        ),
        sidebarOpt:
          agency.SubAccount.find((s) => s.id === subAccountId)
            ?.SidebarOption || [],
        sidebarLogo: (() => {
          if (!agency.whiteLabel) {
            const sub = agency.SubAccount.find((s) => s.id === subAccountId);
            return sub?.subAccountLogo || agency.agencyLogo;
          }
          return agency.agencyLogo || "/assets/plura-logo.svg";
        })(),
        details: (() => {
          const sub = agency.SubAccount.find((s) => s.id === subAccountId);
          return { name: sub?.name || "", address: sub?.address || "" };
        })(),
        user: {
          id: userDetails.id,
          name: userDetails.name,
          role: userDetails.role,
          Agency: {
            id: agency.id,
            name: agency.name,
            address: agency.address,
            agencyLogo: agency.agencyLogo,
          },
        },
      }
    : undefined;

  return (
    <div className="grid h-[100dvh] md:grid-cols-[260px_1fr]">
      <aside className="hidden overflow-y-auto border-r md:block">
        <Sidebar id={subAccountId} type="subaccount" />
      </aside>
      <div className="flex min-h-0 flex-col">
        <InfoBar
          notifications={allNotifications}
          subAccountId={subAccountId}
          sidebarProps={sidebarProps as never}
        />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
