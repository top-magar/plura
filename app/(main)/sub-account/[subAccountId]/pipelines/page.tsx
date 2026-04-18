import { getPipelines } from "@/lib/queries";
import PipelineBoard from "@/components/pipelines/pipeline-board";

export default async function PipelinesPage({
  params,
}: {
  params: Promise<{ subAccountId: string }>;
}) {
  const { subAccountId } = await params;
  const pipelines = await getPipelines(subAccountId);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Pipelines</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Manage your leads and business processes.
        </p>
      </div>
      <PipelineBoard pipelines={pipelines} subAccountId={subAccountId} />
    </div>
  );
}
