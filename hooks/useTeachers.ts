import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  teacherService,
  type CreateTeacherData,
  type UpdateTeacherData,
} from "@/services/teacher.service";
import { toast } from "sonner";
import { AxiosError } from "axios";

const QUERY_KEYS = {
  all: ["teachers"] as const,
  lists: () => [...QUERY_KEYS.all, "list"] as const,
  list: () => [...QUERY_KEYS.lists()] as const,
  details: () => [...QUERY_KEYS.all, "detail"] as const,
  detail: (id: number) => [...QUERY_KEYS.details(), id] as const,
};

/**
 * Get all teachers (full info)
 * Uses new v2 API: GET /v2/admin/teacher/list-full
 */
export function useTeachers() {
  return useQuery({
    queryKey: QUERY_KEYS.list(),
    queryFn: () => teacherService.getAllTeachers(),
  });
}

/**
 * Get teachers (names only - lightweight)
 * Uses new v2 API: GET /v2/admin/teacher/list-names
 */
export function useTeachersNames() {
  return useQuery({
    queryKey: [...QUERY_KEYS.list(), "names"],
    queryFn: () => teacherService.getTeachersNames(),
  });
}

export function useTeacher(id: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id!),
    queryFn: () => teacherService.getTeacher(id!),
    enabled: !!id,
  });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTeacherData) => teacherService.createTeacher(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success("Teacher created successfully");
    },
    onError: (error: Error | AxiosError) => {
      // Handle 409 Conflict errors with user-friendly message
      // Check if it's an AxiosError or an Error with status property (from service)
      const status = 
        (error instanceof AxiosError && error.response?.status) ||
        (error as any).status;
      
      const response = 
        (error instanceof AxiosError && error.response) ||
        (error as any).response;
      
      const errorData = response?.data as 
        | { error?: string; message?: string; details?: { email?: string } }
        | undefined;

      if (status === 409) {
        const message =
          errorData?.error ||
          errorData?.message ||
          error.message ||
          "A teacher with this phone/email already exists. Please use a different phone number or email.";
        toast.error(message);
        return;
      }

      // Handle 500 Internal Server Error (database errors, backend issues)
      if (status === 500) {
        const message =
          error.message ||
          errorData?.error ||
          errorData?.message ||
          "Failed to create teacher due to a server error. Please try again or contact support if the issue persists.";
        toast.error(message, {
          duration: 6000, // Show longer for important errors
        });
        console.error("Server error creating teacher:", {
          status,
          error: errorData,
          originalError: (error as any).originalError,
        });
        return;
      }

      // Handle other HTTP errors (400, 422, etc.)
      if (status && status >= 400) {
        const message =
          errorData?.error ||
          errorData?.details?.email ||
          errorData?.message ||
          error.message ||
          `Failed to create teacher (HTTP ${status})`;
        toast.error(message);
        return;
      }

      // Fallback for non-HTTP errors or errors without response
      toast.error(error.message || "Failed to create teacher. Please try again.");
    },
  });
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTeacherData }) =>
      teacherService.updateTeacher(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.detail(variables.id),
      });
      toast.success("Teacher updated successfully");
    },
    onError: (error: Error | AxiosError) => {
      // Handle HTTP errors with proper error messages
      // Check if it's an AxiosError or an Error with status property (from service)
      const status = 
        (error instanceof AxiosError && error.response?.status) ||
        (error as any).status;
      
      const response = 
        (error instanceof AxiosError && error.response) ||
        (error as any).response;
      
      const errorData = response?.data as
        | { error?: string; message?: string; code?: string; details?: { email?: string } }
        | undefined;

      if (status === 409) {
        const message =
          errorData?.error ||
          errorData?.message ||
          error.message ||
          "A teacher with this phone/email already exists. Please use a different phone number or email.";
        toast.error(message);
        return;
      }

      // Grant admin access without email: backend returns 422/400 with VALIDATION_ERROR
      if ((status === 422 || status === 400) && errorData?.code === "VALIDATION_ERROR") {
        const message =
          errorData?.error ||
          errorData?.details?.email ||
          errorData?.message ||
          "Email is required to grant admin panel access so we can send credentials by email.";
        toast.error(message);
        return;
      }

      if (status && status >= 400) {
        const message =
          errorData?.error ||
          errorData?.details?.email ||
          errorData?.message ||
          error.message ||
          `Failed to update teacher (HTTP ${status})`;
        toast.error(message);
        return;
      }

      toast.error(error.message || "Failed to update teacher");
    },
  });
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => teacherService.deleteTeacher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success("Teacher deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete teacher");
    },
  });
}

/**
 * Get teachers by course
 * Uses new v2 API: GET /v2/admin/teacher/by-course/{courseId}
 */
export function useTeachersByCourse(courseId: number | null) {
  return useQuery({
    queryKey: [...QUERY_KEYS.list(), "by-course", courseId],
    queryFn: () => teacherService.getTeachersByCourse(courseId!),
    enabled: !!courseId,
  });
}

/**
 * Search teachers
 * Uses new v2 API: GET /v2/admin/teacher/search
 */
export function useSearchTeachers(params: {
  q?: string;
  category?: string;
  isActive?: boolean;
  isPrivileged?: boolean;
  hasCourses?: boolean;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.list(), "search", params],
    queryFn: () => teacherService.searchTeachers(params),
  });
}

/**
 * Toggle teacher active status
 * Uses new v2 API: PUT /v2/admin/teacher/{teacherId}/toggle-active
 */
export function useToggleTeacherActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      teacherService.toggleActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success("Teacher status updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update teacher status");
    },
  });
}

/**
 * Upload teacher image
 * Uses new v2 API: POST /v2/admin/teacher/{teacherId}/image
 */
export function useUploadTeacherImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, imageFile }: { id: number; imageFile: File }) =>
      teacherService.uploadImage(id, imageFile),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(variables.id) });
      toast.success("Teacher image uploaded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload image");
    },
  });
}
