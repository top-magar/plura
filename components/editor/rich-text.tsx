"use client";

import { useMemo, useCallback } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";

type Props = {
  initialContent?: string;
  onChange: (content: string) => void;
  editable?: boolean;
  minimal?: boolean;
};

export default function RichTextEditor({ initialContent, onChange, editable = true, minimal = false }: Props) {
  const parsed = useMemo(() => {
    if (!initialContent || initialContent.trim() === "") return undefined;
    try {
      const data = JSON.parse(initialContent);
      if (Array.isArray(data) && data.length > 0) return data;
    } catch {
      // Plain text — don't pass to BlockNote, let it start fresh
    }
    return undefined;
  }, [initialContent]);

  const editor = useCreateBlockNote({
    initialContent: parsed,
    domAttributes: { editor: { class: "plura-editor" } },
  });

  const handleChange = useCallback(async () => {
    const json = JSON.stringify(editor.document);
    onChange(json);
  }, [editor, onChange]);

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <style>{`
        .plura-editor { font-family: inherit; color: inherit; }
        .plura-editor .bn-editor { padding: 4px 0; background: transparent; }
        .plura-editor .bn-block-group { padding: 0; }
        .plura-editor [data-content-type] { padding: 1px 0; }
        ${minimal ? `.plura-editor .bn-side-menu, .plura-editor .bn-drag-handle-menu { display: none; }` : ""}
      `}</style>
      <BlockNoteView
        editor={editor}
        editable={editable}
        onChange={handleChange}
        theme="dark"
        sideMenu={!minimal}
        formattingToolbar
        slashMenu={!minimal}
      />
    </div>
  );
}

export function RichTextRenderer({ content }: { content: string }) {
  const parsed = useMemo(() => {
    if (!content || content.trim() === "") return null;
    try {
      const data = JSON.parse(content);
      if (Array.isArray(data) && data.length > 0) return data;
    } catch {
      // Not JSON — it's legacy HTML or plain text
    }
    return null;
  }, [content]);

  const editor = useCreateBlockNote({
    initialContent: parsed || undefined,
  });

  if (!parsed) {
    if (content.startsWith("<")) {
      return <div dangerouslySetInnerHTML={{ __html: content }} />;
    }
    return <p>{content}</p>;
  }

  return (
    <div className="plura-renderer" onClick={(e) => e.stopPropagation()}>
      <style>{`
        .plura-renderer .bn-editor { padding: 0; background: transparent; }
        .plura-renderer .bn-block-group { padding: 0; }
        .plura-renderer .bn-side-menu, .plura-renderer .bn-drag-handle-menu { display: none; }
        .plura-renderer [data-content-type] { padding: 1px 0; }
      `}</style>
      <BlockNoteView editor={editor} editable={false} theme="dark" sideMenu={false} />
    </div>
  );
}
