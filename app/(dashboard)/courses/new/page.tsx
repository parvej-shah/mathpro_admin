"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateCourse } from "@/hooks/useCourse";
import { PageContainer } from "@/components/layout/PageContainer";
import { CourseForm } from "@/components/course/CourseForm";
import type { CreateCourseData } from "@/services/course.service";

export default function NewCoursePage() {
  const router = useRouter();
  const createCourse = useCreateCourse();

  const handleSubmit = async (data: Partial<CreateCourseData>) => {
    const response = await createCourse.mutateAsync(data as CreateCourseData);
    const newCourse = Array.isArray(response) ? response[0] : response;

    if (newCourse?.id) {
      router.push(`/courses/${newCourse.id}`);
      return { id: newCourse.id as number };
    } else {
      toast.error("Course created but failed to get course ID");
    }
  };

  return (
    <PageContainer className="py-6">
      <CourseForm
        mode="create"
        onSubmit={handleSubmit}
        isSubmitting={createCourse.isPending}
      />
    </PageContainer>
  );
}
