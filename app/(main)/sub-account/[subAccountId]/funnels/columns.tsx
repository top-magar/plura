"use client";

import Link from "next/link";
import { ArrowUpDown, Globe, MoreHorizontal, Pencil, Trash2, ExternalLink } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export type FunnelColumn = {
  id: string;
  name: string;
  description: string | null;
  subDomainName: string | null;
  published: boolean;
  updatedAt: Date;
  subAccountId: string;
  FunnelPages: { id: string }[];
};

export const columns = (
  subAccountId: string,
  onDelete: (id: string) => void,
): ColumnDef<FunnelColumn>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="h-7 -ml-2 text-[12px]" onClick={() => column.toggleSorting()}>
        Name <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <Link href={`/sub-account/${subAccountId}/funnels/${row.original.id}`} className="hover:underline">
        <p className="text-[13px] font-medium">{row.original.name}</p>
        {row.original.description && (
          <p className="text-[11px] text-muted-foreground line-clamp-1">{row.original.description}</p>
        )}
      </Link>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={`text-[10px] ${row.original.published ? "border-emerald-500/30 text-emerald-600" : ""}`}
      >
        {row.original.published ? "Live" : "Draft"}
      </Badge>
    ),
  },
  {
    id: "pages",
    header: "Pages",
    cell: ({ row }) => <span className="text-[13px]">{row.original.FunnelPages.length}</span>,
  },
  {
    id: "domain",
    header: "Domain",
    cell: ({ row }) =>
      row.original.subDomainName ? (
        <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
          <Globe className="h-3 w-3" />
          {row.original.subDomainName}
        </span>
      ) : (
        <span className="text-[12px] text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="h-7 -ml-2 text-[12px]" onClick={() => column.toggleSorting()}>
        Updated <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-[12px] text-muted-foreground">
        {new Date(row.original.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    size: 60,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-xs"><MoreHorizontal /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/sub-account/${subAccountId}/funnels/${row.original.id}`}>
              <Pencil /> Edit
            </Link>
          </DropdownMenuItem>
          {row.original.subDomainName && (
            <DropdownMenuItem onClick={() => window.open(`/${row.original.subDomainName}`, "_blank")}>
              <ExternalLink /> Preview
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => onDelete(row.original.id)}>
            <Trash2 /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
