import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  featuredItemService,
  type CreateFeaturedItemData,
  type FeaturedItem,
  type FeaturedItemType,
  type ReorderFeaturedItemEntry,
} from "@/services/featured-item.service";

const QUERY_KEYS = {
  all: ["featured-items"] as const,
  list: () => [...QUERY_KEYS.all, "list"] as const,
};

export function useFeaturedItems() {
  return useQuery({
    queryKey: QUERY_KEYS.list(),
    queryFn: async () => {
      const response = await featuredItemService.getFeaturedItems();
      const payload = response.data;
      return Array.isArray(payload) ? (payload as FeaturedItem[]) : [];
    },
  });
}

export function useCreateFeaturedItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFeaturedItemData) =>
      featuredItemService.createFeaturedItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.list() });
      toast.success("Item added to the featured rail");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add featured item");
    },
  });
}

export function useUpdateFeaturedItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      item_type,
      item_id,
      ...data
    }: {
      item_type: FeaturedItemType;
      item_id: number;
      sort_order?: number;
      is_active?: boolean;
    }) => featuredItemService.updateFeaturedItem(item_type, item_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.list() });
      toast.success("Featured item updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update featured item");
    },
  });
}

export function useReorderFeaturedItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: ReorderFeaturedItemEntry[]) =>
      featuredItemService.reorderFeaturedItems(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.list() });
      toast.success("Featured order updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reorder featured items");
    },
  });
}

export function useDeleteFeaturedItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ item_type, item_id }: { item_type: FeaturedItemType; item_id: number }) =>
      featuredItemService.deleteFeaturedItem(item_type, item_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.list() });
      toast.success("Item removed from the featured rail");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove featured item");
    },
  });
}
