'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Monitor, Tablet, Smartphone, Eye, Undo2, Redo2, Save } from 'lucide-react';
import { useEditor } from './editor-provider';
import { upsertFunnelPage, upsertFunnel } from '@/lib/queries';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { DeviceType } from './types';

const iconBtn = 'flex items-center justify-center size-8 rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors cursor-pointer';

const devices: { value: DeviceType; icon: React.ElementType; label: string }[] = [
  { value: 'Desktop', icon: Monitor, label: 'Desktop' },
  { value: 'Tablet', icon: Tablet, label: 'Tablet' },
  { value: 'Mobile', icon: Smartphone, label: 'Mobile' },
];

export default function EditorNavigation() {
  const { state, dispatch, funnelId, subaccountId, pageDetails } = useEditor();
  const { device, previewMode } = state.editor;
  const [published, setPublished] = React.useState(pageDetails.published ?? false);

  async function handleSave() {
    try {
      await upsertFunnelPage({
        id: pageDetails.id,
        name: pageDetails.name,
        funnelId,
        order: pageDetails.order,
        content: JSON.stringify(state.editor.elements),
      });
      toast.success('Saved');
    } catch {
      toast.error('Failed to save');
    }
  }

  async function handlePublishToggle(value: boolean) {
    try {
      await upsertFunnelPage({ id: pageDetails.id, name: pageDetails.name, funnelId, order: pageDetails.order, content: JSON.stringify(state.editor.elements) });
      await upsertFunnel({ id: funnelId, name: pageDetails.name, subAccountId: subaccountId, published: value });
      setPublished(value);
      toast.success(value ? 'Published' : 'Unpublished');
    } catch {
      toast.error('Failed to update');
    }
  }

  if (previewMode) return null;

  const actions = [
    { icon: Eye, label: 'Preview', onClick: () => dispatch({ type: 'TOGGLE_PREVIEW_MODE' }) },
    { icon: Undo2, label: 'Undo', onClick: () => dispatch({ type: 'UNDO' }) },
    { icon: Redo2, label: 'Redo', onClick: () => dispatch({ type: 'REDO' }) },
    { icon: Save, label: 'Save', onClick: handleSave },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <nav className="flex items-center justify-between h-12 px-3 border-b border-sidebar-border bg-sidebar shrink-0">
        {/* Left: back + page name */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={`/sub-account/${pageDetails.funnelId}`} className={iconBtn}>
                <ArrowLeft size={18} />
              </Link>
            </TooltipTrigger>
            <TooltipContent>Back</TooltipContent>
          </Tooltip>
          <span className="text-sm font-medium truncate max-w-[200px]">{pageDetails.name}</span>
        </div>

        {/* Center: device toggle */}
        <div className="flex gap-0.5">
          {devices.map((d) => (
            <Tooltip key={d.value}>
              <TooltipTrigger asChild>
                <button
                  className={cn(iconBtn, device === d.value && 'text-sidebar-foreground bg-sidebar-accent')}
                  onClick={() => dispatch({ type: 'CHANGE_DEVICE', payload: { device: d.value } })}
                >
                  <d.icon size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>{d.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Right: actions + publish */}
        <div className="flex items-center gap-0.5">
          {actions.map((a) => (
            <Tooltip key={a.label}>
              <TooltipTrigger asChild>
                <button className={iconBtn} onClick={a.onClick}>
                  <a.icon size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>{a.label}</TooltipContent>
            </Tooltip>
          ))}

          <div className="w-px h-5 bg-border mx-1" />

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground">{published ? 'Live' : 'Draft'}</span>
            <Switch checked={published} onCheckedChange={handlePublishToggle} />
          </div>
        </div>
      </nav>
    </TooltipProvider>
  );
}
