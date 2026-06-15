"use client";

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getRoot,
  $getSelection,
  $getNodeByKey,
  $isRangeSelection,
  $setSelection,
  $createRangeSelection,
  PASTE_COMMAND,
  COMMAND_PRIORITY_HIGH,
} from "lexical";
import { $convertFromMarkdownString, TRANSFORMERS } from "@lexical/markdown";

/**
 * Heuristic: treat pasted text as markdown if it contains common markdown patterns.
 * Avoids converting plain paragraphs that happen to contain a single # or -.
 */
function looksLikeMarkdown(text: string): boolean {
  if (!text || text.length < 2) return false;
  const trimmed = text.trim();
  // Headings: # ## ### at start of line
  if (/^#{1,6}\s+/m.test(trimmed)) return true;
  // List: - or * or 1. at start of line
  if (/^[\s]*[-*]\s+/m.test(trimmed) || /^[\s]*\d+\.\s+/m.test(trimmed))
    return true;
  // Block quote
  if (/^>\s+/m.test(trimmed)) return true;
  // Fenced code
  if (/^```[\s\S]*?^```/m.test(trimmed)) return true;
  // Inline/bold/italic/link
  if (/\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__|_[^_]+_/.test(trimmed))
    return true;
  if (/\[[^\]]+\]\([^)]+\)/.test(trimmed)) return true;
  if (/`[^`]+`/.test(trimmed)) return true;
  return false;
}

/**
 * MarkdownPastePlugin: when the user pastes plain text that looks like markdown,
 * convert it to Lexical nodes and insert at the selection (replacing selected content).
 * Uses the same TRANSFORMERS as MarkdownShortcutPlugin for consistency.
 */
export function MarkdownPastePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand<ClipboardEvent | InputEvent | KeyboardEvent>(
      PASTE_COMMAND,
      (event) => {
        if (typeof window === "undefined" || !(event instanceof ClipboardEvent))
          return false;

        const clipboardData = event.clipboardData;
        if (!clipboardData) return false;

        // Prefer plain text so we control conversion; skip if rich HTML is present
        const text = clipboardData.getData("text/plain");
        const html = clipboardData.getData("text/html");
        if (!text || (html && html.trim().length > 0)) return false;

        if (!looksLikeMarkdown(text)) return false;

        event.preventDefault();

        editor.update(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;

          // 1. Remove selected content (paste replaces selection)
          selection.removeText();

          // 2. Save insert point (where to insert converted nodes)
          const insertKey = selection.focus.key;
          const insertOffset = selection.focus.offset;
          const pointType = selection.focus.type;

          // 3. Use root as temp: save current children, clear, convert pasted text, take new children
          const root = $getRoot();
          const previousChildren = root.getChildren();

          root.clear();
          $convertFromMarkdownString(text, TRANSFORMERS);

          const pastedNodes = root.getChildren();

          // 4. Restore root with original content
          root.clear();
          previousChildren.forEach((child) => root.append(child));

          // 5. Restore selection at insert point and insert converted nodes
          const insertNode = $getNodeByKey(insertKey);
          if (!insertNode || !insertNode.isAttached()) return;

          const newSelection = $createRangeSelection();
          newSelection.anchor.set(insertKey, insertOffset, pointType);
          newSelection.focus.set(insertKey, insertOffset, pointType);
          $setSelection(newSelection);
          newSelection.insertNodes(pastedNodes);
        });

        return true;
      },
      COMMAND_PRIORITY_HIGH
    );
  }, [editor]);

  return null;
}
