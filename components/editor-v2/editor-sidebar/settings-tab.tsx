'use client';

import React from 'react';
import { useEditor } from '../editor-provider';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight,
  AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd,
  AlignHorizontalJustifyStart, AlignHorizontalSpaceAround,
  AlignHorizontalSpaceBetween, ChevronsLeftRight,
  AlignVerticalJustifyCenter, AlignVerticalJustifyStart, AlignVerticalJustifyEnd,
} from 'lucide-react';

const triggerCls = 'size-8 p-0 data-[state=active]:bg-sidebar-accent';
const textTriggerCls = 'h-7 px-2 data-[state=active]:bg-sidebar-accent text-[11px]';
const tabsListCls = 'flex items-center justify-between border rounded-md bg-transparent h-auto gap-1 p-0.5';
const labelCls = 'text-[11px] text-sidebar-foreground/60';
const fieldCls = 'flex flex-col gap-1';

export default function SettingsTab() {
  const { state, dispatch } = useEditor();
  const el = state.editor.selectedElement;

  const handleCustom = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: 'UPDATE_ELEMENT',
      payload: {
        elementDetails: {
          ...el,
          content: { ...(!Array.isArray(el.content) ? el.content : {}), [e.target.id]: e.target.value },
        },
      },
    });
  };

  const handleStyle = (e: { target: { id: string; value: string } }) => {
    dispatch({
      type: 'UPDATE_ELEMENT',
      payload: {
        elementDetails: { ...el, styles: { ...el.styles, [e.target.id]: e.target.value } },
      },
    });
  };

  const setStyle = (id: string, value: string) => handleStyle({ target: { id, value } });

  const opacityNum = typeof el.styles?.opacity === 'number'
    ? el.styles.opacity
    : parseFloat(((el.styles?.opacity as string) || '0').replace('%', '')) || 0;

  return (
    <Accordion type="multiple" className="w-full" defaultValue={['Custom', 'Typography', 'Dimensions', 'Decorations', 'Flexbox']}>
      {/* Custom */}
      <AccordionItem value="Custom" className="px-3 py-0">
        <AccordionTrigger className="!no-underline text-xs py-2">Custom</AccordionTrigger>
        <AccordionContent>
          {el.type === 'link' && !Array.isArray(el.content) && (
            <div className={fieldCls}>
              <Label className={labelCls}>Link Path</Label>
              <Input id="href" placeholder="https://example.com" onChange={handleCustom} value={(!Array.isArray(el.content) ? el.content.href : '') ?? ''} className="h-7 text-xs" />
            </div>
          )}
        </AccordionContent>
      </AccordionItem>

      {/* Typography */}
      <AccordionItem value="Typography" className="px-3 py-0">
        <AccordionTrigger className="!no-underline text-xs py-2">Typography</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-1.5">
          <div className={fieldCls}>
            <Label className={labelCls}>Color</Label>
            <Input id="color" onChange={handleStyle} value={el.styles.color ?? ''} className="h-7 text-xs" />
          </div>
          <div className="flex gap-1.5">
            <div className={`${fieldCls} flex-1`}>
              <Label className={labelCls}>Size</Label>
              <Input id="fontSize" onChange={handleStyle} value={el.styles.fontSize ?? ''} className="h-7 text-xs" />
            </div>
            <div className={`${fieldCls} flex-1`}>
              <Label className={labelCls}>Weight</Label>
              <Input id="fontWeight" onChange={handleStyle} value={el.styles.fontWeight ?? ''} className="h-7 text-xs" />
            </div>
          </div>
          <div className={fieldCls}>
            <Label className={labelCls}>Text Align</Label>
            <Tabs onValueChange={(v) => setStyle('textAlign', v)} value={el.styles.textAlign}>
              <TabsList className={tabsListCls}>
                <TabsTrigger value="left" className={triggerCls}><AlignLeft className="size-3.5" /></TabsTrigger>
                <TabsTrigger value="center" className={triggerCls}><AlignCenter className="size-3.5" /></TabsTrigger>
                <TabsTrigger value="right" className={triggerCls}><AlignRight className="size-3.5" /></TabsTrigger>
                <TabsTrigger value="justify" className={triggerCls}><AlignJustify className="size-3.5" /></TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className={fieldCls}>
            <div className="flex items-center justify-between">
              <Label className={labelCls}>Opacity</Label>
              <span className="text-[10px] text-sidebar-foreground/50">{opacityNum}%</span>
            </div>
            <Slider onValueChange={(e) => setStyle('opacity', `${e[0]}%`)} defaultValue={[opacityNum]} max={100} step={1} />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Dimensions */}
      <AccordionItem value="Dimensions" className="px-3 py-0">
        <AccordionTrigger className="!no-underline text-xs py-2">Dimensions</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-1.5">
          <div className="flex gap-1.5">
            <div className={`${fieldCls} flex-1`}>
              <Label className={labelCls}>Height</Label>
              <Input id="height" placeholder="px" onChange={handleStyle} value={el.styles.height ?? ''} className="h-7 text-xs" />
            </div>
            <div className={`${fieldCls} flex-1`}>
              <Label className={labelCls}>Width</Label>
              <Input id="width" placeholder="px" onChange={handleStyle} value={el.styles.width ?? ''} className="h-7 text-xs" />
            </div>
          </div>
          <div className="flex gap-1.5">
            <div className={`${fieldCls} flex-1`}>
              <Label className={labelCls}>Margin</Label>
              <Input id="margin" placeholder="px" onChange={handleStyle} value={el.styles.margin ?? ''} className="h-7 text-xs" />
            </div>
            <div className={`${fieldCls} flex-1`}>
              <Label className={labelCls}>Padding</Label>
              <Input id="padding" placeholder="px" onChange={handleStyle} value={el.styles.padding ?? ''} className="h-7 text-xs" />
            </div>
          </div>
          <div className={fieldCls}>
            <Label className={labelCls}>Object Fit</Label>
            <Tabs onValueChange={(v) => setStyle('objectFit', v)} value={el.styles.objectFit as string}>
              <TabsList className={tabsListCls}>
                <TabsTrigger value="cover" className={textTriggerCls}>Cover</TabsTrigger>
                <TabsTrigger value="contain" className={textTriggerCls}>Contain</TabsTrigger>
                <TabsTrigger value="fill" className={textTriggerCls}>Fill</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className={fieldCls}>
            <Label className={labelCls}>Overflow</Label>
            <Input id="overflow" placeholder="visible | hidden" onChange={handleStyle} value={el.styles.overflow ?? ''} className="h-7 text-xs" />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Decorations */}
      <AccordionItem value="Decorations" className="px-3 py-0">
        <AccordionTrigger className="!no-underline text-xs py-2">Decorations</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-1.5">
          <div className={fieldCls}>
            <Label className={labelCls}>Border Radius</Label>
            <Input id="borderRadius" placeholder="px" onChange={handleStyle} value={el.styles.borderRadius ?? ''} className="h-7 text-xs" />
          </div>
          <div className={fieldCls}>
            <Label className={labelCls}>Background Color</Label>
            <div className="flex border rounded-md overflow-clip">
              <div className="w-8 shrink-0" style={{ backgroundColor: el.styles.backgroundColor }} />
              <Input placeholder="#HEX" className="!border-y-0 rounded-none !border-r-0 h-7 text-xs" id="backgroundColor" onChange={handleStyle} value={el.styles.backgroundColor ?? ''} />
            </div>
          </div>
          <div className={fieldCls}>
            <Label className={labelCls}>Background Image</Label>
            <div className="flex border rounded-md overflow-clip">
              <div className="w-8 shrink-0" style={{ backgroundImage: el.styles.backgroundImage }} />
              <Input placeholder="url()" className="!border-y-0 rounded-none !border-r-0 h-7 text-xs" id="backgroundImage" onChange={handleStyle} value={el.styles.backgroundImage ?? ''} />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Flexbox */}
      <AccordionItem value="Flexbox" className="px-3 py-0">
        <AccordionTrigger className="!no-underline text-xs py-2">Flexbox</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-1.5">
          <div className={fieldCls}>
            <Label className={labelCls}>Justify Content</Label>
            <Tabs onValueChange={(v) => setStyle('justifyContent', v)} value={el.styles.justifyContent}>
              <TabsList className={tabsListCls}>
                <TabsTrigger value="space-between" className={triggerCls}><AlignHorizontalSpaceBetween className="size-3.5" /></TabsTrigger>
                <TabsTrigger value="space-evenly" className={triggerCls}><AlignHorizontalSpaceAround className="size-3.5" /></TabsTrigger>
                <TabsTrigger value="center" className={triggerCls}><AlignHorizontalJustifyCenter className="size-3.5" /></TabsTrigger>
                <TabsTrigger value="start" className={triggerCls}><AlignHorizontalJustifyStart className="size-3.5" /></TabsTrigger>
                <TabsTrigger value="end" className={triggerCls}><AlignHorizontalJustifyEnd className="size-3.5" /></TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className={fieldCls}>
            <Label className={labelCls}>Align Items</Label>
            <Tabs onValueChange={(v) => setStyle('alignItems', v)} value={el.styles.alignItems}>
              <TabsList className={tabsListCls}>
                <TabsTrigger value="center" className={triggerCls}><AlignVerticalJustifyCenter className="size-3.5" /></TabsTrigger>
                <TabsTrigger value="flex-start" className={triggerCls}><AlignVerticalJustifyStart className="size-3.5" /></TabsTrigger>
                <TabsTrigger value="flex-end" className={triggerCls}><AlignVerticalJustifyEnd className="size-3.5" /></TabsTrigger>
                <TabsTrigger value="stretch" className={triggerCls}><ChevronsLeftRight className="size-3.5 rotate-90" /></TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className={fieldCls}>
            <Label className={labelCls}>Display</Label>
            <Tabs onValueChange={(v) => setStyle('display', v)} value={el.styles.display}>
              <TabsList className={tabsListCls}>
                <TabsTrigger value="flex" className={textTriggerCls}>Flex</TabsTrigger>
                <TabsTrigger value="grid" className={textTriggerCls}>Grid</TabsTrigger>
                <TabsTrigger value="block" className={textTriggerCls}>Block</TabsTrigger>
                <TabsTrigger value="inline-block" className={textTriggerCls}>Inline</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex gap-1.5">
            <div className={`${fieldCls} flex-1`}>
              <Label className={labelCls}>Direction</Label>
              <Input id="flexDirection" placeholder="row" onChange={handleStyle} value={el.styles.flexDirection ?? ''} className="h-7 text-xs" />
            </div>
            <div className={`${fieldCls} flex-1`}>
              <Label className={labelCls}>Gap</Label>
              <Input id="gap" placeholder="px" onChange={handleStyle} value={el.styles.gap ?? ''} className="h-7 text-xs" />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
