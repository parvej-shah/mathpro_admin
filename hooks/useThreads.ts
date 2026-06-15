import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  threadService,
  type CreateSubDiscussionData,
} from "@/services/thread.service";
import { toast } from "sonner";

const QUERY_KEYS = {
  all: ["threads"] as const,
  lists: () => [...QUERY_KEYS.all, "list"] as const,
  subDiscussions: (threadId: number) =>
    [...QUERY_KEYS.all, "sub-discussions", threadId] as const,
};

export function useThreads(limit?: number, offset?: number) {
  return useQuery({
    queryKey: [...QUERY_KEYS.lists(), limit, offset],
    queryFn: () => threadService.getAllThreads(limit, offset),
  });
}

export function useSubDiscussions(threadId: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.subDiscussions(threadId!),
    queryFn: () => threadService.getSubDiscussions(threadId!),
    enabled: !!threadId,
    // Removed refetchInterval to prevent auto-refresh
    // If real-time updates are needed, use WebSockets or manual refetch on user action
  });
}

export function useCreateSubDiscussion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      threadId,
      data,
    }: {
      threadId: number;
      data: CreateSubDiscussionData;
    }) => threadService.createSubDiscussion(threadId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.subDiscussions(variables.threadId),
      });
      toast.success("Response sent successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send response");
    },
  });
}

export function useDeleteThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => threadService.deleteThread(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success("Thread deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete thread");
    },
  });
}

export function useDeleteSubDiscussion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, threadId }: { id: number; threadId: number }) =>
      threadService.deleteSubDiscussion(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.subDiscussions(variables.threadId),
      });
      toast.success("Response deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete response");
    },
  });
}
