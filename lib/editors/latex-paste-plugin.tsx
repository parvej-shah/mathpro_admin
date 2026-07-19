"use client";

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  PASTE_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
} from "lexical";
import { looksLikeBareLaTeX, stripMathDelimiters } from "./latex-plugin";

/**
 * LaTeXPastePlugin: authors copy raw LaTeX out of an LLM (e.g. the "copy" button
 * on a ChatGPT LaTeX block), which arrives with no math delimiters. Without
 * wrapping, it renders as literal backslash text.
 *
 * Runs at CRITICAL priority so it resolves before MarkdownPastePlugin, whose
 * italic heuristic (`_..._`) otherwise claims subscript-heavy expressions such
 * as `\sum_{i=1}^{N}` and converts them to emphasis.
 */
export function LaTeXPastePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand<ClipboardEvent | InputEvent | KeyboardEvent>(
      PASTE_COMMAND,
      (event) => {
        if (typeof window === "undefined" || !(event instanceof ClipboardEvent))
          return false;

        const clipboardData = event.clipboardData;
        if (!clipboardData) return false;

        const text = clipboardData.getData("text/plain");
        if (!text) return false;

        // Rich HTML paste carries its own formatting; leave it to Lexical.
        const html = clipboardData.getData("text/html");
        if (html && html.trim().length > 0) return false;

        if (!looksLikeBareLaTeX(text)) return false;

        event.preventDefault();

        // Multi-line pastes render as one block equation; a single line stays inline.
        const normalized = stripMathDelimiters(text);
        const isMultiline = /\n/.test(normalized);
        const equation = isMultiline
          ? `$$${normalized}$$`
          : `$${normalized}$`;

        editor.update(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;
          selection.insertText(equation);
        });

        return true;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor]);

  return null;
}
