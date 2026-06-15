"use client";

import { ChapterItem } from "./ChapterItem";
import type { Chapter } from "@/types";

interface ChapterListProps {
  chapters: Chapter[];
  courseId: number;
  onAddModule?: (chapterId: number) => void;
  onEditChapter?: (chapterId: number) => void;
  onDeleteChapter?: (chapterId: number) => void;
  onDeleteModule?: (moduleId: number) => void;
}

/**
 * Chapter List Component
 * Renders list of chapters
 */
export function ChapterList({
  chapters,
  courseId,
  onAddModule,
  onEditChapter,
  onDeleteChapter,
  onDeleteModule,
}: ChapterListProps) {
  if (!chapters || chapters.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No chapters yet. Click "Add Chapter" to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {chapters.map((chapter) => (
        <ChapterItem
          key={chapter.id}
          chapter={chapter}
          courseId={courseId}
          onAddModule={onAddModule}
          onEditChapter={onEditChapter}
          onDeleteChapter={onDeleteChapter}
          onDeleteModule={onDeleteModule}
        />
      ))}
    </div>
  );
}
