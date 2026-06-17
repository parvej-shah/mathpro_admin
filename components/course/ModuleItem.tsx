"use client";

import { Button } from "@/components/ui/button";
import {
  Pencil,
  Trash2,
  GripVertical,
  Video,
  FileText,
  HelpCircle,
  FileType,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Module, ModuleCategory } from "@/types";
import { cn } from "@/lib/utils";

interface ModuleItemProps {
  module: Module;
  chapterId: number;
  courseId: number;
  onDelete?: (moduleId: number) => void;
}

const categoryConfig: Record<
  ModuleCategory,
  { icon: LucideIcon; cls: string }
> = {
  VIDEO: { icon: Video, cls: "bg-info/15 text-info" },
  QUIZ: { icon: HelpCircle, cls: "bg-primary/10 text-primary" },
  PDF: { icon: FileType, cls: "bg-destructive/10 text-destructive" },
  TEXT: { icon: FileText, cls: "bg-muted text-muted-foreground" },
};

const liveClassStatusConfig: Record<
  NonNullable<Module["live_status"]>,
  { label: string; cls: string }
> = {
  SCHEDULED: { label: "Upcoming", cls: "bg-warning/10 text-warning" },
  LIVE: { label: "Live", cls: "bg-destructive/10 text-destructive" },
  ENDED: { label: "Live Ended", cls: "bg-muted text-muted-foreground" },
};

/**
 * Module Item Component
 * A single sortable module row with category icon and inline actions.
 */
export function ModuleItem({ module, courseId, onDelete }: ModuleItemProps) {
  const router = useRouter();
  const rawData = typeof module.data === "string"
    ? (() => { try { return JSON.parse(module.data as string); } catch { return {}; } })()
    : module.data;
  const category = (module.category || module.type || rawData?.category) as ModuleCategory;
  const cfg = categoryConfig[category] || categoryConfig.TEXT;
  const CategoryIcon = cfg.icon;
  const liveClassStatus = module.live_status
    ? liveClassStatusConfig[module.live_status]
    : null;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `module-${module.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group/module flex items-center gap-2.5 rounded-lg border bg-card px-2.5 py-2 transition-all duration-150",
        isDragging
          ? "z-10 border-primary bg-primary/5 shadow-lg"
          : "hover:border-primary/20 hover:bg-muted/40"
      )}
    >
      {/* Drag handle */}
      <button
        className="cursor-grab touch-none rounded p-1 text-muted-foreground/50 opacity-0 transition-opacity hover:text-foreground active:cursor-grabbing group-hover/module:opacity-100"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Serial */}
      <span className="w-7 shrink-0 text-center text-xs font-semibold tabular-nums text-muted-foreground">
        {module.serial}
      </span>

      {/* Category icon */}
      <span
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
          cfg.cls
        )}
        title={category}
      >
        <CategoryIcon className="h-4 w-4" />
      </span>

      {/* Title + category */}
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-medium leading-tight">
          {module.title}
        </h4>
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {category}
        </span>
      </div>

      {/* Meta */}
      <div className="hidden shrink-0 items-center gap-2 sm:flex">
        {module.is_free && (
          <span className="rounded-full bg-info/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-info">
            Free
          </span>
        )}
        {liveClassStatus && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              liveClassStatus.cls
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                module.live_status === "ENDED"
                  ? "bg-muted-foreground/40"
                  : module.live_status === "SCHEDULED"
                    ? "bg-warning"
                    : "bg-destructive"
              )}
            />
            {liveClassStatus.label}
          </span>
        )}
        {module.score !== undefined && (
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
            {module.score} pts
          </span>
        )}
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            module.is_live
              ? "bg-success/10 text-success"
              : "bg-muted text-muted-foreground"
          )}
        >
          {module.is_live ? "Published" : "Draft"}
        </span>
      </div>

      {/* Actions — revealed on hover */}
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover/module:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title="Edit module"
          onClick={() => router.push(`/courses/${courseId}/modules/${module.id}/edit`)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            title="Delete module"
            onClick={() => onDelete(module.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
