"use server";

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { v4 } from "uuid";
import { db } from "./db";
import type { Agency, Plan, SubAccount, User } from "./generated/prisma/client";

// ─── Auth & User ────────────────────────────────────────────

export async function getAuthUserDetails() {
  const user = await currentUser();
  if (!user) return null;

  return db.user.findUnique({
    where: { email: user.emailAddresses[0].emailAddress },
    include: {
      Agency: {
        include: {
          SidebarOption: true,
          SubAccount: { include: { SidebarOption: true } },
        },
      },
      Permissions: true,
    },
  });
}

export async function initUser(newUser: Partial<User>) {
  const user = await currentUser();
  if (!user) return;

  const userData = await db.user.upsert({
    where: { email: user.emailAddresses[0].emailAddress },
    update: newUser,
    create: {
      id: user.id,
      avatarUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress,
      name: `${user.firstName} ${user.lastName}`,
      role: newUser.role || "SUBACCOUNT_USER",
    },
  });

  const clerk = await clerkClient();
  await clerk.users.updateUserMetadata(user.id, {
    privateMetadata: { role: newUser.role || "SUBACCOUNT_USER" },
  });

  return userData;
}

export async function createTeamUser(agencyId: string, user: User) {
  if (user.role === "AGENCY_OWNER") return null;
  return db.user.create({ data: { ...user } });
}

// ─── Invitations ────────────────────────────────────────────

export async function verifyAndAcceptInvitation() {
  const user = await currentUser();
  if (!user) return redirect("/agency/sign-in");

  const invitation = await db.invitation.findUnique({
    where: {
      email: user.emailAddresses[0].emailAddress,
      status: "PENDING",
    },
  });

  if (invitation) {
    const userDetails = await createTeamUser(invitation.agencyId, {
      email: invitation.email,
      agencyId: invitation.agencyId,
      avatarUrl: user.imageUrl,
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      role: invitation.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await saveActivityLogsNotification({
      agencyId: invitation.agencyId,
      description: "Joined",
      subAccountId: undefined,
    });

    if (userDetails) {
      const clerk = await clerkClient();
      await clerk.users.updateUserMetadata(user.id, {
        privateMetadata: { role: userDetails.role || "SUBACCOUNT_USER" },
      });
      await db.invitation.delete({ where: { email: userDetails.email } });
      return userDetails.agencyId;
    }
    return null;
  }

  const agency = await db.user.findUnique({
    where: { email: user.emailAddresses[0].emailAddress },
  });
  return agency?.agencyId || null;
}

// ─── Activity Logs ──────────────────────────────────────────

export async function saveActivityLogsNotification({
  agencyId,
  description,
  subAccountId,
}: {
  agencyId?: string;
  description: string;
  subAccountId?: string;
}) {
  const authUser = await currentUser();
  let userData: User | null | undefined;

  if (!authUser) {
    const response = await db.user.findFirst({
      where: { Agency: { SubAccount: { some: { id: subAccountId } } } },
    });
    userData = response;
  } else {
    userData = await db.user.findUnique({
      where: { email: authUser.emailAddresses[0].emailAddress },
    });
  }

  if (!userData) return;

  let foundAgencyId = agencyId;
  if (!foundAgencyId) {
    if (!subAccountId) throw new Error("Provide agencyId or subAccountId");
    const sub = await db.subAccount.findUnique({ where: { id: subAccountId } });
    if (sub) foundAgencyId = sub.agencyId;
  }

  if (subAccountId) {
    await db.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        User: { connect: { id: userData.id } },
        Agency: { connect: { id: foundAgencyId! } },
        SubAccount: { connect: { id: subAccountId } },
      },
    });
  } else {
    await db.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        User: { connect: { id: userData.id } },
        Agency: { connect: { id: foundAgencyId! } },
      },
    });
  }
}

// ─── Agency CRUD ────────────────────────────────────────────

export async function upsertAgency(agency: Agency, price?: Plan) {
  if (!agency.companyEmail) return null;

  try {
    return await db.agency.upsert({
      where: { id: agency.id },
      update: agency,
      create: {
        ...agency,
        users: { connect: { email: agency.companyEmail } },
        SidebarOption: {
          create: [
            { name: "Dashboard", icon: "category", link: `/agency/${agency.id}` },
            { name: "Launchpad", icon: "clipboardIcon", link: `/agency/${agency.id}/launchpad` },
            { name: "Billing", icon: "payment", link: `/agency/${agency.id}/billing` },
            { name: "Settings", icon: "settings", link: `/agency/${agency.id}/settings` },
            { name: "Sub Accounts", icon: "person", link: `/agency/${agency.id}/all-sub-accounts` },
            { name: "Team", icon: "shield", link: `/agency/${agency.id}/team` },
          ],
        },
      },
    });
  } catch (e) {
    console.log("[ERROR] Error upserting agency:", e);
  }
}

