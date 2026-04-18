"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GripVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteTicket, saveActivityLogsNotification } from "@/lib/queries";

type TicketData = {
  id: string;
  name: string;
  description: string | null;
  value: unknown;
  order: number;
  laneId: string;
  Tags: { id: string; name: string; color: string }[];
  Assigned: { id: string; name: string; avatarUrl: string } | null;
  Customer: { id: string; name: string } | null;
};

type Props = {
  ticket: TicketData;
  subAccountId: string;
  onDragStart: (e: React.DragEvent, ticketId: string, laneId: string) => void;
};

export default function TicketCard({ ticket, subAccountId, onDragStart }: Props) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteTicket(ticket.id);
      await saveActivityLogsNotification({ description: `Deleted ticket | ${ticket.name}`, subAccountId });
      toast.success("Ticket deleted");
      router.refresh();
    } catch {
      toast.error("Could not delete ticket");
    }
    setShowDelete(false);
  };

  return (
    <>
      <div
        draggable
        onDragStart={(e) => onDragStart(e, ticket.id, ticket.laneId)}
        className="group flex cursor-grab items-start gap-2 rounded-md border bg-card p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
      >
        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />

        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-[13px] font-medium leading-snug">{ticket.name}</p>

          {ticket.description && (
            <p className="line-clamp-2 text-[12px] text-muted-foreground">{ticket.description}</p>
          )}

          {ticket.Tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {ticket.Tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-[10px]" style={{ borderColor: tag.color }}>
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {ticket.Customer && (
                <span className="text-[11px] text-muted-foreground">{ticket.Customer.name}</span>
              )}
              {ticket.value && (
                <span className="text-[11px] font-medium tabular-nums">${String(ticket.value)}</span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {ticket.Assigned && (
                <Tooltip>
                  <TooltipTrigger>
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={ticket.Assigned.avatarUrl} />
                      <AvatarFallback className="text-[8px]">{ticket.Assigned.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>{ticket.Assigned.name}</TooltipContent>
                </Tooltip>
              )}
              <Button
                variant="ghost"
                size="icon-xs"
                className="opacity-0 group-hover:opacity-100"
                onClick={() => setShowDelete(true)}
              >
                <Trash2 className="h-3 w-3 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete ticket?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive" onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
