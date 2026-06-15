import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  rewardService,
  type CreateLevelData,
  type UpdateLevelData,
} from "@/services/reward.service";
import { toast } from "sonner";

const QUERY_KEYS = {
  all: ["rewards"] as const,
  levels: (courseId: number) => [...QUERY_KEYS.all, "levels", courseId] as const,
};

export function useLevels(courseId: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.levels(courseId!),
    queryFn: () => rewardService.getLevels(courseId!),
    enabled: !!courseId,
  });
}

export function useCreateLevel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      data,
    }: {
      courseId: number;
      data: CreateLevelData;
    }) => rewardService.createLevel(courseId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.levels(variables.courseId),
      });
      toast.success("Level created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create level");
    },
  });
}

export function useUpdateLevel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      levelId,
      data,
      courseId,
    }: {
      levelId: number;
      data: UpdateLevelData;
      courseId: number;
    }) => rewardService.updateLevel(levelId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.levels(variables.courseId),
      });
      toast.success("Level updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update level");
    },
  });
}

export function useDeleteLevel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      levelId,
      courseId,
    }: {
      levelId: number;
      courseId: number;
    }) => rewardService.deleteLevel(levelId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.levels(variables.courseId),
      });
      toast.success("Level deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete level");
    },
  });
}
