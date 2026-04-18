import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import AllSubAccountsClient from "./client";

export default async function AllSubAccountsPage({
  params,
}: {
  params: Promise<{ agencyId: string }>;
}) {
  const { agencyId } = await params;
  const user = await currentUser();
  if (!user) return null;

  const agency = await db.agency.findUnique({
    where: { id: agencyId },
    include: { SubAccount: { orderBy: { createdAt: "desc" } } },
  });
  if (!agency) return null;

  return (
    <AllSubAccountsClient
      subAccounts={agency.SubAccount}
      agencyId={agencyId}
      user={{ id: user.id, name: `${user.firstName} ${user.lastName}` }}
    />
  );
}
