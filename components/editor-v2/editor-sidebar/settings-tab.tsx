'use client';

import React from 'react';
import { useEditor } from '../editor-provider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignHorizontalJustifyStart,
  AlignHorizontalSpaceAround,
  AlignHorizontalSpaceBetween,
  ChevronsLeftRight,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyEnd,
} from 'lucide-react';

export default function SettingsTab() {
  const { state, dispatch } = useEditor();

  const handleChangeCustomValues = (e: React.ChangeEvent<HTMLInputElement>) => {
    const settingProperty = e.target.id;
    const value = e.target.value;
    const styleObject = { [settingProperty]: value };

    dispatch({
      type: 'UPDATE_ELEMENT',
      payload: {
        elementDetails: {
          ...state.editor.selectedElement,
          content: {
            ...(!Array.isArray(state.editor.selectedElement.content)
              ? state.editor.selectedElement.content
              : {}),
            ...styleObject,
          },
        },
      },
    });
  };

  const handleOnChanges = (e: { target: { id: string; value: string } }) => {
    const styleSettings = e.target.id;
    const value = e.target.value;
    const styleObject = { [styleSettings]: value };

    dispatch({
      type: 'UPDATE_ELEMENT',
      payload: {
        elementDetails: {
          ...state.editor.selectedElement,
          styles: {
            ...state.editor.selectedElement.styles,
            ...styleObject,
          },
        },
      },
    });
  };

  return (
    <Accordion
      type="multiple"
      className="w-full"
      defaultValue={['Custom', 'Typography', 'Dimensions', 'Decorations', 'Flexbox']}
    >
      {/* Custom */}
      <AccordionItem value="Custom" className="px-6 py-0">
        <AccordionTrigger className="!no-underline">Custom</AccordionTrigger>
        <AccordionContent>
          {state.editor.selectedElement.type === 'link' &&
            !Array.isArray(state.editor.selectedElement.content) && (
              <div className="flex flex-col gap-2">
                <p className="text-muted-foreground">Link Path</p>
                <Input
                  id="href"
                  placeholder="https://domain.example.com/pathname"
                  onChange={handleChangeCustomValues}
                  value={
                    (!Array.isArray(state.editor.selectedElement.content)
                      ? state.editor.selectedElement.content.href
                      : '') ?? ''
                  }
                />
              </div>
            )}
        </AccordionContent>
      </AccordionItem>

      {/* Typography */}
      <AccordionItem value="Typography" className="px-6 py-0 border-y-[1px]">
        <AccordionTrigger className="!no-underline">Typography</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground">Color</p>
            <Input
              id="color"
              onChange={handleOnChanges}
              value={state.editor.selectedElement.styles.color ?? ''}
            />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground">Font Size</p>
            <Input
              id="fontSize"
              onChange={handleOnChanges}
              value={state.editor.selectedElement.styles.fontSize ?? ''}
            />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground">Font Weight</p>
            <Input
              id="fontWeight"
              onChange={handleOnChanges}
              value={state.editor.selectedElement.styles.fontWeight ?? ''}
            />
          </div>
          {/* Text Align */}
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">Text Align</Label>
            <Tabs
              onValueChange={(e) =>
                handleOnChanges({ target: { id: 'textAlign', value: e } })
              }
              value={state.editor.selectedElement.styles.textAlign}
            >
              <TabsList className="flex items-center flex-row justify-between border-[1px] rounded-md bg-transparent h-fit gap-4">
                <TabsTrigger value="left" className="w-10 h-10 p-0 data-[state=active]:bg-muted">
                  <AlignLeft size={18} />
                </TabsTrigger>
                <TabsTrigger value="center" className="w-10 h-10 p-0 data-[state=active]:bg-muted">
                  <AlignCenter size={18} />
                </TabsTrigger>
                <TabsTrigger value="right" className="w-10 h-10 p-0 data-[state=active]:bg-muted">
                  <AlignRight size={18} />
                </TabsTrigger>
                <TabsTrigger value="justify" className="w-10 h-10 p-0 data-[state=active]:bg-muted">
                  <AlignJustify size={18} />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          {/* Opacity */}
          <div>
            <Label className="text-muted-foreground">Opacity</Label>
            <div className="flex items-center justify-end">
              <small className="p-2">
                {typeof state.editor.selectedElement.styles?.opacity === 'number'
                  ? state.editor.selectedElement.styles?.opacity
                  : parseFloat(
                      (
                        (state.editor.selectedElement.styles?.opacity as string) || '0'
                      ).replace('%', '')
                    ) || 0}
                %
              </small>
            </div>
            <Slider
              onValueChange={(e) => {
                handleOnChanges({
                  target: {
                    id: 'opacity',
                    value: `${e[0]}%`,
                  },
                });
              }}
              defaultValue={[
                typeof state.editor.selectedElement.styles?.opacity === 'number'
                  ? state.editor.selectedElement.styles?.opacity
                  : parseFloat(
                      (
                        (state.editor.selectedElement.styles?.opacity as string) || '0'
                      ).replace('%', '')
                    ) || 0,
              ]}
              max={100}
              step={1}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Dimensions */}
      <AccordionItem value="Dimensions" className="px-6 py-0">
        <AccordionTrigger className="!no-underline">Dimensions</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-2">
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <p className="text-muted-foreground">Height</p>
                <Input
                  id="height"
                  placeholder="px"
                  onChange={handleOnChanges}
                  value={state.editor.selectedElement.styles.height ?? ''}
                />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <p className="text-muted-foreground">Width</p>
                <Input
                  id="width"
                  placeholder="px"
                  onChange={handleOnChanges}
                  value={state.editor.selectedElement.styles.width ?? ''}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <p className="text-muted-foreground">Margin</p>
                <Input
                  id="margin"
                  placeholder="px"
                  onChange={handleOnChanges}
                  value={state.editor.selectedElement.styles.margin ?? ''}
                />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <p className="text-muted-foreground">Padding</p>
                <Input
                  id="padding"
                  placeholder="px"
                  onChange={handleOnChanges}
                  value={state.editor.selectedElement.styles.padding ?? ''}
                />
              </div>
            </div>
            {/* Object Fit */}
            <div className="flex flex-col gap-2">
              <Label className="text-muted-foreground">Object Fit</Label>
              <Tabs
                onValueChange={(e) =>
                  handleOnChanges({ target: { id: 'objectFit', value: e } })
                }
                value={state.editor.selectedElement.styles.objectFit as string}
              >
                <TabsList className="flex items-center flex-row justify-between border-[1px] rounded-md bg-transparent h-fit gap-4">
                  <TabsTrigger value="cover" className="h-10 px-3 data-[state=active]:bg-muted text-xs">
                    Cover
                  </TabsTrigger>
                  <TabsTrigger value="contain" className="h-10 px-3 data-[state=active]:bg-muted text-xs">
                    Contain
                  </TabsTrigger>
                  <TabsTrigger value="fill" className="h-10 px-3 data-[state=active]:bg-muted text-xs">
                    Fill
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-muted-foreground">Overflow</Label>
              <Input
                id="overflow"
                placeholder="visible | hidden | scroll"
                onChange={handleOnChanges}
                value={state.editor.selectedElement.styles.overflow ?? ''}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Decorations */}
      <AccordionItem value="Decorations" className="px-6 py-0">
        <AccordionTrigger className="!no-underline">Decorations</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">Border Radius</Label>
            <div className="flex gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <Input
                  id="borderRadius"
                  placeholder="all"
                  onChange={handleOnChanges}
                  value={state.editor.selectedElement.styles.borderRadius ?? ''}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">Background Color</Label>
            <div className="flex border-[1px] rounded-md overflow-clip">
              <div
                className="w-12"
                style={{
                  backgroundColor:
                    state.editor.selectedElement.styles.backgroundColor,
                }}
              />
              <Input
                placeholder="#HEX"
                className="!border-y-0 rounded-none !border-r-0 mr-2"
                id="backgroundColor"
                onChange={handleOnChanges}
                value={
                  state.editor.selectedElement.styles.backgroundColor ?? ''
                }
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">Background Image</Label>
            <div className="flex border-[1px] rounded-md overflow-clip">
              <div
                className="w-12"
                style={{
                  backgroundImage:
                    state.editor.selectedElement.styles.backgroundImage,
                }}
              />
              <Input
                placeholder="url()"
                className="!border-y-0 rounded-none !border-r-0 mr-2"
                id="backgroundImage"
                onChange={handleOnChanges}
                value={
                  state.editor.selectedElement.styles.backgroundImage ?? ''
                }
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Flexbox */}
      <AccordionItem value="Flexbox" className="px-6 py-0">
        <AccordionTrigger className="!no-underline">Flexbox</AccordionTrigger>
        <AccordionContent>
          <Label className="text-muted-foreground">Justify Content</Label>
          <Tabs
            onValueChange={(e) =>
              handleOnChanges({
                target: {
                  id: 'justifyContent',
                  value: e,
                },
              })
            }
            value={state.editor.selectedElement.styles.justifyContent}
          >
            <TabsList className="flex items-center flex-row justify-between border-[1px] rounded-md bg-transparent h-fit gap-4">
              <TabsTrigger
                value="space-between"
                className="w-10 h-10 p-0 data-[state=active]:bg-muted"
              >
                <AlignHorizontalSpaceBetween size={18} />
              </TabsTrigger>
              <TabsTrigger
                value="space-evenly"
                className="w-10 h-10 p-0 data-[state=active]:bg-muted"
              >
                <AlignHorizontalSpaceAround size={18} />
              </TabsTrigger>
              <TabsTrigger
                value="center"
                className="w-10 h-10 p-0 data-[state=active]:bg-muted"
              >
                <AlignHorizontalJustifyCenter size={18} />
              </TabsTrigger>
              <TabsTrigger
                value="start"
                className="w-10 h-10 p-0 data-[state=active]:bg-muted"
              >
                <AlignHorizontalJustifyStart size={18} />
              </TabsTrigger>
              <TabsTrigger
                value="end"
                className="w-10 h-10 p-0 data-[state=active]:bg-muted"
              >
                <AlignHorizontalJustifyEnd size={18} />
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex flex-col gap-2 mt-4">
            <Label className="text-muted-foreground">Align Items</Label>
            <Tabs
              onValueChange={(e) =>
                handleOnChanges({ target: { id: 'alignItems', value: e } })
              }
              value={state.editor.selectedElement.styles.alignItems}
            >
              <TabsList className="flex items-center flex-row justify-between border-[1px] rounded-md bg-transparent h-fit gap-4">
                <TabsTrigger value="center" className="w-10 h-10 p-0 data-[state=active]:bg-muted">
                  <AlignVerticalJustifyCenter size={18} />
                </TabsTrigger>
                <TabsTrigger value="flex-start" className="w-10 h-10 p-0 data-[state=active]:bg-muted">
                  <AlignVerticalJustifyStart size={18} />
                </TabsTrigger>
                <TabsTrigger value="flex-end" className="w-10 h-10 p-0 data-[state=active]:bg-muted">
                  <AlignVerticalJustifyEnd size={18} />
                </TabsTrigger>
                <TabsTrigger value="stretch" className="w-10 h-10 p-0 data-[state=active]:bg-muted">
                  <ChevronsLeftRight size={18} className="rotate-90" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <Label className="text-muted-foreground">Display</Label>
            <Tabs
              onValueChange={(e) =>
                handleOnChanges({ target: { id: 'display', value: e } })
              }
              value={state.editor.selectedElement.styles.display}
            >
              <TabsList className="flex items-center flex-row justify-between border-[1px] rounded-md bg-transparent h-fit gap-4">
                <TabsTrigger value="flex" className="h-10 px-3 data-[state=active]:bg-muted text-xs">
                  Flex
                </TabsTrigger>
                <TabsTrigger value="grid" className="h-10 px-3 data-[state=active]:bg-muted text-xs">
                  Grid
                </TabsTrigger>
                <TabsTrigger value="block" className="h-10 px-3 data-[state=active]:bg-muted text-xs">
                  Block
                </TabsTrigger>
                <TabsTrigger value="inline-block" className="h-10 px-3 data-[state=active]:bg-muted text-xs">
                  Inline
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <Label className="text-muted-foreground">Flex Direction</Label>
            <Input
              id="flexDirection"
              placeholder="row | column"
              onChange={handleOnChanges}
              value={state.editor.selectedElement.styles.flexDirection ?? ''}
            />
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <Label className="text-muted-foreground">Gap</Label>
            <Input
              id="gap"
              placeholder="px"
              onChange={handleOnChanges}
              value={state.editor.selectedElement.styles.gap ?? ''}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
