"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import TicketCard from "./ticket-card";
import { deleteLane, upsertTicket, saveActivityLogsNotification } from "@/lib/queries";

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

type Props = {
  lane: LaneData;
  subAccountId: string;
  onDragStart: (e: React.DragEvent, ticketId: string, laneId: string) => void;
  onDrop: (e: React.DragEvent, laneId: string) => void;
};

export default function LaneColumn({ lane, subAccountId, onDragStart, onDrop }: Props) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleAddTicket = async () => {
    if (!newName.trim()) return;
    try {
      await upsertTicket({ name: newName, laneId: lane.id, order: lane.Tickets.length });
      await saveActivityLogsNotification({ description: `Created ticket | ${newName}`, subAccountId });
      setNewName("");
      setAdding(false);
      router.refresh();
    } catch {
      toast.error("Could not create ticket");
    }
  };

  const handleDeleteLane = async () => {
    try {
      await deleteLane(lane.id);
      await saveActivityLogsNotification({ description: `Deleted lane | ${lane.name}`, subAccountId });
      toast.success("Lane deleted");
      router.refresh();
    } catch {
      toast.error("Could not delete lane");
    }
  };

  return (
    <div
      className={`flex w-[280px] shrink-0 flex-col rounded-lg border bg-muted/30 ${dragOver ? "ring-2 ring-primary/50" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { setDragOver(false); onDrop(e, lane.id); }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2">
          <h3 className="text-[13px] font-semibold">{lane.name}</h3>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] text-muted-foreground">
            {lane.Tickets.length}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-xs"><MoreHorizontal /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem variant="destructive" onClick={handleDeleteLane}>
              <Trash2 /> Delete lane
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tickets */}
      <ScrollArea className="flex-1 px-2">
        <div className="flex flex-col gap-2 pb-2">
          {lane.Tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} subAccountId={subAccountId} onDragStart={onDragStart} />
          ))}
        </div>
      </ScrollArea>

      {/* Add ticket */}
      <div className="border-t p-2">
        {adding ? (
          <div className="space-y-2">
            <Input
              placeholder="Ticket name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTicket()}
              autoFocus
              className="h-8 text-[13px]"
            />
            <div className="flex gap-1">
              <Button size="sm" onClick={handleAddTicket} className="h-7 text-[12px]">Add</Button>
              <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setNewName(""); }} className="h-7 text-[12px]">Cancel</Button>
            </div>
          </div>
        ) : (
          <Button variant="ghost" size="sm" className="w-full justify-start gap-1 text-[12px] text-muted-foreground" onClick={() => setAdding(true)}>
            <Plus className="h-3.5 w-3.5" /> Add ticket
          </Button>
        )}
      </div>
    </div>
  );
}
