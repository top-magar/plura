'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Monitor, Tablet, Smartphone, Eye, Undo2, Redo2, Save, Globe } from 'lucide-react';
import { useEditor } from './editor-provider';
import { upsertFunnelPage, upsertFunnel } from '@/lib/queries';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import type { DeviceType } from './types';

export default function EditorNavigation() {
  const { state, dispatch, funnelId, subaccountId, pageDetails } = useEditor();
  const { device, previewMode, liveMode } = state.editor;
  const [published, setPublished] = React.useState(pageDetails.published ?? false);

  async function handleSave() {
    try {
      const content = JSON.stringify(state.editor.elements);
      await upsertFunnelPage({
        id: pageDetails.id,
        name: pageDetails.name,
        funnelId,
        order: pageDetails.order,
        content,
      });
      toast.success('Saved');
    } catch {
      toast.error('Failed to save');
    }
  }

  async function handlePublishToggle(value: boolean) {
    try {
      // Save page content first
      const content = JSON.stringify(state.editor.elements);
      await upsertFunnelPage({ id: pageDetails.id, name: pageDetails.name, funnelId, order: pageDetails.order, content });
      // Toggle funnel published
      await upsertFunnel({ id: funnelId, name: pageDetails.name, subAccountId: subaccountId, published: value });
      setPublished(value);
      toast.success(value ? 'Published' : 'Unpublished');
    } catch {
      toast.error('Failed to update');
    }
  }

  if (previewMode) return null;

  const devices: { value: DeviceType; icon: React.ElementType; label: string }[] = [
    { value: 'Desktop', icon: Monitor, label: 'Desktop' },
    { value: 'Tablet', icon: Tablet, label: 'Tablet' },
    { value: 'Mobile', icon: Smartphone, label: 'Mobile' },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <nav className="editor-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={`/sub-account/${pageDetails.funnelId}`} style={{ display: 'flex', alignItems: 'center' }}>
                <ArrowLeft size={18} />
              </Link>
            </TooltipTrigger>
            <TooltipContent>Back</TooltipContent>
          </Tooltip>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>{pageDetails.name}</span>
        </div>

        <div className="editor-device-toggle">
          {devices.map((d) => (
            <Tooltip key={d.value}>
              <TooltipTrigger asChild>
                <button
                  className={`editor-device-btn ${device === d.value ? 'active' : ''}`}
                  onClick={() => dispatch({ type: 'CHANGE_DEVICE', payload: { device: d.value } })}
                >
                  <d.icon size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>{d.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="editor-device-btn" onClick={() => dispatch({ type: 'TOGGLE_PREVIEW_MODE' })}>
                <Eye size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Preview</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="editor-device-btn" onClick={() => dispatch({ type: 'UNDO' })}>
                <Undo2 size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="editor-device-btn" onClick={() => dispatch({ type: 'REDO' })}>
                <Redo2 size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Redo</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="editor-device-btn" onClick={handleSave}>
                <Save size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Save</TooltipContent>
          </Tooltip>

          <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{published ? 'Live' : 'Draft'}</span>
            <Switch checked={published} onCheckedChange={handlePublishToggle} />
          </div>
        </div>
      </nav>
    </TooltipProvider>
  );
}
