"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChapterList } from "./ChapterList";
import type { CourseWithChapters, Chapter, Module } from "@/types";
import { useState } from "react";
import { GripVertical } from "lucide-react";

interface CourseBuilderProps {
  course: CourseWithChapters;
  onModuleReorder: (
    chapterId: number,
    sourceIndex: number,
    destinationIndex: number
  ) => void;
  onModuleMove?: (
    moduleId: number,
    sourceChapterId: number,
    destinationChapterId: number,
    destinationIndex: number
  ) => void;
}

/**
 * Sortable Module Item
 */
function SortableModuleItem({
  module,
  chapterId,
  courseId,
}: {
  module: Module;
  chapterId: number;
  courseId: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `module-${module.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {/* ModuleItem will be rendered here, but we need to pass drag handlers */}
      <div
        className="flex items-center gap-2 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
        {/* ModuleItem content will go here */}
      </div>
    </div>
  );
}

/**
 * Course Builder Component
 * Handles drag-and-drop for modules
 */
export function CourseBuilder({
  course,
  onModuleReorder,
  onModuleMove,
}: CourseBuilderProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Parse module and chapter IDs from string IDs
    // Format: "module-{moduleId}" or "chapter-{chapterId}"
    if (activeId.startsWith("module-") && overId.startsWith("module-")) {
      const activeModuleId = parseInt(activeId.replace("module-", ""));
      const overModuleId = parseInt(overId.replace("module-", ""));

      // Find which chapters these modules belong to
      let sourceChapter: Chapter | null = null;
      let destinationChapter: Chapter | null = null;
      let sourceIndex = -1;
      let destinationIndex = -1;

      for (const chapter of course.chapters || []) {
        const modules = chapter.modules || [];
        const activeIndex = modules.findIndex((m) => m.id === activeModuleId);
        const overIndex = modules.findIndex((m) => m.id === overModuleId);

        if (activeIndex !== -1) {
          sourceChapter = chapter;
          sourceIndex = activeIndex;
        }
        if (overIndex !== -1) {
          destinationChapter = chapter;
          destinationIndex = overIndex;
        }
      }

      if (sourceChapter && destinationChapter) {
        if (sourceChapter.id === destinationChapter.id) {
          // Reorder within same chapter
          onModuleReorder(sourceChapter.id, sourceIndex, destinationIndex);
        } else if (onModuleMove) {
          // Move between chapters
          onModuleMove(
            activeModuleId,
            sourceChapter.id,
            destinationChapter.id,
            destinationIndex
          );
        }
      }
    }

    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <ChapterList chapters={course.chapters || []} courseId={course.id} />
      <DragOverlay>
        {activeId ? (
          <div className="opacity-50 bg-background border rounded-lg p-4">
            Dragging...
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
