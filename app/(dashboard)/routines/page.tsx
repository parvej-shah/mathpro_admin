"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoutineList } from "@/components/routines/RoutineList";
import { RoutineFilter } from "@/components/routines/RoutineFilter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useRoutines,
  useRoutinesByCourse,
  useDeleteRoutine,
  useToggleRoutineActive,
} from "@/hooks/useRoutines";
import { useCourses } from "@/hooks/useAnnouncements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarWeek,
  faMagnifyingGlass,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import type { Routine } from "@/services/routine.service";

export default function RoutineManagementPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingRoutine, setDeletingRoutine] = useState<Routine | null>(null);

  const { data: allRoutinesData, isLoading: allRoutinesLoading } =
    useRoutines();
  const { data: courseRoutinesData, isLoading: courseRoutinesLoading } =
    useRoutinesByCourse(selectedCourse);
  const { data: coursesData } = useCourses();
  const deleteRoutine = useDeleteRoutine();
  const toggleActive = useToggleRoutineActive();

  const courses: Array<{ id: number; title: string }> = (() => {
    if (!coursesData?.data) return [];
    const responseData = coursesData.data as
      | Array<{ id: number; title: string }>
      | { data?: Array<{ id: number; title: string }> };
    if (Array.isArray(responseData)) return responseData;
    if (
      responseData &&
      typeof responseData === "object" &&
      "data" in responseData
    ) {
      return Array.isArray(responseData.data) ? responseData.data : [];
    }
    return [];
  })();

  const routines: Routine[] = useMemo(() => {
    const data = selectedCourse ? courseRoutinesData : allRoutinesData;
    if (!data?.data) return [];
    const responseData = data.data as Routine[] | { data?: Routine[] };
    if (Array.isArray(responseData)) return responseData;
    if (
      responseData &&
      typeof responseData === "object" &&
      "data" in responseData
    ) {
      return Array.isArray(responseData.data) ? responseData.data : [];
    }
    return [];
  }, [selectedCourse, courseRoutinesData, allRoutinesData]);

  const isLoading = selectedCourse ? courseRoutinesLoading : allRoutinesLoading;

  const filteredRoutines = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return routines;
    return routines.filter((r) => {
      const haystack = [
        r.course_title,
        `week ${r.week_number}`,
        r.week_start_date,
        r.week_end_date,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [routines, search]);

  const handleCreateRoutine = () => {
    router.push("/routines/new");
  };

  const handleEditRoutine = (routine: Routine) => {
    router.push(`/routines/${routine.id}/edit`);
  };

  const handleDeleteRoutine = (routineId: number) => {
    const routine = routines.find((r) => r.id === routineId);
    setDeletingRoutine(routine || null);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRoutine) return;
    try {
      await deleteRoutine.mutateAsync(deletingRoutine.id);
      setIsDeleteDialogOpen(false);
      setDeletingRoutine(null);
    } catch {
      /* error handled by mutation */
    }
  };

  const handleToggleActive = async (
    routineId: number,
    currentStatus: boolean
  ) => {
    try {
      await toggleActive.mutateAsync({
        id: routineId,
        isActive: !currentStatus,
      });
    } catch {
      /* error handled by mutation */
    }
  };

  const handleFilterChange = (courseId: number | null) => {
    setSelectedCourse(courseId);
  };

  const totalLabel = isLoading
    ? "Loading routines…"
    : `${routines.length} routine${routines.length === 1 ? "" : "s"} — keep your weekly schedules organised in one place.`;

  return (
    <PageContainer className="py-8">
      {/* Header */}
      <PageHeader
        eyebrow="Routines"
        eyebrowIcon={faCalendarWeek}
        title="Routine Management"
        description={totalLabel}
        action={
          <Button
            onClick={handleCreateRoutine}
            className="h-11 rounded-full px-5 font-semibold shadow-sm"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
            Create Routine
          </Button>
        }
        className="mb-6"
      />

      {/* Search + filter row */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by course, week, or date…"
            className="pl-10 h-11 rounded-full bg-muted/40 border-transparent focus-visible:bg-background"
          />
        </div>

        <div className="w-full sm:w-auto">
            <RoutineFilter
              selectedCourse={selectedCourse}
              onFilterChange={handleFilterChange}
            />
          </div>
      </div>

      {/* Routine grid */}
      <RoutineList
        routines={filteredRoutines}
        loading={isLoading}
        onEdit={handleEditRoutine}
        onDelete={handleDeleteRoutine}
        onToggleActive={handleToggleActive}
        onCreate={handleCreateRoutine}
        filtered={Boolean(search.trim() || selectedCourse)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete routine</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this routine? This action cannot
              be undone.
              {deletingRoutine && (
                <span className="mt-2 block font-semibold text-foreground">
                  {deletingRoutine.course_title} — Week{" "}
                  {deletingRoutine.week_number}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
