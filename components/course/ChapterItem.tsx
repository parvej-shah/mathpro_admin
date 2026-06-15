"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Button } from "@/components/ui/button";
import { ModuleList } from "./ModuleList";
import { Plus, Pencil, Trash2, ChevronDown } from "lucide-react";
import { useCourseStore } from "@/lib/stores/course-store";
import type { Chapter } from "@/types";
import { cn } from "@/lib/utils";

interface ChapterItemProps {
  chapter: Chapter;
  courseId: number;
  onAddModule?: (chapterId: number) => void;
  onEditChapter?: (chapterId: number) => void;
  onDeleteChapter?: (chapterId: number) => void;
  onDeleteModule?: (moduleId: number) => void;
}

/**
 * Chapter Item Component
 * Collapsible chapter card with a smooth accordion and modules.
 */
export function ChapterItem({
  chapter,
  courseId,
  onAddModule,
  onEditChapter,
  onDeleteChapter,
  onDeleteModule,
}: ChapterItemProps) {
  const { expandedChapters, toggleChapter } = useCourseStore();
  const isExpanded = expandedChapters.has(chapter.id);
  const moduleCount = chapter.modules?.length ?? 0;

  return (
    <div
      className={cn(
        "group/chapter rounded-xl border bg-card transition-all duration-200",
        isExpanded
          ? "border-primary/30 shadow-sm"
          : "hover:border-primary/20 hover:shadow-sm"
      )}
    >
      <Accordion
        type="single"
        collapsible
        value={isExpanded ? "open" : ""}
        onValueChange={() => toggleChapter(chapter.id)}
      >
        <AccordionItem value="open" className="border-none">
          <AccordionPrimitive.Header className="flex">
            <div className="flex w-full items-center gap-3 px-3 py-3 sm:px-4">
              {/* Trigger: serial + title + meta */}
              <AccordionPrimitive.Trigger
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left outline-none"
              >
                <span
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm font-bold transition-colors",
                    isExpanded
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground group-hover/chapter:bg-primary/10 group-hover/chapter:text-primary"
                  )}
                >
                  {chapter.serial}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-[15px] font-semibold leading-tight">
                      {chapter.title}
                    </h3>
                    {/* status dots */}
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                        chapter.is_live
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          chapter.is_live
                            ? "bg-success"
                            : "bg-muted-foreground/40"
                        )}
                      />
                      {chapter.is_live ? "Live" : "Draft"}
                    </span>
                    {chapter.is_free && (
                      <span className="shrink-0 rounded-full bg-info/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-info">
                        Free
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {moduleCount} {moduleCount === 1 ? "module" : "modules"}
                  </p>
                </div>

                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                    isExpanded && "rotate-180"
                  )}
                />
              </AccordionPrimitive.Trigger>

              {/* Actions — subtle until hover */}
              <div className="flex shrink-0 items-center gap-0.5 opacity-60 transition-opacity group-hover/chapter:opacity-100">
                {onAddModule && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Add module"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddModule(chapter.id);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
                {onEditChapter && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Edit chapter"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditChapter(chapter.id);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {onDeleteChapter && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    title="Delete chapter"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChapter(chapter.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </AccordionPrimitive.Header>

          <AccordionContent className="px-3 pb-3 pt-0 sm:px-4">
            <div className="border-t pt-3">
              {moduleCount > 0 ? (
                <ModuleList
                  modules={chapter.modules!}
                  chapterId={chapter.id}
                  courseId={courseId}
                  onDeleteModule={onDeleteModule}
                />
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No modules in this chapter yet.
                  </p>
                  {onAddModule && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => onAddModule(chapter.id)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add module
                    </Button>
                  )}
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
