"use client";

import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { sanitizeHtmlContent } from "@/lib/helpers";
import { renderLatexInElement } from "@/lib/editors/render-latex-in-element";
import { Eye } from "lucide-react";

function markdownImagesToHtml(html: string): string {
  return html.replace(
    /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g,
    '<img src="$2" alt="$1" />'
  );
}

interface RichPreviewProps {
  html: string;
  label?: string;
  className?: string;
  imgMaxHeight?: string;
}

export function RichPreview({
  html,
  label = "Preview",
  className,
  imgMaxHeight = "[&_img]:max-h-40",
}: RichPreviewProps) {
  const processed = markdownImagesToHtml(sanitizeHtmlContent(html));
  const isEmpty = !processed || processed === "<p></p>" || processed.trim() === "";
  const contentRef = useRef<HTMLDivElement>(null);

  // Own the container's content outright rather than pairing
  // dangerouslySetInnerHTML with a post-render KaTeX pass.
  //
  // KaTeX rendering mutates the DOM, so the markup no longer matches the `processed`
  // string React thinks it wrote. React then skips re-applying identical HTML while
  // the effect skips re-rendering unchanged `processed` — leaving the preview stuck
  // on raw `$...$` until an unrelated edit knocked it loose. Re-seeding the HTML on
  // every commit makes the pass idempotent, and useLayoutEffect runs it before paint
  // so raw LaTeX never flashes.
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    el.innerHTML = processed;
    renderLatexInElement(el);
  });

  if (isEmpty) return null;

  return (
    <div className={cn("rounded-lg border bg-muted/30 p-4", className)}>
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Eye className="h-3.5 w-3.5" />
        {label}
      </div>
      <div
        ref={contentRef}
        className={cn(
          "prose prose-sm dark:prose-invert max-w-none [&_img]:rounded-md",
          imgMaxHeight
        )}
      />
    </div>
  );
}
