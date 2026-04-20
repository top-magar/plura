"use client";

import { useState } from "react";
import { Layout, Layers, Bookmark } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import ComponentsTab from "./components-tab";
import LayersTab from "./layers-tab";
import TemplatesTab from "./templates-tab";

type Tab = "components" | "layers" | "templates";

const tabs: { id: Tab; label: string; icon: typeof Layout }[] = [
  { id: "components", label: "Components", icon: Layout },
  { id: "layers", label: "Layers", icon: Layers },
  { id: "templates", label: "Templates", icon: Bookmark },
];

export default function LeftPanel() {
  const [active, setActive] = useState<Tab | null>("components");

  const toggle = (tab: Tab) => setActive((prev) => (prev === tab ? null : tab));

  return (
    <div className="flex h-full border-r border-sidebar-border">
      {/* Icon rail */}
      <TooltipProvider delayDuration={200}>
        <div className="flex w-12 flex-col items-center gap-1 bg-sidebar py-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <Tooltip key={id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => toggle(id)}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground",
                    active === id && "bg-primary/10 text-primary"
                  )}
                >
                  <Icon className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-[10px]">{label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      {/* Panel content */}
      {active && (
        <div className="flex w-64 flex-col overflow-hidden bg-sidebar">
          <div className="flex h-10 items-center border-b border-sidebar-border px-3">
            <span className="text-xs font-medium capitalize">{active}</span>
          </div>
          {active === "components" && <ComponentsTab />}
          {active === "layers" && <LayersTab />}
          {active === "templates" && <TemplatesTab />}
        </div>
      )}
    </div>
  );
}
