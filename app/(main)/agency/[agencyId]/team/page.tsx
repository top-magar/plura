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
  const pendingInvitations = await db.invitation.findMany({
    where: { agencyId, status: "PENDING" },
  });

  if (!agency) return null;

  return (
    <TeamClient
      teamMembers={teamMembers}
      agencyId={agencyId}
      subAccounts={agency.SubAccount}
      pendingInvitations={pendingInvitations.map((i) => ({ id: i.id, email: i.email, role: i.role, status: i.status }))}
    />
  );
}
