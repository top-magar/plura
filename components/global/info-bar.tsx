"use client";

import { useState } from "react";
import { Bell, Menu } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/global/mode-toggle";
import { SidebarContent, type SidebarProps } from "@/components/sidebar/menu-options";
import type { Role } from "@/lib/generated/prisma/client";

type NotificationWithUser = {
  id: string;
  notification: string;
  createdAt: Date;
  User: { name: string; avatarUrl: string; role?: Role };
};

type Props = {
  notifications: NotificationWithUser[];
  role?: Role;
  subAccountId?: string;
  sidebarProps?: SidebarProps;
};

export default function InfoBar({ notifications, sidebarProps }: Props) {
  const [items] = useState(notifications);

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 sm:gap-3 sm:px-6">
      {/* Mobile hamburger */}
      {sidebarProps && (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="md:hidden">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SidebarContent {...sidebarProps} />
          </SheetContent>
        </Sheet>
      )}

      {/* Push right */}
      <div className="flex-1" />

      <UserButton />

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="relative rounded-full">
            <Bell />
            {items.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {items.length > 9 ? "9+" : items.length}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[320px] sm:w-[380px]">
          <SheetHeader>
            <SheetTitle>Notifications</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4 overflow-y-auto">
            {items.map((n) => (
              <div key={n.id} className="flex gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={n.User.avatarUrl} />
                  <AvatarFallback className="bg-primary text-[10px] text-primary-foreground">
                    {n.User.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 space-y-0.5">
                  <p className="text-[13px] leading-snug">
                    <span className="font-medium">{n.notification.split("|")[0]}</span>
                    <span className="text-muted-foreground">{n.notification.split("|")[1]}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <p className="py-12 text-center text-[13px] text-muted-foreground">No notifications</p>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <ModeToggle />
    </header>
  );
}
