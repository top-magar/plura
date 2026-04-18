import { getMedia } from "@/lib/queries";
import MediaBucket from "@/components/media";

export default async function MediaPage({
  params,
}: {
  params: Promise<{ subAccountId: string }>;
}) {
  const { subAccountId } = await params;
  const data = await getMedia(subAccountId);

  return <MediaBucket data={data} subAccountId={subAccountId} />;
}
