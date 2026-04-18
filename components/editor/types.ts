import type { CSSProperties } from "react";

export type El = {
  id: string;
  type: string;
  name: string;
  styles: CSSProperties;
  content: El[] | Record<string, string>;
};

export type Device = "Desktop" | "Tablet" | "Mobile";

export type EditorProps = {
  pageId: string;
  pageName: string;
  funnelId: string;
  subAccountId: string;
  agencyId: string;
  initialContent: string | null;
};