export async function updateAgencyDetails(agencyId: string, agencyDetails: Partial<Agency>) {
  const response = await db.agency.update({
    where: { id: agencyId },
    data: { ...agencyDetails },
  });
  return response;
}

export async function deleteAgency(agencyId: string) {
  return db.agency.delete({ where: { id: agencyId } });
}

// ─── User CRUD ──────────────────────────────────────────────

export async function updateUser(userId: string, data: Partial<User>) {
  const response = await db.user.update({
    where: { id: userId },
    data: { ...data },
  });

  const clerk = await clerkClient();
  await clerk.users.updateUserMetadata(userId, {
    privateMetadata: { role: data.role || response.role },
  });

  return response;
}

export async function getUserPermissions(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    select: {
      Permissions: { include: { SubAccount: true } },
    },
  });
}

export async function changeUserPermissions(
  permissionId: string | undefined,
  userEmail: string,
  subAccountId: string,
  access: boolean
) {
  try {
    return await db.permissions.upsert({
      where: { id: permissionId || "" },
      update: { access },
      create: {
        id: permissionId || v4(),
        access,
        email: userEmail,
        subAccountId,
      },
    });
  } catch (e) {
    console.log("[ERROR] Could not change permission:", e);
  }
}

// ─── Sub Account CRUD ───────────────────────────────────────

export async function upsertSubAccount(subAccount: SubAccount) {
  if (!subAccount.companyEmail) return null;

  const agencyOwner = await db.user.findFirst({
    where: { Agency: { id: subAccount.agencyId }, role: "AGENCY_OWNER" },
  });

  if (!agencyOwner) return console.log("[ERROR] Could not find agency owner");

  const permissionId = v4();

  try {
    return await db.subAccount.upsert({
      where: { id: subAccount.id },
      update: subAccount,
      create: {
        ...subAccount,
        Permissions: {
          create: {
            access: true,
            email: agencyOwner.email,
            id: permissionId,
            User: { connect: { id: agencyOwner.id } },
          },
        },
        Pipeline: { create: { name: "Lead Cycle" } },
        SidebarOption: {
          create: [
            { name: "Launchpad", icon: "clipboardIcon", link: `/sub-account/${subAccount.id}/launchpad` },
            { name: "Settings", icon: "settings", link: `/sub-account/${subAccount.id}/settings` },
            { name: "Funnels", icon: "pipelines", link: `/sub-account/${subAccount.id}/funnels` },
            { name: "Media", icon: "database", link: `/sub-account/${subAccount.id}/media` },
            { name: "Automations", icon: "chip", link: `/sub-account/${subAccount.id}/automations` },
            { name: "Pipelines", icon: "flag", link: `/sub-account/${subAccount.id}/pipelines` },
            { name: "Contacts", icon: "person", link: `/sub-account/${subAccount.id}/contacts` },
            { name: "Dashboard", icon: "category", link: `/sub-account/${subAccount.id}` },
          ],
        },
      },
    });
  } catch (e) {
    console.log("[ERROR] Error upserting sub account:", e);
  }
}

// ─── Team ────────────────────────────────────────────────────

export async function getTeamMembers(agencyId: string) {
  return db.user.findMany({
    where: { agencyId },
    include: {
      Agency: { include: { SubAccount: true } },
      Permissions: { include: { SubAccount: true } },
    },
  });
}

export async function sendInvitation(role: string, email: string, agencyId: string) {
  const invitation = await db.invitation.create({
    data: { email, agencyId, role: role as "AGENCY_ADMIN" | "SUBACCOUNT_USER" | "SUBACCOUNT_GUEST" },
  });

  try {
    const clerk = await clerkClient();
    await clerk.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: process.env.NEXT_PUBLIC_URL!,
      publicMetadata: { throughInvitation: true, role },
    });
  } catch (e) {
    console.log("[ERROR] Clerk invitation failed:", e);
  }

  return invitation;
}

export async function deleteUser(userId: string) {
  const clerk = await clerkClient();
  await clerk.users.deleteUser(userId);
  return db.user.delete({ where: { id: userId } });
}

export async function deleteSubAccount(subAccountId: string) {
  return db.subAccount.delete({ where: { id: subAccountId } });
}

export async function getSubAccountDetails(subAccountId: string) {
  return db.subAccount.findUnique({ where: { id: subAccountId } });
}

