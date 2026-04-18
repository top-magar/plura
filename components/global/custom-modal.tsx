"use client";

import { useModal } from "@/providers/modal-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  title: string;
  subheading: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

export default function CustomModal({ title, subheading, children, defaultOpen }: Props) {
  const { isOpen, setClose } = useModal();
  const open = defaultOpen ?? isOpen;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setClose(); }}>
      <DialogContent className="h-screen overflow-scroll bg-card md:max-h-[700px] md:h-fit">
        <DialogHeader className="pt-8 text-left">
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          <DialogDescription>{subheading}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
