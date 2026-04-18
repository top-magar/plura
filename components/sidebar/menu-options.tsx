"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsUpDown, Compass, Plus, Search } from "lucide-react";
import clsx from "clsx";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { icons } from "@/lib/constants";
import { useModal } from "@/providers/modal-provider";
import CustomModal from "@/components/global/custom-modal";
import SubAccountDetails from "@/components/forms/sub-account-details";
import type { AgencySidebarOption, SubAccount, SubAccountSidebarOption } from "@/lib/generated/prisma/client";

export type SidebarProps = {
  subAccounts: SubAccount[];
  sidebarOpt: (AgencySidebarOption | SubAccountSidebarOption)[];
  sidebarLogo: string;
  details: { name: string; address: string };
  user: { id: string; name: string; role: string; Agency?: { id: string; name: string; address: string; agencyLogo: string } };
  id: string;
};

export default function MenuOptions(props: SidebarProps) {
  return <SidebarContent {...props} />;
}

export function SidebarContent({ subAccounts, sidebarOpt, sidebarLogo, details, user }: SidebarProps) {
  const { setOpen } = useModal();
  const pathname = usePathname();
  const [search, setSearch] = useState("");

  const isOwner = user.role === "AGENCY_OWNER" || user.role === "AGENCY_ADMIN";
  const filtered = sidebarOpt.filter((o) => o.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex h-full flex-col">
      {/* Logo + name */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-2">
        <div className="relative h-8 w-8 shrink-0">
          <Image src={sidebarLogo} alt="Logo" fill sizes="32px" className="rounded object-contain" />
        </div>
        <span className="truncate text-sm font-semibold">{details.name}</span>
      </div>

      {/* Account switcher */}
      <div className="px-3 py-2">
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex w-full items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50">
              <Compass className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[13px] font-medium">{details.name}</span>
                <span className="truncate text-[11px] text-muted-foreground">{details.address}</span>
              </div>
              <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="z-[200] w-64 p-2" align="start" sideOffset={4}>
            {isOwner && user.Agency && (
              <>
                <p className="px-2 py-1 text-[11px] font-medium text-muted-foreground">Agency</p>
                <Link href={`/agency/${user.Agency.id}`} className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted">
                  <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded border">
                    <Image src={user.Agency.agencyLogo || "/assets/plura-logo.svg"} alt="" fill sizes="24px" className="object-contain p-0.5" />
                  </div>
                  <span className="truncate text-[13px]">{user.Agency.name}</span>
                </Link>
              </>
            )}
            <p className="mt-2 px-2 py-1 text-[11px] font-medium text-muted-foreground">Sub Accounts</p>
            {subAccounts.length ? subAccounts.map((sub) => (
              <Link key={sub.id} href={`/sub-account/${sub.id}`} className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted">
                <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded border">
                  <Image src={sub.subAccountLogo} alt="" fill sizes="24px" className="object-contain p-0.5" />
                </div>
                <span className="truncate text-[13px]">{sub.name}</span>
              </Link>
            )) : (
              <p className="px-2 py-3 text-center text-[12px] text-muted-foreground">No sub accounts</p>
            )}
            {isOwner && (
              <>
                <Separator className="my-2" />
                <button
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => setOpen(
                    <CustomModal title="Create Sub Account" subheading="You can switch between accounts from the sidebar">
                      <SubAccountDetails agencyDetails={user as Record<string, unknown>} userId={user.id} userName={user.name} />
                    </CustomModal>
                  )}
                >
                  <Plus className="h-3.5 w-3.5" /> New sub account
                </button>
              </>
            )}
          </PopoverContent>
        </Popover>
      </div>

      <Separator className="mx-3" />

      {/* Search */}
      <div className="relative px-3 pt-3 pb-1">
        <Search className="pointer-events-none absolute left-5.5 top-5.5 h-3.5 w-3.5 text-muted-foreground" />
        <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 pl-8 text-[13px]" />
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="flex flex-col gap-0.5">
          {filtered.map((opt) => {
            const Icon = icons.find((i) => i.value === opt.icon)?.path;
            const active = pathname === opt.link;
            return (
              <Link
                key={opt.id}
                href={opt.link}
                className={clsx(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
                  active ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                <span className="truncate">{opt.name}</span>
              </Link>
            );
          })}
          {filtered.length === 0 && <p className="py-4 text-center text-[12px] text-muted-foreground">No results</p>}
        </nav>
      </ScrollArea>
    </div>
  );
}
