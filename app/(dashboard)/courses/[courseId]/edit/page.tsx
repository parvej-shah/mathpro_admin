"use client";

import { useParams, useRouter } from "next/navigation";
import { useCourseFullEnhanced, useUpdateCourse } from "@/hooks/useCourse";
import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { CourseForm } from "@/components/course/CourseForm";
import type { CreateCourseData } from "@/services/course.service";

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseIdParam = params?.courseId as string | undefined;
  const courseId =
    courseIdParam && !isNaN(parseInt(courseIdParam))
      ? parseInt(courseIdParam)
      : NaN;

  const isValidId = !isNaN(courseId);
  const { data: course, isLoading, error } = useCourseFullEnhanced(courseId);
  const updateCourse = useUpdateCourse(courseId);

  const handleSubmit = async (data: Partial<CreateCourseData>) => {
    await updateCourse.mutateAsync(data);
    router.push(`/courses/${courseId}`);
  };

  if (!isValidId) {
    return (
      <PageContainer className="py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Invalid course ID</AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  if (isLoading) {
    return (
      <PageContainer className="py-6">
        <div className="space-y-6">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-96 w-full max-w-3xl" />
        </div>
      </PageContainer>
    );
  }

  if (error || !course) {
    return (
      <PageContainer className="py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || "Failed to load course"}
          </AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-6">
      <CourseForm
        mode="edit"
        course={course}
        onSubmit={handleSubmit}
        isSubmitting={updateCourse.isPending}
      />
    </PageContainer>
  );
}
