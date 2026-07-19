"use client";

import { $getSelection, $isRangeSelection } from "lexical";

/**
 * Equations are stored as `$...$` / `$$...$$` source text inside the editor and
 * rendered by RichPreview (and MathPro_Frontend's SafeHtmlRenderer) at display
 * time.
 *
 * A previous version walked the editor DOM and swapped text nodes for KaTeX
 * markup. That DOM is owned by Lexical's reconciler, so the injected spans were
 * clobbered on the next update and the surrounding `$` delimiters were lost,
 * corrupting saved content. Rendering only happens outside the editor now.
 */

/**
 * Strips wrapping math delimiters from a LaTeX string.
 * LLM output is often pasted with delimiters already attached ($...$, $$...$$,
 * \(...\), \[...\]); without stripping, re-wrapping produces broken markup.
 */
export function stripMathDelimiters(input: string): string {
  const text = input.trim();
  const pairs: Array<[string, string]> = [
    ["$$", "$$"],
    ["\\[", "\\]"],
    ["\\(", "\\)"],
    ["$", "$"],
  ];

  for (const [open, close] of pairs) {
    if (
      text.length > open.length + close.length &&
      text.startsWith(open) &&
      text.endsWith(close)
    ) {
      const inner = text.slice(open.length, text.length - close.length);
      // Only strip when the delimiters actually wrap the whole expression.
      if (!inner.includes(open) && !inner.includes(close)) {
        return inner.trim();
      }
    }
  }

  return text;
}

// Math constructs that mark a string as LaTeX rather than prose.
const LATEX_COMMAND_REGEX = /\\(?:[a-zA-Z]+|[\\{}$&#_%,;!])/;
const MATH_SHAPE_REGEX = /[_^]\{|[_^][0-9a-zA-Z]/;

/**
 * Returns true when pasted text looks like a standalone LaTeX expression.
 *
 * Deliberately conservative: prose containing math is left alone, because
 * auto-wrapping math inside sentences produces false positives. Authors use
 * the equation dialog for mixed content.
 */
export function looksLikeBareLaTeX(input: string): boolean {
  const text = input.trim();
  if (!text) return false;

  // Already delimited — the existing render pipeline handles it.
  if (/\$/.test(text)) return false;

  if (!LATEX_COMMAND_REGEX.test(text) && !MATH_SHAPE_REGEX.test(text)) {
    return false;
  }

  // Reject prose: sequences of ordinary words outside of any math command.
  const withoutCommands = text
    .replace(/\\[a-zA-Z]+/g, " ")
    .replace(/[{}^_$\\]/g, " ");
  const words = withoutCommands.match(/[a-zA-Z]{2,}/g) ?? [];
  if (words.length >= 3) return false;

  return true;
}

/**
 * Helper function to insert LaTeX equation
 */
export function insertLaTeXEquation(
  editor: any,
  latex: string,
  displayMode: boolean = false
) {
  const normalized = stripMathDelimiters(latex);
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const equation = displayMode ? `$$${normalized}$$` : `$${normalized}$`;
      selection.insertText(equation);
    }
  });
}

/**
 * Helper function to extract plain text from HTML
 */
export function extractTextFromHTML(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

/**
 * Helper function to extract LaTeX from HTML
 * Converts rendered KaTeX back to LaTeX syntax
 */
export function extractLaTeXFromHTML(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const katexElements = doc.querySelectorAll(".katex-rendered");

  katexElements.forEach((el) => {
    const latex = el.getAttribute("data-latex");
    const isDisplay = el.getAttribute("data-display") === "true";
    if (latex) {
      const replacement = isDisplay ? `$$${latex}$$` : `$${latex}$`;
      el.outerHTML = replacement;
    }
  });

  return doc.body.innerHTML;
}
