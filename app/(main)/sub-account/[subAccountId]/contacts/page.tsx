import { getContacts } from "@/lib/queries";
import ContactsClient from "./client";

export default async function ContactsPage({
  params,
}: {
  params: Promise<{ subAccountId: string }>;
}) {
  const { subAccountId } = await params;
  const contacts = await getContacts(subAccountId);

  return <ContactsClient contacts={contacts} subAccountId={subAccountId} />;
}
