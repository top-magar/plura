"use client";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useEditor } from "./provider";

const typographyProps = ["fontSize", "fontWeight", "fontFamily", "color", "textAlign", "lineHeight", "letterSpacing"];
const spacingProps = ["padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "margin", "marginTop", "marginRight", "marginBottom", "marginLeft"];
const sizeProps = ["width", "height", "minHeight", "maxWidth"];
const backgroundProps = ["backgroundColor", "backgroundImage", "backgroundSize", "backgroundPosition"];
const borderProps = ["borderRadius", "borderWidth", "borderColor", "borderStyle"];
const layoutProps = ["display", "flexDirection", "justifyContent", "alignItems", "gap", "opacity"];

function PropGroup({ title, props }: { title: string; props: string[] }) {
  const { state, dispatch } = useEditor();
  const el = state.editor.selectedElement;
  if (!el) return null;

  const handleChange = (prop: string, value: string) => {
    dispatch({
      type: "UPDATE_ELEMENT",
      payload: {
        elementDetails: {
          ...el,
          styles: { ...el.styles, [prop]: value },
        },
      },
    });
  };

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="grid grid-cols-2 gap-1.5">
        {props.map((prop) => (
          <div key={prop} className="space-y-0.5">
            <label className="text-[10px] text-muted-foreground">{prop.replace(/([A-Z])/g, " $1").trim()}</label>
            <Input
              value={el.styles[prop] || ""}
              onChange={(e) => handleChange(prop, e.target.value)}
              className="h-7 text-[11px]"
              placeholder="—"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentEditor() {
  const { state, dispatch } = useEditor();
  const el = state.editor.selectedElement;
  if (!el) return null;

  const content = el.content as Record<string, string> | undefined;
  if (Array.isArray(el.content) || !content) return null;

  const handleChange = (key: string, value: string) => {
    dispatch({
      type: "UPDATE_ELEMENT",
      payload: { elementDetails: { ...el, content: { ...content, [key]: value } } },
    });
  };

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Content</p>
      {content.innerText !== undefined && (
        <div className="space-y-0.5">
          <label className="text-[10px] text-muted-foreground">Text</label>
          <Input value={content.innerText} onChange={(e) => handleChange("innerText", e.target.value)} className="h-7 text-[11px]" />
        </div>
      )}
      {content.href !== undefined && (
        <div className="space-y-0.5">
          <label className="text-[10px] text-muted-foreground">URL</label>
          <Input value={content.href} onChange={(e) => handleChange("href", e.target.value)} className="h-7 text-[11px]" />
        </div>
      )}
      {content.src !== undefined && (
        <div className="space-y-0.5">
          <label className="text-[10px] text-muted-foreground">Source URL</label>
          <Input value={content.src} onChange={(e) => handleChange("src", e.target.value)} className="h-7 text-[11px]" />
        </div>
      )}
    </div>
  );
}

export default function PropertiesPanel() {
  const { state } = useEditor();
  const el = state.editor.selectedElement;

  if (state.editor.previewMode) return null;

  return (
    <div className="flex h-full w-[260px] shrink-0 flex-col border-l bg-background">
      <div className="border-b px-3 py-2">
        <p className="text-[12px] font-medium">{el ? el.name : "Properties"}</p>
        <p className="text-[10px] text-muted-foreground">{el ? `Type: ${el.type}` : "Select an element"}</p>
      </div>

      {el ? (
        <ScrollArea className="flex-1 p-3">
          <div className="space-y-4">
            <ContentEditor />
            {el.type !== "__body" && <Separator />}
            <PropGroup title="Typography" props={typographyProps} />
            <Separator />
            <PropGroup title="Spacing" props={spacingProps} />
            <Separator />
            <PropGroup title="Size" props={sizeProps} />
            <Separator />
            <PropGroup title="Background" props={backgroundProps} />
            <Separator />
            <PropGroup title="Border" props={borderProps} />
            <Separator />
            <PropGroup title="Layout" props={layoutProps} />
          </div>
        </ScrollArea>
      ) : (
        <div className="flex flex-1 items-center justify-center p-4 text-center text-[12px] text-muted-foreground">
          Click an element on the canvas to edit its properties
        </div>
      )}
    </div>
  );
}
