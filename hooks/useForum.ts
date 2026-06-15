import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  forumService,
  type CreateResponseData,
} from "@/services/forum.service";
import { toast } from "sonner";

const QUERY_KEYS = {
  all: ["forum"] as const,
  issues: () => [...QUERY_KEYS.all, "issues"] as const,
  responses: (issueId: number) =>
    [...QUERY_KEYS.all, "responses", issueId] as const,
};

export function usePendingIssues() {
  return useQuery({
    queryKey: QUERY_KEYS.issues(),
    queryFn: () => forumService.getAllPendingIssues(),
  });
}

export function useIssueResponses(issueId: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.responses(issueId!),
    queryFn: () => forumService.getIssueResponses(issueId!),
    enabled: !!issueId,
    // Removed refetchInterval to prevent auto-refresh
    // If real-time updates are needed, use WebSockets or manual refetch on user action
  });
}

export function useCreateResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      issueId,
      data,
    }: {
      issueId: number;
      data: CreateResponseData;
    }) => forumService.createResponse(issueId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.responses(variables.issueId),
      });
      toast.success("Response sent successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send response");
    },
  });
}

export function useResolveIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (issueId: number) => forumService.resolveIssue(issueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.issues() });
      toast.success("Issue resolved successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to resolve issue");
    },
  });
}
