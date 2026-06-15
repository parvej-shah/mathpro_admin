import type { CourseWithChapters, Chapter, Module } from "@/types";

/**
 * Serialization Utilities
 * Handles module serialization within chapters
 */

/**
 * Recalculate all module serials globally across all chapters
 * Ensures sequential numbering: 1, 2, 3... N regardless of chapter
 */
export function recalculateAllModuleSerials(
  course: CourseWithChapters
): CourseWithChapters {
  const newChapters = [...(course.chapters || [])];
  let globalSerial = 1;

  // Sort chapters by their serial to maintain order
  const sortedChapters = [...newChapters].sort((a, b) => {
    return (a.serial || 0) - (b.serial || 0);
  });

  // Assign global serials to all modules
  sortedChapters.forEach((chapter) => {
    if (chapter.modules && chapter.modules.length > 0) {
      chapter.modules.forEach((module) => {
        module.serial = globalSerial++;
      });
    }
  });

  return {
    ...course,
    chapters: newChapters,
  };
}

/**
 * Reorder modules within a chapter and update serials globally
 * Serials are sequential across all chapters (1, 2, 3... N)
 */
export function reorderModulesInChapter(
  course: CourseWithChapters,
  chapterId: number,
  sourceIndex: number,
  destinationIndex: number
): CourseWithChapters {
  const newChapters = [...(course.chapters || [])];
  
  // Find the chapter
  const chapterIndex = newChapters.findIndex((ch) => ch.id === chapterId);
  if (chapterIndex === -1) {
    return course;
  }

  const chapter = newChapters[chapterIndex];
  if (!chapter.modules || chapter.modules.length === 0) {
    return course;
  }

  // Reorder modules within the chapter
  const newModules = [...chapter.modules];
  const [movedModule] = newModules.splice(sourceIndex, 1);
  newModules.splice(destinationIndex, 0, movedModule);

  // Update the chapter's modules
  chapter.modules = newModules;

  // Recalculate ALL module serials globally
  return recalculateAllModuleSerials({
    ...course,
    chapters: newChapters,
  });
}

/**
 * Move module from one chapter to another
 * Updates serials in both chapters
 */
export function moveModuleBetweenChapters(
  course: CourseWithChapters,
  moduleId: number,
  sourceChapterId: number,
  destinationChapterId: number,
  destinationIndex: number
): CourseWithChapters {
  const newChapters = [...(course.chapters || [])];

  // Find source and destination chapters
  const sourceChapterIndex = newChapters.findIndex(
    (ch) => ch.id === sourceChapterId
  );
  const destinationChapterIndex = newChapters.findIndex(
    (ch) => ch.id === destinationChapterId
  );

  if (sourceChapterIndex === -1 || destinationChapterIndex === -1) {
    return course;
  }

  const sourceChapter = newChapters[sourceChapterIndex];
  const destinationChapter = newChapters[destinationChapterIndex];

  if (!sourceChapter.modules || !destinationChapter.modules) {
    return course;
  }

  // Find and remove module from source chapter
  const moduleIndex = sourceChapter.modules.findIndex(
    (m) => m.id === moduleId
  );
  if (moduleIndex === -1) {
    return course;
  }

  const [movedModule] = sourceChapter.modules.splice(moduleIndex, 1);

  // Update module's chapter_id
  movedModule.chapter_id = destinationChapterId;

  // Insert into destination chapter
  destinationChapter.modules.splice(destinationIndex, 0, movedModule);

  // Recalculate ALL module serials globally after move
  return recalculateAllModuleSerials({
    ...course,
    chapters: newChapters,
  });
}

/**
 * Validate module serials within a chapter
 * Returns true if serials are sequential and unique
 */
export function validateChapterSerials(chapter: Chapter): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!chapter.modules || chapter.modules.length === 0) {
    return { valid: true, errors: [] };
  }

  const serials = chapter.modules.map((m) => m.serial).filter((s) => s != null);
  const uniqueSerials = new Set(serials);

  // Check for duplicates
  if (serials.length !== uniqueSerials.size) {
    errors.push(`Chapter ${chapter.id}: Duplicate serial numbers found`);
  }

  // Check if serials are sequential (1, 2, 3, ...)
  const sortedSerials = [...serials].sort((a, b) => a - b);
  for (let i = 0; i < sortedSerials.length; i++) {
    if (sortedSerials[i] !== i + 1) {
      errors.push(
        `Chapter ${chapter.id}: Serials are not sequential. Expected ${i + 1}, found ${sortedSerials[i]}`
      );
      break;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Auto-fix module serials in a chapter
 * Makes serials sequential (1, 2, 3, ...) based on current order
 */
export function autoFixChapterSerials(chapter: Chapter): Chapter {
  if (!chapter.modules || chapter.modules.length === 0) {
    return chapter;
  }

  // Sort modules by current serial (or keep current order)
  const sortedModules = [...chapter.modules].sort((a, b) => {
    if (a.serial == null && b.serial == null) return 0;
    if (a.serial == null) return 1;
    if (b.serial == null) return -1;
    return a.serial - b.serial;
  });

  // Assign sequential serials
  sortedModules.forEach((module, index) => {
    module.serial = index + 1;
  });

  return {
    ...chapter,
    modules: sortedModules,
  };
}

/**
 * Prepare course data for API update
 * Ensures all serials are valid before sending
 */
export function prepareCourseForUpdate(
  course: CourseWithChapters
): CourseWithChapters {
  const newChapters = (course.chapters || []).map((chapter) => {
    // Auto-fix serials in each chapter
    return autoFixChapterSerials(chapter);
  });

  return {
    ...course,
    chapters: newChapters,
  };
}
