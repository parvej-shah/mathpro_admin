"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarWeek,
  faMagnifyingGlass,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import {
  RoutineCard,
  RoutineCardSkeletonStatic,
} from "@/components/routines/RoutineCard";
import type { Routine } from "@/services/routine.service";

interface RoutineListProps {
  routines: Routine[];
  loading: boolean;
  onEdit: (routine: Routine) => void;
  onDelete: (routineId: number) => void;
  onToggleActive: (routineId: number, currentStatus: boolean) => void;
  onCreate: () => void;
  /** Whether the active filter has narrowed the list (drives empty state copy). */
  filtered?: boolean;
}

/**
 * Minimal, modern routine grid — mirrors the redesigned courses page.
 * Single-card view (no toggle) for a sleek, distraction-free experience.
 */
export function RoutineList({
  routines,
  loading,
  onEdit,
  onDelete,
  onToggleActive,
  onCreate,
  filtered = false,
}: RoutineListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <RoutineCardSkeletonStatic key={i} />
        ))}
      </div>
    );
  }

  if (!routines || routines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <FontAwesomeIcon
            icon={filtered ? faMagnifyingGlass : faCalendarWeek}
            className="h-7 w-7"
          />
        </div>
        <h3 className="text-lg font-semibold">
          {filtered ? "No routines match this filter" : "No routines yet"}
        </h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {filtered
            ? "Try a different course, or clear the filter to see all routines."
            : "Get started by creating your first routine to keep students on track with their weekly schedule."}
        </p>
        {!filtered && (
          <Button
            onClick={onCreate}
            className="mt-6 h-11 rounded-full px-5 font-semibold shadow-sm"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
            Create First Routine
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {routines.map((routine) => (
        <RoutineCard
          key={routine.id}
          routine={routine}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
        />
      ))}
    </div>
  );
}
