import { getAuthUserDetails } from "@/lib/queries";
import MenuOptions from "./menu-options";

type Props = { id: string; type: "agency" | "subaccount" };

export default async function Sidebar({ id, type }: Props) {
  const user = await getAuthUserDetails();
  if (!user?.Agency) return null;

  const details =
    type === "agency"
      ? user.Agency
      : user.Agency.SubAccount.find((s) => s.id === id);

  if (!details) return null;

  let sidebarLogo = user.Agency.agencyLogo || "/assets/plura-logo.svg";

  if (!user.Agency.whiteLabel && type === "subaccount") {
    const sub = user.Agency.SubAccount.find((s) => s.id === id);
    sidebarLogo = sub?.subAccountLogo || user.Agency.agencyLogo;
  }

  const sidebarOpt =
    type === "agency"
      ? user.Agency.SidebarOption || []
      : user.Agency.SubAccount.find((s) => s.id === id)?.SidebarOption || [];

  const subAccounts = user.Agency.SubAccount.filter((sub) =>
    user.Permissions.find((p) => p.subAccountId === sub.id && p.access)
    || user.role === "AGENCY_OWNER" || user.role === "AGENCY_ADMIN"
  );

  return (
    <MenuOptions
      details={{ name: details.name, address: details.address }}
      id={id}
      sidebarLogo={sidebarLogo}
      sidebarOpt={sidebarOpt}
      subAccounts={subAccounts}
      user={{
        id: user.id,
        name: user.name,
        role: user.role,
        Agency: user.Agency
          ? {
              id: user.Agency.id,
              name: user.Agency.name,
              address: user.Agency.address,
              agencyLogo: user.Agency.agencyLogo,
            }
          : undefined,
      }}
    />
  );
}
