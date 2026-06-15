import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createModule,
  updateModule,
  deleteModule,
  getModule,
  type CreateModuleData,
  type UpdateModuleData,
} from "@/services/module.service";
import type { Module } from "@/types";
import { toast } from "sonner";

/**
 * Get module by ID
 * Automatically refetches when moduleId changes to ensure fresh data
 */
export function useModule(moduleId: number | null | undefined) {
  return useQuery({
    queryKey: ["module", moduleId],
    queryFn: () => getModule(moduleId!),
    enabled: !!moduleId,
    staleTime: 0, // Always consider data stale to ensure fresh data after CRUD operations
    refetchOnMount: true, // Refetch when component mounts (e.g., when opening editor)
  });
}

/**
 * Create module mutation
 */
export function useCreateModule(chapterId: number, courseId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateModuleData) => createModule(chapterId, data),
    onSuccess: async (newModule) => {
      // Immediately refetch course data to get fresh module list
      await queryClient.refetchQueries({
        queryKey: ["course", courseId, "full-enhanced"],
      });
      await queryClient.refetchQueries({
        queryKey: ["course", courseId, "full"],
      });
      // Invalidate all module queries to ensure fresh data when opening any module
      queryClient.invalidateQueries({
        queryKey: ["module"],
      });
      // Set the new module in cache if we have it
      if (newModule?.id) {
        queryClient.setQueryData(["module", newModule.id], newModule);
      }
      toast.success("Module created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create module");
    },
  });
}

/**
 * Update module mutation
 */
export function useUpdateModule(
  moduleId: number,
  chapterId: number,
  courseId: number
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateModuleData) => updateModule(moduleId, data),
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["module", moduleId] });

      // Snapshot previous value
      const previous = queryClient.getQueryData<Module>(["module", moduleId]);

      // Optimistically update
      if (previous) {
        queryClient.setQueryData<Module>(["module", moduleId], {
          ...previous,
          ...newData,
        });
      }

      return { previous };
    },
    onError: (error, newData, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(["module", moduleId], context.previous);
      }
      toast.error(error.message || "Failed to update module");
    },
    onSuccess: async (updatedModule) => {
      queryClient.setQueryData(["module", moduleId], updatedModule);
      // Immediately refetch course data to get fresh module data
      await queryClient.refetchQueries({
        queryKey: ["course", courseId, "full-enhanced"],
      });
      await queryClient.refetchQueries({
        queryKey: ["course", courseId, "full"],
      });
      // Invalidate all module queries to ensure fresh data when opening any module
      queryClient.invalidateQueries({
        queryKey: ["module"],
      });
      toast.success("Module updated successfully");
    },
  });
}

/**
 * Delete module mutation
 */
export function useDeleteModule(courseId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (moduleId: number) => deleteModule(moduleId),
    onSuccess: async (_, moduleId) => {
      // Immediately refetch course data to get updated module list
      await queryClient.refetchQueries({
        queryKey: ["course", courseId, "full-enhanced"],
      });
      await queryClient.refetchQueries({
        queryKey: ["course", courseId, "full"],
      });
      // Also remove the deleted module from cache
      queryClient.removeQueries({ queryKey: ["module", moduleId] });
      toast.success("Module deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete module");
    },
  });
}

// ============================================
// V2 API Hooks (Phase 8 - Enhanced)
// ============================================

import {
  updateModuleEnhanced,
  importQuiz,
  exportQuiz,
  duplicateModule,
} from "@/services/module.service";

/**
 * Update module with enhanced Phase 8 fields
 * Uses v2 API: PUT /v2/admin/module/{moduleId}/update-enhanced
 */
