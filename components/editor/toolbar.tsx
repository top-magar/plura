"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Laptop, Redo2, Save, Smartphone, Tablet, Undo2 } from "lucide-react";
import { toast } from "sonner";
import clsx from "clsx";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { useEditor } from "./provider";
import { upsertFunnelPage } from "@/lib/queries";
import type { DeviceType } from "./types";

type Props = { funnelId: string; subAccountId: string; pageName: string; pageId: string };

const devices: { value: DeviceType; icon: typeof Laptop; label: string }[] = [
  { value: "Desktop", icon: Laptop, label: "Desktop" },
  { value: "Tablet", icon: Tablet, label: "Tablet" },
  { value: "Mobile", icon: Smartphone, label: "Mobile" },
];

export default function EditorToolbar({ funnelId, subAccountId, pageName, pageId }: Props) {
  const { state, dispatch } = useEditor();
  const router = useRouter();
  const [name, setName] = useState(pageName);
  const [editingName, setEditingName] = useState(false);

  const handleSave = async () => {
    try {
      await upsertFunnelPage({
        id: pageId,
        name,
        funnelId,
        order: 0,
        content: JSON.stringify(state.editor.elements),
      });
      toast.success("Page saved");
    } catch {
      toast.error("Could not save");
    }
  };

  const handleNameBlur = async () => {
    setEditingName(false);
    if (name !== pageName) {
      try {
        await upsertFunnelPage({ id: pageId, name, funnelId, order: 0 });
        toast.success("Page renamed");
        router.refresh();
      } catch {
        toast.error("Could not rename");
        setName(pageName);
      }
    }
  };

  return (
    <div className="flex h-12 items-center justify-between border-b bg-background px-3">
      {/* Left - Back + Page name */}
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon-xs">
          <Link href={`/sub-account/${subAccountId}/funnels/${funnelId}`}><ArrowLeft /></Link>
        </Button>
        {editingName ? (
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={(e) => e.key === "Enter" && handleNameBlur()}
            autoFocus
            className="h-7 w-40 text-[13px]"
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="text-[13px] font-medium hover:underline"
          >
            {name}
          </button>
        )}
      </div>

      {/* Center - Device toggle */}
      <div className="flex items-center gap-1 rounded-lg border p-0.5">
        {devices.map(({ value, icon: Icon, label }) => (
          <Tooltip key={value}>
            <TooltipTrigger asChild>
              <button
                onClick={() => dispatch({ type: "CHANGE_DEVICE", payload: { device: value } })}
                className={clsx(
                  "rounded-md p-1.5 transition-colors",
                  state.editor.device === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-1">
        {/* Preview */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-xs" onClick={() => dispatch({ type: "TOGGLE_PREVIEW" })}>
              {state.editor.previewMode ? <EyeOff /> : <Eye />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{state.editor.previewMode ? "Exit preview" : "Preview"}</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-5" />

        {/* Undo/Redo */}
        <Button variant="ghost" size="icon-xs" onClick={() => dispatch({ type: "UNDO" })} disabled={state.history.currentIndex <= 0}>
          <Undo2 />
        </Button>
        <Button variant="ghost" size="icon-xs" onClick={() => dispatch({ type: "REDO" })} disabled={state.history.currentIndex >= state.history.history.length - 1}>
          <Redo2 />
        </Button>

        <Separator orientation="vertical" className="h-5" />

        {/* Draft/Published toggle */}
        <div className="flex items-center gap-1.5 px-1">
          <span className="text-[11px] text-muted-foreground">Draft</span>
          <Switch
            checked={state.editor.liveMode}
            onCheckedChange={(v) => dispatch({ type: "TOGGLE_LIVE_MODE", payload: { value: v } })}
          />
        </div>

        <Separator orientation="vertical" className="h-5" />

        {/* Save */}
        <Button size="sm" onClick={handleSave} className="gap-1 text-[12px]">
          <Save className="h-3.5 w-3.5" /> Save
        </Button>
      </div>
    </div>
  );
}
