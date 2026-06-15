import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  routineService,
  type CreateRoutineData,
  type UpdateRoutineData,
} from "@/services/routine.service";
import { toast } from "sonner";

const QUERY_KEYS = {
  all: ["routines"] as const,
  lists: () => [...QUERY_KEYS.all, "list"] as const,
  byCourse: (courseId: number) => [...QUERY_KEYS.all, "course", courseId] as const,
  details: () => [...QUERY_KEYS.all, "detail"] as const,
  detail: (id: number) => [...QUERY_KEYS.details(), id] as const,
};

export function useRoutines() {
  return useQuery({
    queryKey: QUERY_KEYS.lists(),
    queryFn: () => routineService.getAllRoutines(),
  });
}

export function useRoutinesByCourse(courseId: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.byCourse(courseId!),
    queryFn: () => routineService.getRoutinesByCourse(courseId!),
    enabled: !!courseId,
  });
}

export function useRoutine(id: number | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id ?? -1),
    queryFn: () => routineService.getRoutineById(id as number),
    enabled: typeof id === "number" && !isNaN(id) && id > 0,
  });
}

export function useCreateRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      data,
    }: {
      courseId: number;
      data: CreateRoutineData;
    }) => routineService.createRoutine(courseId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.byCourse(variables.courseId),
      });
      toast.success("Routine created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create routine");
    },
  });
}

export function useUpdateRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRoutineData }) =>
      routineService.updateRoutine(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.details() });
      toast.success("Routine updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update routine");
    },
  });
}

export function useDeleteRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => routineService.deleteRoutine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.details() });
      toast.success("Routine deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete routine");
    },
  });
}

export function useToggleRoutineActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      routineService.toggleActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.details() });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to toggle routine status");
    },
  });
}
