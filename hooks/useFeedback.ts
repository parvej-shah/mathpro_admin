import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCourseFeedbackList,
  getCourseFeedbackStats,
  exportCourseFeedback,
  deleteCourseFeedback,
  getModuleFeedbackList,
  getModuleStats,
  getCourseModuleReport,
  exportModuleFeedback,
  getFeedbackReasons,
  getFeedbackReason,
  createFeedbackReason,
  updateFeedbackReason,
  deleteFeedbackReason,
  reorderFeedbackReasons,
} from "@/services/feedback.service";
import type {
  CourseFeedbackListParams,
  CourseFeedbackExportParams,
  ModuleFeedbackListParams,
  ModuleFeedbackExportParams,
  CreateFeedbackReasonData,
  UpdateFeedbackReasonData,
  ReorderFeedbackReasonsData,
} from "@/types/feedback.types";
import { toast } from "sonner";

// ============================================
// Course Feedback Hooks
// ============================================

/**
 * Get paginated course feedback list
 */
export function useCourseFeedbackList(params: CourseFeedbackListParams = {}) {
  return useQuery({
    queryKey: ["courseFeedback", "list", params],
    queryFn: () => getCourseFeedbackList(params),
    staleTime: 30 * 1000,
  });
}

/**
 * Get course feedback statistics
 */
export function useCourseFeedbackStats(courseId?: string) {
  return useQuery({
    queryKey: ["courseFeedback", "stats", courseId],
    queryFn: () => getCourseFeedbackStats(courseId),
    staleTime: 60 * 1000,
  });
}

/**
 * Export course feedback mutation
 */
export function useExportCourseFeedback() {
  return useMutation({
    mutationFn: (params: CourseFeedbackExportParams) => exportCourseFeedback(params),
    onSuccess: (blob, variables) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const timestamp = new Date().toISOString().split("T")[0];
      a.download = `course_feedback_${timestamp}.${variables.format || "csv"}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Feedback exported successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to export feedback");
    },
  });
}

/**
 * Delete course feedback mutation
 */
export function useDeleteCourseFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (feedbackId: string) => deleteCourseFeedback(feedbackId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseFeedback"] });
      toast.success("Feedback deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete feedback");
    },
  });
}

// ============================================
// Module Feedback Hooks
// ============================================

/**
 * Get paginated module feedback list
 */
export function useModuleFeedbackList(params: ModuleFeedbackListParams = {}) {
  return useQuery({
    queryKey: ["moduleFeedback", "list", params],
    queryFn: () => getModuleFeedbackList(params),
    staleTime: 30 * 1000,
  });
}

/**
 * Get module statistics
 */
export function useModuleStats(moduleId: number | null) {
  return useQuery({
    queryKey: ["moduleFeedback", "stats", moduleId],
    queryFn: () => getModuleStats(moduleId!),
    enabled: !!moduleId,
    staleTime: 60 * 1000,
  });
}

/**
 * Get course module report
 */
export function useCourseModuleReport(courseId: number | null) {
  return useQuery({
    queryKey: ["moduleFeedback", "courseReport", courseId],
    queryFn: () => getCourseModuleReport(courseId!),
    enabled: !!courseId,
    staleTime: 60 * 1000,
  });
}

/**
 * Export module feedback mutation
 */
export function useExportModuleFeedback() {
  return useMutation({
    mutationFn: (params: ModuleFeedbackExportParams) => exportModuleFeedback(params),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const timestamp = new Date().toISOString().split("T")[0];
      a.download = `module_feedback_${timestamp}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Feedback exported successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to export feedback");
    },
  });
}

// ============================================
// Module Feedback Reasons Hooks
// ============================================

/**
 * Get all feedback reasons
 */
export function useFeedbackReasons(activeOnly?: boolean) {
  return useQuery({
    queryKey: ["feedbackReasons", activeOnly],
    queryFn: () => getFeedbackReasons(activeOnly),
    staleTime: 60 * 1000,
  });
}

/**
 * Get single feedback reason by ID
 */
export function useFeedbackReason(id: number | null) {
  return useQuery({
    queryKey: ["feedbackReason", id],
    queryFn: () => getFeedbackReason(id!),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}

/**
 * Create feedback reason mutation
 */
export function useCreateFeedbackReason() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFeedbackReasonData) => createFeedbackReason(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedbackReasons"] });
      toast.success("Feedback reason created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create feedback reason");
    },
  });
}

/**
 * Update feedback reason mutation
 */
export function useUpdateFeedbackReason() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateFeedbackReasonData }) =>
      updateFeedbackReason(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedbackReasons"] });
      queryClient.invalidateQueries({ queryKey: ["feedbackReason"] });
      toast.success("Feedback reason updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update feedback reason");
    },
  });
}

/**
 * Delete feedback reason mutation
 */
export function useDeleteFeedbackReason() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteFeedbackReason(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedbackReasons"] });
      toast.success("Feedback reason deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete feedback reason");
    },
  });
}

/**
 * Reorder feedback reasons mutation
 */
export function useReorderFeedbackReasons() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReorderFeedbackReasonsData) => reorderFeedbackReasons(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedbackReasons"] });
      toast.success("Feedback reasons reordered successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reorder feedback reasons");
    },
  });
}


