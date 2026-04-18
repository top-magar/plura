"use client";

import { useMemo, useCallback } from "react";
import {
  useCreateBlockNote,
  type SuggestionMenuController,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { filterSuggestionItems } from "@blocknote/core";
import "@blocknote/shadcn/style.css";

type Props = {
  initialContent?: string;
  onChange: (content: string) => void;
  editable?: boolean;
  minimal?: boolean;
};

export default function RichTextEditor({ initialContent, onChange, editable = true, minimal = false }: Props) {
  const parsed = useMemo(() => {
    if (!initialContent) return undefined;
    // If it's BlockNote JSON, parse it. If it's plain text, wrap it.
    try {
      const data = JSON.parse(initialContent);
      if (Array.isArray(data)) return data;
    } catch {
      // Not JSON — treat as plain text or HTML
    }
    return undefined;
  }, [initialContent]);

  const editor = useCreateBlockNote({
    initialContent: parsed,
    domAttributes: {
      editor: {
        class: "plura-editor",
      },
    },
  });

  const handleChange = useCallback(async () => {
    // Save as BlockNote JSON for lossless round-trip
    const json = JSON.stringify(editor.document);
    onChange(json);
  }, [editor, onChange]);

  return (
    <>
      <style>{`
        .plura-editor {
          font-family: inherit;
          font-size: inherit;
          color: inherit;
          line-height: inherit;
        }
        .plura-editor .bn-editor {
          padding: 0;
          background: transparent;
        }
        .plura-editor .bn-block-group {
          padding: 0;
        }
        .plura-editor [data-content-type] {
          padding: 2px 0;
        }
        ${minimal ? `
        .plura-editor .bn-side-menu,
        .plura-editor .bn-drag-handle-menu {
          display: none;
        }
        ` : ""}
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
    </>
  );
}

// Read-only renderer for preview/live mode
export function RichTextRenderer({ content }: { content: string }) {
  const parsed = useMemo(() => {
    try {
      const data = JSON.parse(content);
      if (Array.isArray(data)) return data;
    } catch {
      // Not JSON
    }
    return null;
  }, [content]);

  const editor = useCreateBlockNote({
    initialContent: parsed || undefined,
  });

  if (!parsed) {
    // Fallback: render as raw HTML (legacy content)
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  }

  return (
    <>
      <style>{`
        .plura-renderer .bn-editor { padding: 0; background: transparent; }
        .plura-renderer .bn-block-group { padding: 0; }
        .plura-renderer .bn-side-menu,
        .plura-renderer .bn-drag-handle-menu { display: none; }
        .plura-renderer [data-content-type] { padding: 2px 0; }
      `}</style>
      <div className="plura-renderer">
        <BlockNoteView editor={editor} editable={false} theme="dark" sideMenu={false} />
      </div>
    </>
  );
}
