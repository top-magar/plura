"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useModal } from "@/providers/modal-provider";
import CustomModal from "@/components/global/custom-modal";
import PipelineForm from "./pipeline-form";
import LaneColumn from "./lane-column";
import { deletePipeline, upsertLane, updateTicketsOrder, saveActivityLogsNotification } from "@/lib/queries";

type TicketData = {
  id: string; name: string; description: string | null; value: unknown;
  order: number; laneId: string;
  Tags: { id: string; name: string; color: string }[];
  Assigned: { id: string; name: string; avatarUrl: string } | null;
  Customer: { id: string; name: string } | null;
};

type LaneData = {
  id: string; name: string; order: number; pipelineId: string;
  Tickets: TicketData[];
};

type PipelineData = {
  id: string; name: string; subAccountId: string;
  Lane: LaneData[];
};

type Props = {
  pipelines: PipelineData[];
  subAccountId: string;
};

export default function PipelineBoard({ pipelines, subAccountId }: Props) {
  const router = useRouter();
  const { setOpen } = useModal();
  const [activePipeline, setActivePipeline] = useState(pipelines[0]?.id ?? "");
  const [dragData, setDragData] = useState<{ ticketId: string; fromLaneId: string } | null>(null);

  const currentPipeline = pipelines.find((p) => p.id === activePipeline);

  const handleDragStart = (e: React.DragEvent, ticketId: string, laneId: string) => {
    e.dataTransfer.effectAllowed = "move";
    setDragData({ ticketId, fromLaneId: laneId });
  };

  const handleDrop = async (_e: React.DragEvent, toLaneId: string) => {
    if (!dragData || !currentPipeline) return;
    if (dragData.fromLaneId === toLaneId) { setDragData(null); return; }

    const fromLane = currentPipeline.Lane.find((l) => l.id === dragData.fromLaneId);
    const toLane = currentPipeline.Lane.find((l) => l.id === toLaneId);
    if (!fromLane || !toLane) return;

    const ticket = fromLane.Tickets.find((t) => t.id === dragData.ticketId);
    if (!ticket) return;

    try {
      await updateTicketsOrder([{ id: ticket.id, order: toLane.Tickets.length, laneId: toLaneId }]);
      router.refresh();
    } catch {
      toast.error("Could not move ticket");
    }
    setDragData(null);
  };

  const handleAddLane = async (pipelineId: string) => {
    try {
      const lanes = currentPipeline?.Lane ?? [];
      await upsertLane({ name: "New Lane", pipelineId, order: lanes.length });
      await saveActivityLogsNotification({ description: "Created a new lane", subAccountId });
      router.refresh();
    } catch {
      toast.error("Could not create lane");
    }
  };

  const handleDeletePipeline = async (id: string) => {
    try {
      await deletePipeline(id);
      await saveActivityLogsNotification({ description: "Deleted a pipeline", subAccountId });
      toast.success("Pipeline deleted");
      router.refresh();
    } catch {
      toast.error("Could not delete pipeline");
    }
  };

  if (pipelines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20">
        <p className="text-[13px] text-muted-foreground">No pipelines yet</p>
        <Button
          variant="link"
          className="mt-2"
          onClick={() =>
            setOpen(
              <CustomModal title="Create Pipeline" subheading="Organize your workflow with pipelines">
                <PipelineForm subAccountId={subAccountId} />
              </CustomModal>
            )
          }
        >
          Create your first pipeline
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tabs value={activePipeline} onValueChange={setActivePipeline}>
        <div className="flex items-center gap-2">
          <ScrollArea className="flex-1">
            <TabsList>
              {pipelines.map((p) => (
                <TabsTrigger key={p.id} value={p.id} className="text-[13px]">
                  {p.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <div className="flex shrink-0 gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() =>
                setOpen(
                  <CustomModal title="Create Pipeline" subheading="Organize your workflow">
                    <PipelineForm subAccountId={subAccountId} />
                  </CustomModal>
                )
              }
            >
              <Plus />
            </Button>
            {currentPipeline && (
              <Button variant="ghost" size="icon-sm" onClick={() => handleDeletePipeline(currentPipeline.id)}>
                <Trash2 className="text-muted-foreground" />
              </Button>
            )}
          </div>
        </div>

        {pipelines.map((pipeline) => (
          <TabsContent key={pipeline.id} value={pipeline.id} className="mt-4">
            <ScrollArea className="w-full">
              <div className="flex gap-4 pb-4">
                {pipeline.Lane.map((lane) => (
                  <LaneColumn
                    key={lane.id}
                    lane={lane}
                    subAccountId={subAccountId}
                    onDragStart={handleDragStart}
                    onDrop={handleDrop}
                  />
                ))}

                {/* Add lane */}
                <button
                  onClick={() => handleAddLane(pipeline.id)}
                  className="flex h-20 w-[280px] shrink-0 items-center justify-center rounded-lg border-2 border-dashed text-[13px] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Plus className="mr-1 h-4 w-4" /> Add lane
                </button>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </TooltipProvider>
  );
}
