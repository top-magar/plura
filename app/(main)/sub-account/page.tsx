import { redirect } from "next/navigation";
import { getAuthUserDetails, verifyAndAcceptInvitation } from "@/lib/queries";
import Unauthorized from "@/components/global/unauthorized";

export default async function SubAccountPage() {
  const agencyId = await verifyAndAcceptInvitation();
  if (!agencyId) return <Unauthorized />;

  const user = await getAuthUserDetails();
  if (!user) return <Unauthorized />;

  const firstSubWithAccess = user.Permissions.find((p) => p.access);

  if (firstSubWithAccess) {
    return redirect(`/sub-account/${firstSubWithAccess.subAccountId}`);
  }

  return <Unauthorized />;
}
