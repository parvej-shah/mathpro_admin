import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  afterMessageService,
  type CreateAfterMessageData,
  type UpdateAfterMessageData,
} from "@/services/after-message.service";
import { toast } from "sonner";

const QUERY_KEYS = {
  all: ["after-messages"] as const,
  lists: () => [...QUERY_KEYS.all, "list"] as const,
  details: () => [...QUERY_KEYS.all, "detail"] as const,
  detail: (id: number) => [...QUERY_KEYS.details(), id] as const,
};

export function useAfterMessages() {
  return useQuery({
    queryKey: QUERY_KEYS.lists(),
    queryFn: () => afterMessageService.getAllMessages(),
  });
}

export function useCreateAfterMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAfterMessageData) =>
      afterMessageService.createMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success("Message created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create message");
    },
  });
}

export function useUpdateAfterMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateAfterMessageData;
    }) => afterMessageService.updateMessage(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.detail(variables.id),
      });
      toast.success("Message updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update message");
    },
  });
}

export function useDeleteAfterMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => afterMessageService.deleteMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success("Message deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete message");
    },
  });
}
