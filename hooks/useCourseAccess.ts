import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courseAccessService } from "@/services/course-access.service";
import type { AssignCourseAccessData } from "@/types/course-access.types";
import { toast } from "sonner";

const QUERY_KEYS = {
  all: ["course-access"] as const,
  courseUsers: (courseId: number) =>
    [...QUERY_KEYS.all, "course-users", courseId] as const,
  userCourses: (userId: number) =>
    [...QUERY_KEYS.all, "user-courses", userId] as const,
};

/**
 * Get all users who have access to a specific course
 */
export function useCourseUsers(courseId: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.courseUsers(courseId!),
    queryFn: () => courseAccessService.getCourseUsers(courseId!),
    enabled: !!courseId,
  });
}

/**
 * Get all courses a user has access to
 */
export function useUserCourses(userId: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.userCourses(userId!),
    queryFn: () => courseAccessService.getUserCourses(userId!),
    enabled: !!userId,
  });
}

/**
 * Assign course access mutation
 * Note: Does not show toast on success - parent component handles batch feedback
 */
export function useAssignCourseAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignCourseAccessData) =>
      courseAccessService.assignCourseAccess(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.courseUsers(variables.courseId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.userCourses(variables.userId),
      });
      // Toast handled by parent component for batch operations
    },
    onError: (error: Error) => {
      // Error will be caught and handled by parent component
      throw error;
    },
  });
}

/**
 * Remove course access mutation
 */
export function useRemoveCourseAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, userId }: { courseId: number; userId: number }) =>
      courseAccessService.removeCourseAccess(courseId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.courseUsers(variables.courseId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.userCourses(variables.userId),
      });
      toast.success("Course access removed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove course access");
    },
  });
}
