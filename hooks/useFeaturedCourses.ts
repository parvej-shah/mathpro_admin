import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  featuredCourseService,
  type CreateFeaturedCourseData,
  type FeaturedCourse,
} from "@/services/featured-course.service";

const QUERY_KEYS = {
  all: ["featured-courses"] as const,
  list: () => [...QUERY_KEYS.all, "list"] as const,
};

export function useFeaturedCourses() {
  return useQuery({
    queryKey: QUERY_KEYS.list(),
    queryFn: async () => {
      const response = await featuredCourseService.getFeaturedCourses();
      const payload = response.data;
      return Array.isArray(payload) ? (payload as FeaturedCourse[]) : [];
    },
  });
}

export function useCreateFeaturedCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFeaturedCourseData) =>
      featuredCourseService.createFeaturedCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.list() });
      toast.success("Course added to featured slider");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add featured course");
    },
  });
}

export function useUpdateFeaturedCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      course_id,
      ...data
    }: {
      course_id: number;
      sort_order?: number;
      is_active?: boolean;
    }) => featuredCourseService.updateFeaturedCourse(course_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.list() });
      toast.success("Featured course updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update featured course");
    },
  });
}

export function useReorderFeaturedCourses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseIdsInOrder: number[]) => {
      await Promise.all(
        courseIdsInOrder.map((courseId, index) =>
          featuredCourseService.updateFeaturedCourse(courseId, {
            sort_order: index + 1,
          }),
        ),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.list() });
      toast.success("Featured course order updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reorder featured courses");
    },
  });
}

export function useDeleteFeaturedCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: number) => featuredCourseService.deleteFeaturedCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.list() });
      toast.success("Featured course removed");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove featured course");
    },
  });
}
