"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  RoutineEditor,
  RoutineEditorSkeleton,
} from "@/components/routines/RoutineEditor";
import { useCourses } from "@/hooks/useAnnouncements";
import { useRoutine, useUpdateRoutine } from "@/hooks/useRoutines";
import type { CreateRoutineData } from "@/services/routine.service";

export default function EditRoutinePage() {
  const params = useParams();
  const router = useRouter();

  const rawId = params?.routineId;
  const routineId = useMemo(() => {
    if (typeof rawId !== "string" && typeof rawId !== "number") return NaN;
    const parsed =
      typeof rawId === "string" ? parseInt(rawId, 10) : (rawId as number);
    return isNaN(parsed) ? NaN : parsed;
  }, [rawId]);

  const isValidId = !isNaN(routineId) && routineId > 0;

  const { data: routineData, isLoading, error } = useRoutine(
    isValidId ? routineId : null
  );
  const { data: coursesData, isLoading: coursesLoading } = useCourses();
  const updateRoutine = useUpdateRoutine();

  const routine = routineData?.data
    ? Array.isArray(routineData.data)
      ? routineData.data[0]
      : routineData.data
    : null;

  const courses: Array<{ id: number; title: string }> = useMemo(() => {
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
  }, [coursesData]);

  const handleSubmit = async (
    _courseId: number,
    data: CreateRoutineData
  ): Promise<void> => {
    await updateRoutine.mutateAsync({ id: routineId, data });
    router.push("/routines");
  };

  if (!isValidId) {
    return (
      <PageContainer className="py-8">
        <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive">
            <FontAwesomeIcon
              icon={faTriangleExclamation}
              className="h-5 w-5"
            />
          </div>
          <h2 className="text-lg font-semibold">Invalid routine id</h2>
          <p className="text-sm text-muted-foreground">
            The link you followed is missing or malformed.
          </p>
          <Button
            onClick={() => router.push("/routines")}
            className="h-10 rounded-full px-5"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-3.5 w-3.5" />
            Back to routines
          </Button>
        </div>
      </PageContainer>
    );
  }

  if (isLoading || coursesLoading) {
    return (
      <PageContainer className="py-8">
        <RoutineEditorSkeleton />
      </PageContainer>
    );
  }

  if (error || !routine) {
    return (
      <PageContainer className="py-8">
        <div className="mx-auto max-w-md space-y-4">
          <Alert variant="destructive">
            <FontAwesomeIcon
              icon={faTriangleExclamation}
              className="h-4 w-4"
            />
            <AlertDescription>
              {error?.message || "We couldn't find that routine."}
            </AlertDescription>
          </Alert>
          <Button
            onClick={() => router.push("/routines")}
            variant="outline"
            className="h-10 rounded-full"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-3.5 w-3.5" />
            Back to routines
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-8">
      <RoutineEditor
        mode="edit"
        routine={routine}
        courses={courses}
        onSubmit={handleSubmit}
        isSubmitting={updateRoutine.isPending}
      />
    </PageContainer>
  );
}