export function useUpdateModuleEnhanced(
  moduleId: number,
  courseId: number
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof updateModuleEnhanced>[1]) =>
      updateModuleEnhanced(moduleId, data),
    onSuccess: async (updatedModule) => {
      queryClient.setQueryData(["module", moduleId], updatedModule);
      // Immediately refetch course data to get fresh module data
      await queryClient.refetchQueries({
        queryKey: ["course", courseId, "full-enhanced"],
      });
      await queryClient.refetchQueries({
        queryKey: ["course", courseId, "full"],
      });
      // Invalidate all module queries to ensure fresh data when opening any module
      queryClient.invalidateQueries({
        queryKey: ["module"],
      });
      toast.success("Module updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update module");
    },
  });
}

/**
 * Import quiz from JSON
 * Uses v2 API: POST /v2/admin/module/{moduleId}/quiz/import
 * ✅ NEW: No encryption required - only questions and options
 */
export function useImportQuiz(moduleId: number, courseId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      quizData,
    }: {
      quizData: Parameters<typeof importQuiz>[1];
    }) => importQuiz(moduleId, quizData),
    onSuccess: async (result) => {
      queryClient.invalidateQueries({ queryKey: ["module", moduleId] });
      // Immediately refetch course data to get updated module
      await queryClient.refetchQueries({
        queryKey: ["course", courseId, "full-enhanced"],
      });
      await queryClient.refetchQueries({
        queryKey: ["course", courseId, "full"],
      });
      // Invalidate all module queries to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: ["module"],
      });
      // Show success message with imported count
      if (result.success && result.data) {
        toast.success(
          `Imported ${result.data.imported_count} question${
            result.data.imported_count !== 1 ? "s" : ""
          } successfully`
        );
      } else {
        toast.success("Quiz imported successfully");
      }
    },
    onError: (error: any) => {
      // Handle validation errors with details
      // Check if error has details from service layer (thrown Error with code/details)
      if (error.details) {
        const errorMessages = Object.entries(error.details)
          .map(([field, message]) => `${field}: ${message}`)
          .join("\n");
        toast.error(`Validation errors:\n${errorMessages}`);
        return;
      }

      // Handle AxiosError from API client
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.code === "VALIDATION_ERROR" && errorData.details) {
          const errorMessages = Object.entries(errorData.details)
            .map(([field, message]) => `${field}: ${message}`)
            .join("\n");
          toast.error(`Validation errors:\n${errorMessages}`);
        } else if (errorData.error) {
          toast.error(errorData.error);
        } else if (errorData.message) {
          toast.error(errorData.message);
        } else {
          toast.error(error.message || "Failed to import quiz");
        }
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to import quiz");
      }
    },
  });
}

/**
 * Export quiz to JSON
 * Uses v2 API: GET /v2/admin/module/{moduleId}/quiz/export
 * Note: This is a manual query that needs to be triggered via refetch()
 */
export function useExportQuiz(moduleId: number) {
  return useQuery({
    queryKey: ["module", moduleId, "quiz-export"],
    queryFn: () => exportQuiz(moduleId, { format: "full", include_answers: true }),
    enabled: false, // Manual trigger only
  });
}

/**
 * Export quiz mutation (alternative approach)
 * Uses v2 API: GET /v2/admin/module/{moduleId}/quiz/export
 */
export function useExportQuizMutation() {
  return useMutation({
    mutationFn: (moduleId: number) =>
      exportQuiz(moduleId, { format: "full", include_answers: true }),
  });
}

/**
 * Duplicate module
 * Uses v2 API: POST /v2/admin/module/{moduleId}/duplicate
 */
export function useDuplicateModule(courseId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      moduleId,
      options,
    }: {
      moduleId: number;
      options?: {
        include_content?: boolean;
        new_chapter_id?: number;
      };
    }) => duplicateModule(moduleId, options),
    onSuccess: async (data) => {
      // Immediately refetch course data to get the duplicated module
      await queryClient.refetchQueries({
        queryKey: ["course", courseId, "full-enhanced"],
      });
      await queryClient.refetchQueries({
        queryKey: ["course", courseId, "full"],
      });
      // Invalidate all module queries to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: ["module"],
      });
      toast.success(data.message || "Module duplicated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to duplicate module");
    },
  });
}
