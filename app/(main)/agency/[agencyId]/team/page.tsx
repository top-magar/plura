import { db } from "@/lib/db";
import { getTeamMembers } from "@/lib/queries";
import TeamClient from "./client";

export default async function TeamPage({
  params,
}: {
  params: Promise<{ agencyId: string }>;
}) {
  const { agencyId } = await params;

  const teamMembers = await getTeamMembers(agencyId);
  const agency = await db.agency.findUnique({
    where: { id: agencyId },
    include: { SubAccount: { select: { id: true, name: true } } },
  });

  if (!agency) return null;

  return (
    <TeamClient
      teamMembers={teamMembers}
      agencyId={agencyId}
      subAccounts={agency.SubAccount}
    />
  );
}
