"use client";

import { useState } from "react";
import { Bell, Menu, BellOff, Check } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

function timeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

function groupByDate(items: NotificationWithUser[]): { label: string; items: NotificationWithUser[] }[] {
  const today: NotificationWithUser[] = [];
  const yesterday: NotificationWithUser[] = [];
  const earlier: NotificationWithUser[] = [];
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;

  for (const n of items) {
    const t = new Date(n.createdAt).getTime();
    if (t >= todayStart) today.push(n);
    else if (t >= yesterdayStart) yesterday.push(n);
    else earlier.push(n);
  }

  const groups: { label: string; items: NotificationWithUser[] }[] = [];
  if (today.length) groups.push({ label: "Today", items: today });
  if (yesterday.length) groups.push({ label: "Yesterday", items: yesterday });
  if (earlier.length) groups.push({ label: "Earlier", items: earlier });
  return groups;
}

export default function InfoBar({ notifications, sidebarProps }: Props) {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;
  const groups = groupByDate(notifications);

  const markAllRead = () => setReadIds(new Set(notifications.map((n) => n.id)));

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 sm:gap-3 sm:px-6">
      {sidebarProps && (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="md:hidden"><Menu /></Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SidebarContent {...sidebarProps} />
          </SheetContent>
        </Sheet>
      )}

      <div className="flex-1" />

      <UserButton />

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="relative rounded-full">
            <Bell />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-medium text-primary-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="flex w-[340px] flex-col sm:w-[400px]">
          <SheetHeader>
            <SheetTitle className="text-base">Notifications</SheetTitle>
          </SheetHeader>

          {unreadCount > 0 && (
            <div className="flex items-center justify-between px-4">
              <Badge variant="secondary" className="text-[10px]">{unreadCount} unread</Badge>
              <Button variant="ghost" size="sm" className="h-7 gap-1 text-[11px] text-muted-foreground" onClick={markAllRead}>
                <Check size={12} /> Mark all read
              </Button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {groups.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <BellOff size={32} className="mb-3 opacity-30" />
                <p className="text-[13px]">No notifications yet</p>
                <p className="text-[11px]">Activity will appear here</p>
              </div>
            )}

            {groups.map((group) => (
              <div key={group.label}>
                <div className="sticky top-0 z-10 bg-background py-2">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{group.label}</p>
                </div>
                <div className="space-y-1">
                  {group.items.map((n) => {
                    const isRead = readIds.has(n.id);
                    const parts = n.notification.split("|");
                    const name = parts[0]?.trim() || "User";
                    const desc = parts[1]?.trim() || n.notification;
                    return (
                      <button
                        key={n.id}
                        onClick={() => setReadIds((s) => new Set(s).add(n.id))}
                        className={`flex w-full gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-muted/50 ${!isRead ? "bg-primary/[0.03]" : ""}`}
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={n.User.avatarUrl} />
                          <AvatarFallback className="bg-primary/10 text-[10px] text-primary">
                            {name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] leading-snug">
                            <span className="font-medium">{name}</span>{" "}
                            <span className="text-muted-foreground">{desc}</span>
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">{timeAgo(n.createdAt)}</p>
                        </div>
                        {!isRead && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <ModeToggle />
    </header>
  );
}
