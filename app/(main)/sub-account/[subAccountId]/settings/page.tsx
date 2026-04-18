import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import SubAccountDetails from "@/components/forms/sub-account-details";
import UserDetails from "@/components/forms/user-details";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function SubAccountSettingsPage({
  params,
}: {
  params: Promise<{ subAccountId: string }>;
}) {
  const { subAccountId } = await params;
  const authUser = await currentUser();
  if (!authUser) return null;

  const userDetails = await db.user.findUnique({
    where: { email: authUser.emailAddresses[0].emailAddress },
  });
  if (!userDetails) return null;

  const subAccount = await db.subAccount.findUnique({
    where: { id: subAccountId },
  });
  if (!subAccount) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Settings</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Manage your sub account and profile settings.
        </p>
      </div>

      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Sub Account</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-6">
          <SubAccountDetails
            agencyDetails={{ Agency: { id: subAccount.agencyId } }}
            userId={userDetails.id}
            userName={userDetails.name}
            details={subAccount}
          />
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <UserDetails data={userDetails} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
