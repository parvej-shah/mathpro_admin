"use client";

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import katex from "katex";
import "katex/dist/katex.min.css";

/**
 * LaTeX Plugin for Lexical Editor
 * Renders LaTeX equations in the editor using KaTeX
 * Supports inline equations: $x^2 + 5x + 6 = 0$
 * Supports block equations: $$\int_0^1 x^2 dx$$
 */
export function LaTeXPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Render LaTeX after DOM updates
    const renderLaTeX = () => {
      const editorElement = editor.getRootElement();
      if (!editorElement) return;

      // Find and render LaTeX expressions
      const textNodes: Node[] = [];
      const walker = document.createTreeWalker(
        editorElement,
        NodeFilter.SHOW_TEXT,
        null
      );

      let node;
      while ((node = walker.nextNode())) {
        textNodes.push(node);
      }

      // Process text nodes for LaTeX
      textNodes.forEach((textNode) => {
        const text = textNode.textContent || "";
        const parent = textNode.parentElement;

        // Skip if already processed or is a KaTeX element
        if (
          parent?.classList.contains("katex") ||
          parent?.classList.contains("katex-rendered")
        ) {
          return;
        }

        // Inline math: $...$ (not $$)
        const inlineRegex = /(?<!\$)\$([^$\n]+?)\$(?!\$)/g;
        // Block math: $$...$$
        const blockRegex = /\$\$([^$]+?)\$\$/g;

        let hasLaTeX = false;
        const fragments: Array<{
          type: "text" | "inline" | "block";
          content: string;
        }> = [];
        let lastIndex = 0;

        // Process block equations first (they take precedence)
        let match: RegExpExecArray | null;
        const blockMatches: Array<{
          start: number;
          end: number;
          latex: string;
        }> = [];
        while ((match = blockRegex.exec(text)) !== null) {
          blockMatches.push({
            start: match.index,
            end: match.index + match[0].length,
            latex: match[1],
          });
          hasLaTeX = true;
        }

        // Process inline equations (avoid overlapping with block)
        const inlineMatches: Array<{
          start: number;
          end: number;
          latex: string;
        }> = [];
        inlineRegex.lastIndex = 0; // Reset regex
        while ((match = inlineRegex.exec(text)) !== null) {
          // Check if this inline match overlaps with any block match
          const overlaps = blockMatches.some(
            (bm) =>
              match &&
              match.index < bm.end &&
              match.index + match[0].length > bm.start
          );
          if (!overlaps && match) {
            inlineMatches.push({
              start: match.index,
              end: match.index + match[0].length,
              latex: match[1],
            });
            hasLaTeX = true;
          }
        }

        // Combine and sort all matches
        const allMatches = [
          ...blockMatches.map((m) => ({ ...m, type: "block" as const })),
          ...inlineMatches.map((m) => ({ ...m, type: "inline" as const })),
        ].sort((a, b) => a.start - b.start);

        if (hasLaTeX && allMatches.length > 0) {
          // Create document fragment with rendered LaTeX
          const fragment = document.createDocumentFragment();

          allMatches.forEach((match, idx) => {
            // Add text before match
            if (match.start > lastIndex) {
              const textBefore = document.createTextNode(
                text.slice(lastIndex, match.start)
              );
              fragment.appendChild(textBefore);
            }

            // Render LaTeX
            try {
              const span = document.createElement("span");
              span.className = "katex-rendered";
              span.setAttribute("data-latex", match.latex);
              span.setAttribute(
                "data-display",
                match.type === "block" ? "true" : "false"
              );

              katex.render(match.latex, span, {
                throwOnError: false,
                displayMode: match.type === "block",
              });

              fragment.appendChild(span);
            } catch (e) {
              console.error("LaTeX rendering error:", e);
              // Fallback to plain text
              const fallback = document.createTextNode(`$${match.latex}$`);
              fragment.appendChild(fallback);
            }

            lastIndex = match.end;

            // Add text after last match
            if (idx === allMatches.length - 1 && lastIndex < text.length) {
              const textAfter = document.createTextNode(text.slice(lastIndex));
              fragment.appendChild(textAfter);
            }
          });

          // Replace text node with fragment
          if (fragment.childNodes.length > 0) {
            textNode.parentNode?.replaceChild(fragment, textNode);
          }
        }
      });
    };

    // Render LaTeX on editor updates
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        // Use setTimeout to ensure DOM is updated
        setTimeout(renderLaTeX, 100);
      });
    });
  }, [editor]);

  return null;
}

/**
 * Helper function to insert LaTeX equation
 */
export function insertLaTeXEquation(
  editor: any,
  latex: string,
  displayMode: boolean = false
) {
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const equation = displayMode ? `$$${latex}$$` : `$${latex}$`;
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