// ─── Contacts ────────────────────────────────────────────────

export async function getContacts(subAccountId: string) {
  return db.contact.findMany({
    where: { subAccountId },
    include: { Ticket: { select: { value: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function upsertContact(contact: { id?: string; name: string; email: string; subAccountId: string }) {
  return db.contact.upsert({
    where: { id: contact.id || "" },
    update: { name: contact.name, email: contact.email },
    create: { name: contact.name, email: contact.email, subAccountId: contact.subAccountId },
  });
}

export async function deleteContact(contactId: string) {
  return db.contact.delete({ where: { id: contactId } });
}

// ─── Pipelines ──────────────────────────────────────────────

export async function getPipelines(subAccountId: string) {
  return db.pipeline.findMany({
    where: { subAccountId },
    include: {
      Lane: { include: { Tickets: { include: { Tags: true, Assigned: true, Customer: true } } }, orderBy: { order: "asc" } },
    },
  });
}

export async function getPipelineDetails(pipelineId: string) {
  return db.pipeline.findUnique({
    where: { id: pipelineId },
  });
}

export async function upsertPipeline(pipeline: { id?: string; name: string; subAccountId: string }) {
  return db.pipeline.upsert({
    where: { id: pipeline.id || "" },
    update: { name: pipeline.name },
    create: { name: pipeline.name, subAccountId: pipeline.subAccountId },
  });
}

export async function deletePipeline(pipelineId: string) {
  return db.pipeline.delete({ where: { id: pipelineId } });
}

// ─── Lanes ──────────────────────────────────────────────────

export async function getLanesWithTickets(pipelineId: string) {
  return db.lane.findMany({
    where: { pipelineId },
    include: {
      Tickets: {
        orderBy: { order: "asc" },
        include: { Tags: true, Assigned: true, Customer: true },
      },
    },
    orderBy: { order: "asc" },
  });
}

export async function upsertLane(lane: { id?: string; name: string; pipelineId: string; order?: number }) {
  return db.lane.upsert({
    where: { id: lane.id || "" },
    update: { name: lane.name, order: lane.order },
    create: { name: lane.name, pipelineId: lane.pipelineId, order: lane.order ?? 0 },
  });
}

export async function deleteLane(laneId: string) {
  return db.lane.delete({ where: { id: laneId } });
}

export async function updateLanesOrder(lanes: { id: string; order: number }[]) {
  const updates = lanes.map((l) => db.lane.update({ where: { id: l.id }, data: { order: l.order } }));
  return db.$transaction(updates);
}

export async function updateTicketsOrder(tickets: { id: string; order: number; laneId: string }[]) {
  const updates = tickets.map((t) => db.ticket.update({ where: { id: t.id }, data: { order: t.order, laneId: t.laneId } }));
  return db.$transaction(updates);
}

// ─── Tickets ────────────────────────────────────────────────

export async function upsertTicket(ticket: {
  id?: string;
  name: string;
  laneId: string;
  order?: number;
  value?: number;
  description?: string;
  customerId?: string;
  assignedUserId?: string;
}) {
  return db.ticket.upsert({
    where: { id: ticket.id || "" },
    update: {
      name: ticket.name,
      value: ticket.value,
      description: ticket.description,
      customerId: ticket.customerId,
      assignedUserId: ticket.assignedUserId,
    },
    create: {
      name: ticket.name,
      laneId: ticket.laneId,
      order: ticket.order ?? 0,
      value: ticket.value,
      description: ticket.description,
      customerId: ticket.customerId,
      assignedUserId: ticket.assignedUserId,
    },
    include: { Tags: true, Assigned: true, Customer: true },
  });
}

export async function deleteTicket(ticketId: string) {
  return db.ticket.delete({ where: { id: ticketId } });
}

// ─── Media ───────────────────────────────────────────────────

export async function getMedia(subAccountId: string) {
  return db.subAccount.findUnique({
    where: { id: subAccountId },
    include: { Media: { orderBy: { createdAt: "desc" } } },
  });
}

export async function createMedia(subAccountId: string, mediaFile: { link: string; name: string }) {
  return db.media.create({
    data: { link: mediaFile.link, name: mediaFile.name, subAccountId },
  });
}

export async function deleteMedia(mediaId: string) {
  return db.media.delete({ where: { id: mediaId } });
}

export async function getNotificationAndUser(agencyId: string) {
  try {
    return await db.notification.findMany({
      where: { agencyId },
      include: { User: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    console.log("[ERROR] Error fetching notifications");
  }
}
