"use client";

import { useCallback } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";

type Props = {
  initialContent?: string;
  onChange: (html: string) => void;
  editable?: boolean;
};

export default function RichTextEditor({ initialContent, onChange, editable = true }: Props) {
  const editor = useCreateBlockNote({
    initialContent: initialContent ? parseContent(initialContent) : undefined,
  });

  const handleChange = useCallback(async () => {
    const html = await editor.blocksToHTMLLossy(editor.document);
    onChange(html);
  }, [editor, onChange]);

  return (
    <BlockNoteView
      editor={editor}
      editable={editable}
      onChange={handleChange}
      theme="dark"
      data-theming-css-variables-demo
    />
  );
}

function parseContent(content: string) {
  try {
    return JSON.parse(content);
  } catch {
    return undefined;
  }
}
