"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Agency, User } from "@/lib/generated/prisma/client";

type ModalData = {
  user?: User;
  agency?: Agency;
};

type ModalContextType = {
  data: ModalData;
  isOpen: boolean;
  setOpen: (modal: ReactNode, fetchData?: () => Promise<ModalData>) => void;
  setClose: () => void;
};

const ModalContext = createContext<ModalContextType>({
  data: {},
  isOpen: false,
  setOpen: () => {},
  setClose: () => {},
});

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<ModalData>({});
  const [modal, setModal] = useState<ReactNode>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const setOpen = async (modal: ReactNode, fetchData?: () => Promise<ModalData>) => {
    if (fetchData) {
      setData({ ...data, ...(await fetchData()) });
    }
    setModal(modal);
    setIsOpen(true);
  };

  const setClose = () => {
    setIsOpen(false);
    setData({});
  };

  if (!mounted) return null;

  return (
    <ModalContext.Provider value={{ data, isOpen, setOpen, setClose }}>
      {children}
      {modal}
    </ModalContext.Provider>
  );
}

export const useModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within ModalProvider");
  return ctx;
};
