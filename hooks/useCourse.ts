import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCourse,
  getCourseFull,
  getCourseFullEnhanced,
  createCourse,
  updateCourse,
  updateCourseFull,
  deleteCourse,
  getCoursesList,
  reorderModules,
  exportCourse,
  importCourse,
  getImportStatus,
  downloadImportTemplate,
  type CreateCourseData,
  type UpdateCourseFullData,
} from "@/services/course.service";
import type { Course, CourseWithChapters } from "@/types";
import { toast } from "sonner";

/**
 * Get course list
 */
export function useCoursesList() {
  return useQuery({
    queryKey: ["courses", "list"],
    queryFn: getCoursesList,
  });
}

/**
 * Get course by ID (basic info)
 */
export function useCourse(courseId: number | null | undefined) {
  return useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourse(courseId!),
    enabled: !!courseId,
  });
}

/**
 * Get course with full structure (chapters and modules)
 * Uses legacy API for backward compatibility
 */
export function useCourseFull(courseId: number | null | undefined) {
  return useQuery({
    queryKey: ["course", courseId, "full"],
    queryFn: () => getCourseFull(courseId!),
    enabled: !!courseId,
    staleTime: 30 * 1000, // 30 seconds - course structure doesn't change often
  });
}

/**
 * Get course with full structure (enhanced v2 API)
 * Includes Phase 8 fields: quiz_time_limit, quiz_attempt_limit, etc.
 * Uses GET /v2/admin/course/{courseId}/getFull-enhanced
 */
export function useCourseFullEnhanced(courseId: number | null | undefined) {
  return useQuery({
    queryKey: ["course", courseId, "full-enhanced"],
    queryFn: () => getCourseFullEnhanced(courseId!),
    enabled: !!courseId,
    staleTime: 30 * 1000, // 30 seconds - course structure doesn't change often
  });
}

/**
 * Create course mutation
 */
export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCourseData) => createCourse(data),
    onSuccess: (newCourse) => {
      queryClient.invalidateQueries({ queryKey: ["courses", "list"] });
      toast.success("Course created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create course");
    },
  });
}

/**
 * Update course basic info mutation
 */
export function useUpdateCourse(courseId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<CreateCourseData>) =>
      updateCourse(courseId, data),
    onSuccess: (updatedCourse) => {
      queryClient.setQueryData(["course", courseId], updatedCourse);
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["courses", "list"] });
      toast.success("Course updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update course");
    },
  });
}

/**
 * Update course with full structure mutation
 */
export function useUpdateCourseFull(courseId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCourseFullData) =>
      updateCourseFull(courseId, data),
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["course", courseId, "full"] });

      // Snapshot previous value
      const previous = queryClient.getQueryData<CourseWithChapters>([
        "course",
        courseId,
        "full",
      ]);

      // Optimistically update - will be replaced by server response
      if (previous) {
        queryClient.setQueryData<CourseWithChapters>(
          ["course", courseId, "full"],
          {
            ...previous,
            ...newData,
            chapters: newData.chapters || previous.chapters || [],
          } as CourseWithChapters
        );
      }

      return { previous };
    },
    onError: (error, newData, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(
          ["course", courseId, "full"],
          context.previous
        );
      }
      toast.error(error.message || "Failed to update course");
    },
    onSuccess: async (updatedCourse) => {
      queryClient.setQueryData(["course", courseId, "full"], updatedCourse);
      // Immediately refetch enhanced course data
      await queryClient.refetchQueries({
        queryKey: ["course", courseId, "full-enhanced"],
      });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["courses", "list"] });
      // Invalidate all module queries since course structure changed
      queryClient.invalidateQueries({
        queryKey: ["module"],
      });
      toast.success("Course updated successfully");
    },
  });
}

/**
 * Delete course mutation
 */
export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: number) => deleteCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses", "list"] });
      toast.success("Course deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete course");
    },
  });
}

// ============================================
// V2 API Hooks (Phase 8 - Enhanced)
// ============================================

/**
 * Reorder modules mutation
 * Uses v2 API: PUT /v2/admin/course/{courseId}/modules/reorder
 */
export function useReorderModules(courseId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (moduleOrders: Array<{
      module_id: number;
      chapter_id: number;
      serial: number;
    }>) => reorderModules(courseId, moduleOrders),
    onSuccess: async () => {
      // Immediately refetch course data to get updated module order
      await queryClient.refetchQueries({
        queryKey: ["course", courseId, "full-enhanced"],
      });
      await queryClient.refetchQueries({
        queryKey: ["course", courseId, "full"],
      });
      // Invalidate all module queries since order changed
      queryClient.invalidateQueries({
        queryKey: ["module"],
      });
      toast.success("Modules reordered successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reorder modules");
    },
  });
}

/**
 * Export course mutation
 * Uses v2 API: GET /v2/admin/course/{courseId}/export
 */
export function useExportCourse() {
  return useMutation({
    mutationFn: ({
      courseId,
      options,
    }: {
      courseId: number;
      options?: {
        format?: "json" | "csv";
        include_content?: boolean;
        include_quiz_answers?: boolean;
      };
    }) => exportCourse(courseId, options),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to export course");
    },
  });
}

/**
 * Import course mutation
 * Uses v2 API: POST /v2/admin/course/import
 */
export function useImportCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      options,
    }: {
      file: File;
      options?: {
        format?: "csv" | "json";
        import_mode?: "create" | "update" | "upsert";
        validate_only?: boolean;
      };
    }) => importCourse(file, options),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["courses", "list"] });
      toast.success(`Import started: ${data.import_id}`);
      return data;
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to import course");
    },
  });
}

/**
 * Get import status query
 * Uses v2 API: GET /v2/admin/course/import/{importId}/status
 */
export function useImportStatus(importId: string | null) {
  return useQuery({
    queryKey: ["course", "import", importId, "status"],
    queryFn: () => getImportStatus(importId!),
    enabled: !!importId,
    refetchInterval: (query) => {
      // Poll every 2 seconds if still processing
      const data = query.state.data;
      if (data?.status === "processing") {
        return 2000;
      }
      return false;
    },
  });
}

/**
 * Download import template mutation
 * Uses v2 API: GET /v2/admin/course/import/template
 */
export function useDownloadImportTemplate() {
  return useMutation({
    mutationFn: ({
      format,
      exampleData,
    }: {
      format?: "json" | "csv";
      exampleData?: boolean;
    }) => downloadImportTemplate(format, exampleData),
    onSuccess: (blob, variables) => {
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `course_import_template.${variables.format || "json"}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Template downloaded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to download template");
    },
  });
}
