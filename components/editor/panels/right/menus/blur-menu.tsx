"use client";

import { Section, type StyleProps } from "../shared";
import { N } from "./measures-menu";
import { TooltipProvider } from "@/components/ui/tooltip";

export function BlurMenu({ get, set }: StyleProps) {
  return (
    <TooltipProvider delayDuration={200}>
    <Section title="Blur" icon="blur_on" defaultOpen={false}>
      <N icon="B" value={get("filter")?.replace("blur(", "").replace(")", "") || ""} onChange={(v) => set("filter", v ? `blur(${v})` : "")} placeholder="0px" tip="Blur amount" />
    </Section>
    </TooltipProvider>
  );
}
