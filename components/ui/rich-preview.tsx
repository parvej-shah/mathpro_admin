"use client";

import { useEffect, useRef } from "react";
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

  // Render $...$ / $$...$$ with KaTeX after the sanitized HTML is in the DOM.
  useEffect(() => {
    renderLatexInElement(contentRef.current);
  }, [processed]);

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
        dangerouslySetInnerHTML={{ __html: processed }}
      />
    </div>
  );
}
