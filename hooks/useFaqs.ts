import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  faqService,
  type CreateFaqData,
  type PublicFaq,
  type UpdateFaqData,
} from "@/services/faq.service";

const QUERY_KEYS = {
  all: ["faqs"] as const,
  lists: () => [...QUERY_KEYS.all, "list"] as const,
  detail: (id: number) => [...QUERY_KEYS.all, "detail", id] as const,
};

export function useFaqs() {
  return useQuery({
    queryKey: QUERY_KEYS.lists(),
    queryFn: async () => {
      const response = await faqService.getFaqs();
      const payload = response.data;
      if (Array.isArray(payload)) return payload as PublicFaq[];
      return [];
    },
  });
}

export function useFaq(id: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id || 0),
    enabled: !!id,
    queryFn: async () => {
      const response = await faqService.getFaqById(id!);
      const payload = response.data;
      if (Array.isArray(payload)) return payload[0] ?? null;
      return (payload as PublicFaq) ?? null;
    },
  });
}

export function useCreateFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFaqData) => faqService.createFaq(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success("FAQ created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create FAQ");
    },
  });
}

export function useUpdateFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateFaqData) => faqService.updateFaq(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(variables.id) });
      toast.success("FAQ updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update FAQ");
    },
  });
}

export function useDeleteFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => faqService.deleteFaq(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success("FAQ deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete FAQ");
    },
  });
}

export function useReorderFaqs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (faqIdsInOrder: number[]) => {
      await Promise.all(
        faqIdsInOrder.map((id, index) =>
          faqService.updateFaq(id, { sort_order: index + 1 }),
        ),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success("FAQ order updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reorder FAQs");
    },
  });
}
