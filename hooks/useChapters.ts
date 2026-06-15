import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createChapter,
  updateChapter,
  deleteChapter,
  getChapter,
  type CreateChapterData,
  type UpdateChapterData,
} from "@/services/chapter.service";
import type { Chapter } from "@/types";
import { toast } from "sonner";

/**
 * Get chapter by ID
 */
export function useChapter(chapterId: number | null | undefined) {
  return useQuery({
    queryKey: ["chapter", chapterId],
    queryFn: () => getChapter(chapterId!),
    enabled: !!chapterId,
  });
}

/**
 * Create chapter mutation
 */
export function useCreateChapter(courseId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateChapterData) => createChapter(courseId, data),
    onSuccess: async () => {
      // Immediately refetch course data to get fresh chapter list
      await queryClient.refetchQueries({
        queryKey: ["course", courseId, "full-enhanced"],
      });
      await queryClient.refetchQueries({
        queryKey: ["course", courseId, "full"],
      });
      // Invalidate all module queries since chapters contain modules
      queryClient.invalidateQueries({
        queryKey: ["module"],
      });
      toast.success("Chapter created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create chapter");
    },
  });
}

/**
 * Update chapter mutation
 */
export function useUpdateChapter(chapterId: number, courseId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateChapterData) => updateChapter(chapterId, data),
    onSuccess: async (updatedChapter) => {
      queryClient.setQueryData(["chapter", chapterId], updatedChapter);
      // Immediately refetch course data to get fresh chapter data
      await queryClient.refetchQueries({
        queryKey: ["course", courseId, "full-enhanced"],
      });
      await queryClient.refetchQueries({
        queryKey: ["course", courseId, "full"],
      });
      // Invalidate all module queries since chapters contain modules
      queryClient.invalidateQueries({
        queryKey: ["module"],
      });
      toast.success("Chapter updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update chapter");
    },
  });
}

/**
 * Delete chapter mutation
 */
export function useDeleteChapter(courseId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (chapterId: number) => deleteChapter(chapterId),
    onSuccess: async (_, chapterId) => {
      // Immediately refetch course data to get updated chapter list
      await queryClient.refetchQueries({
        queryKey: ["course", courseId, "full-enhanced"],
      });
      await queryClient.refetchQueries({
        queryKey: ["course", courseId, "full"],
      });
      // Also remove the deleted chapter from cache
      queryClient.removeQueries({ queryKey: ["chapter", chapterId] });
      // Invalidate all module queries since chapters contain modules
      queryClient.invalidateQueries({
        queryKey: ["module"],
      });
      toast.success("Chapter deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete chapter");
    },
  });
}
