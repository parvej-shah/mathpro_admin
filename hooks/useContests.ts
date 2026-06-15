import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  contestService,
  type CreateContestData,
  type UpdateContestData,
} from "@/services/contest.service";
import { toast } from "sonner";

const QUERY_KEYS = {
  all: ["contests"] as const,
  lists: () => [...QUERY_KEYS.all, "list"] as const,
  list: (courseId?: number) => [...QUERY_KEYS.lists(), courseId] as const,
  details: () => [...QUERY_KEYS.all, "detail"] as const,
  detail: (id: number) => [...QUERY_KEYS.details(), id] as const,
  participants: (id: number) =>
    [...QUERY_KEYS.detail(id), "participants"] as const,
};

export function useContests(courseId?: number) {
  return useQuery({
    queryKey: QUERY_KEYS.list(courseId),
    queryFn: () => contestService.getAllContests(courseId),
  });
}

export function useContest(id: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id!),
    queryFn: () => contestService.getContest(id!),
    enabled: !!id,
  });
}

export function useCreateContest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      data,
    }: {
      courseId: number;
      data: CreateContestData;
    }) => contestService.createContest(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success("Contest created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create contest");
    },
  });
}

export function useUpdateContest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateContestData;
    }) => contestService.updateContest(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.detail(variables.id),
      });
      toast.success("Contest updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update contest");
    },
  });
}

export function useDeleteContest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => contestService.deleteContest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success("Contest deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete contest");
    },
  });
}

export function useContestParticipants(contestId: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.participants(contestId!),
    queryFn: () => contestService.getContestParticipants(contestId!),
    enabled: !!contestId,
  });
}

export function useAddContestParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contestId,
      userId,
    }: {
      contestId: number;
      userId: number;
    }) => contestService.addParticipant(contestId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.participants(variables.contestId),
      });
      toast.success("Participant added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add participant");
    },
  });
}

export function useRemoveContestParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contestId,
      userId,
    }: {
      contestId: number;
      userId: number;
    }) => contestService.removeParticipant(contestId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.participants(variables.contestId),
      });
      toast.success("Participant removed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove participant");
    },
  });
}
