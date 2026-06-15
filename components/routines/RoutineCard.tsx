"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faCalendarWeek,
  faEdit,
  faTrash,
  faToggleOn,
  faToggleOff,
  faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Routine } from "@/services/routine.service";

interface RoutineCardProps {
  routine: Routine;
  onEdit: (routine: Routine) => void;
  onDelete: (routineId: number) => void;
  onToggleActive: (routineId: number, currentStatus: boolean) => void;
}

const formatDateRange = (startDate: string, endDate: string): string => {
  const start = format(new Date(startDate), "MMM d");
  const end = format(new Date(endDate), "MMM d, yyyy");
  return `${start} – ${end}`;
};

function getInitials(text?: string | null) {
  if (!text) return "R";
  return (
    text
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase() || "R"
  );
}

function RoutineCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="flex items-center justify-between border-t border-border/60 p-3">
        <Skeleton className="h-6 w-24 rounded-full" />
        <div className="flex gap-1">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function RoutineCardSkeletonStatic() {
  return <RoutineCardSkeleton />;
}

export function RoutineCard({
  routine,
  onEdit,
  onDelete,
  onToggleActive,
}: RoutineCardProps) {
  const isActive = routine.is_active;
  const courseTitle = routine.course_title || "Untitled course";

  return (
    <div
      className={cn(
        "group relative flex h-full flex-col rounded-2xl border border-border/70 bg-card overflow-hidden",
        "transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30",
        !isActive && "opacity-90"
      )}
    >
      {/* Top — routine image hero */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {routine.routine_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={routine.routine_image_url}
            alt={`${courseTitle} — Week ${routine.week_number}`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div
            className={cn(
              "flex h-full w-full items-center justify-center bg-linear-to-br",
              isActive
                ? "from-primary/20 to-accent/20 text-primary"
                : "from-muted to-muted-foreground/10 text-muted-foreground"
            )}
          >
            <FontAwesomeIcon icon={faCalendarWeek} className="h-10 w-10" />
          </div>
        )}

        {/* Course title overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-3">
          <h3 className="truncate text-sm font-semibold leading-tight text-white">
            {courseTitle}
          </h3>
        </div>

        {/* Active/Inactive pill overlay (top-left) */}
        {isActive ? (
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Active
          </span>
        ) : (
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
            Inactive
          </span>
        )}
      </div>

      {/* Identity row — week + date */}
      <div className="flex items-center gap-3 px-4 pt-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted-foreground">
            Week {routine.week_number} •{" "}
            <span className="text-foreground/70">
              {formatDateRange(routine.week_start_date, routine.week_end_date)}
            </span>
          </p>
        </div>
      </div>

      {/* Middle — date + meta */}
      <div className="flex-1 space-y-2 border-t border-border/60 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FontAwesomeIcon icon={faCalendar} className="h-3.5 w-3.5" />
          <span>
            {formatDateRange(routine.week_start_date, routine.week_end_date)}
          </span>
        </div>

        {routine.created_at && (
          <p className="text-xs text-muted-foreground">
            Created {format(new Date(routine.created_at), "MMM d, yyyy")}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
            <FontAwesomeIcon icon={faGraduationCap} className="h-3 w-3" />
            Week {routine.week_number}
          </span>
        </div>
      </div>

      {/* Footer — actions */}
      <div className="mt-auto flex items-center justify-between border-t border-border/60 px-3 py-2.5">
        <span className="truncate text-xs text-muted-foreground">
          {courseTitle}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(routine)}
            aria-label="Edit routine"
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
          >
            <FontAwesomeIcon icon={faEdit} className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleActive(routine.id, routine.is_active)}
            aria-label={isActive ? "Deactivate routine" : "Activate routine"}
            className={cn(
              "h-8 w-8 rounded-full",
              isActive
                ? "text-info hover:text-info"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FontAwesomeIcon
              icon={isActive ? faToggleOn : faToggleOff}
              className="h-4 w-4"
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(routine.id)}
            aria-label="Delete routine"
            className="h-8 w-8 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export { getInitials as getRoutineInitials };
