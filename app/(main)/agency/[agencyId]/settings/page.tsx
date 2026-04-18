import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import AgencyDetails from "@/components/forms/agency-details";
import UserDetails from "@/components/forms/user-details";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ agencyId: string }>;
}) {
  const { agencyId } = await params;
  const authUser = await currentUser();
  if (!authUser) return null;

  const userDetails = await db.user.findUnique({
    where: { email: authUser.emailAddresses[0].emailAddress },
  });
  if (!userDetails) return null;

  const agencyDetails = await db.agency.findUnique({
    where: { id: agencyId },
    include: { SubAccount: true },
  });
  if (!agencyDetails) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Settings</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Manage your agency and profile settings.
        </p>
      </div>

      <Tabs defaultValue="agency">
        <TabsList>
          <TabsTrigger value="agency">Agency</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="agency" className="mt-6">
          <AgencyDetails data={agencyDetails} />
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <UserDetails data={userDetails} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
