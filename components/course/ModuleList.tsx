"use client";

import { ModuleItem } from "./ModuleItem";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Module } from "@/types";

interface ModuleListProps {
  modules: Module[];
  chapterId: number;
  courseId: number;
  onDeleteModule?: (moduleId: number) => void;
}

/**
 * Module List Component
 * Renders sortable list of modules in a chapter
 */
export function ModuleList({
  modules,
  chapterId,
  courseId,
  onDeleteModule,
}: ModuleListProps) {
  if (!modules || modules.length === 0) {
    return null;
  }

  // Sort modules by serial
  const sortedModules = [...modules].sort((a, b) => a.serial - b.serial);

  // Create sortable IDs
  const moduleIds = sortedModules.map((m) => `module-${m.id}`);

  return (
    <SortableContext items={moduleIds} strategy={verticalListSortingStrategy}>
      <div className="space-y-1.5">
        {sortedModules.map((module) => (
          <ModuleItem
            key={module.id}
            module={module}
            chapterId={chapterId}
            courseId={courseId}
            onDelete={onDeleteModule}
          />
        ))}
      </div>
    </SortableContext>
  );
}
