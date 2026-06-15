"use client";

import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  RoutineEditor,
  RoutineEditorSkeleton,
} from "@/components/routines/RoutineEditor";
import { useCreateRoutine } from "@/hooks/useRoutines";
import { useCourses } from "@/hooks/useAnnouncements";
import type { CreateRoutineData } from "@/services/routine.service";

export default function NewRoutinePage() {
  const router = useRouter();
  const { data: coursesData, isLoading: coursesLoading } = useCourses();
  const createRoutine = useCreateRoutine();

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

  const handleSubmit = async (
    courseId: number,
    data: CreateRoutineData
  ): Promise<void> => {
    await createRoutine.mutateAsync({ courseId, data });
    router.push("/routines");
  };

  return (
    <PageContainer className="py-8">
      {coursesLoading ? (
        <RoutineEditorSkeleton />
      ) : (
        <RoutineEditor
          mode="create"
          courses={courses}
          onSubmit={handleSubmit}
          isSubmitting={createRoutine.isPending}
        />
      )}
    </PageContainer>
  );
}
