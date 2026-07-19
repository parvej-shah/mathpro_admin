import katex from "katex";
import "katex/dist/katex.min.css";

/**
 * Walks a container's text nodes and replaces $...$ / $$...$$ segments with
 * KaTeX-rendered markup.
 *
 * Only safe on static, React-rendered containers. Do NOT point this at a
 * Lexical contenteditable: Lexical owns and reconciles that DOM, and replacing
 * its text nodes corrupts the editor content.
 *
 * Mirrors MathPro_Frontend's SafeHtmlRenderer so authoring previews and the
 * student-facing render agree on delimiter syntax.
 */
export function renderLatexInElement(root: HTMLElement | null) {
  if (!root) return;

  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    textNodes.push(node as Text);
  }

  textNodes.forEach((textNode) => {
    const text = textNode.textContent || "";
    if (!text.includes("$")) return;

    const parent = textNode.parentElement;
    if (
      parent?.classList.contains("katex") ||
      parent?.classList.contains("katex-rendered")
    ) {
      return;
    }

    const inlineRegex = /(?<!\$)\$([^$]+?)\$(?!\$)/g;
    const blockRegex = /\$\$([^$]+?)\$\$/g;

    const blockMatches: Array<{ start: number; end: number; latex: string }> =
      [];
    let match: RegExpExecArray | null;
    while ((match = blockRegex.exec(text)) !== null) {
      blockMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        latex: match[1],
      });
    }

    const inlineMatches: Array<{ start: number; end: number; latex: string }> =
      [];
    inlineRegex.lastIndex = 0;
    while ((match = inlineRegex.exec(text)) !== null) {
      const overlaps = blockMatches.some(
        (bm) =>
          match && match.index < bm.end && match.index + match[0].length > bm.start
      );
      if (!overlaps) {
        inlineMatches.push({
          start: match.index,
          end: match.index + match[0].length,
          latex: match[1],
        });
      }
    }

    const allMatches = [
      ...blockMatches.map((m) => ({ ...m, type: "block" as const })),
      ...inlineMatches.map((m) => ({ ...m, type: "inline" as const })),
    ].sort((a, b) => a.start - b.start);

    if (allMatches.length === 0) return;

    const fragment = document.createDocumentFragment();
    let lastIndex = 0;

    allMatches.forEach((m, idx) => {
      if (m.start > lastIndex) {
        fragment.appendChild(
          document.createTextNode(text.slice(lastIndex, m.start))
        );
      }

      try {
        const span = document.createElement("span");
        span.className = "katex-rendered";
        katex.render(m.latex, span, {
          throwOnError: false,
          displayMode: m.type === "block",
        });
        fragment.appendChild(span);
      } catch {
        fragment.appendChild(
          document.createTextNode(text.slice(m.start, m.end))
        );
      }

      lastIndex = m.end;

      if (idx === allMatches.length - 1 && lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
      }
    });

    textNode.parentNode?.replaceChild(fragment, textNode);
  });
}
